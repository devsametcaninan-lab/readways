import * as Sentry from "@sentry/nextjs";
import { explanationProductEventName } from "@/lib/analytics/explanation-event";
import { trackEvent } from "@/lib/analytics/track-event";
import { buildAiUsageMetadata } from "@/lib/ai-monitoring/metadata";
import { createClient } from "@/lib/supabase/server";
import { aiExplanationToPayload } from "@/lib/ai-dictionary/ai-payload";
import {
  cachedExplanationToPayload,
  findCachedWordExplanation
} from "@/lib/ai-dictionary/cache";
import { documentBelongsToUser } from "@/lib/ai-dictionary/document-ownership";
import { getDocumentLanguageForUser } from "@/lib/documents/document-language";
import { handleRouteError } from "@/lib/api/route-error";
import { jsonError, jsonExplainWord, jsonRateLimited } from "@/lib/ai-dictionary/http";
import { generateExplanationWithOpenAI } from "@/lib/ai-dictionary/openai";
import { normalizeWord } from "@/lib/ai-dictionary/normalize-word";
import { insertWordExplanation } from "@/lib/ai-dictionary/save-explanation";
import { isPersistableAiExplanation } from "@/lib/ai-dictionary/validate-persisted-explanation";
import { createSentenceHash } from "@/lib/ai-dictionary/sentence-hash";
import {
  checkExplanationAllowance,
  getExplanationUsageSnapshot,
  getUserPlan,
  incrementExplanationUsage
} from "@/lib/ai-dictionary/usage";
import { resolveFinalExplanationLanguage } from "@/lib/ai-dictionary/explanation-language";
import { validateExplainWordRequest } from "@/lib/ai-dictionary/validate";
import { cleanDisplayWord } from "@/lib/reader/text-tokens";
import {
  logExplainApiTiming,
  roundedMs,
  withTimingHeaders,
  type ExplainApiTimingBreakdown
} from "@/lib/explain-word/timing";

function buildApiTiming(
  routeStartedAt: number,
  partial: Omit<ExplainApiTimingBreakdown, "totalMs">
): ExplainApiTimingBreakdown {
  return {
    ...partial,
    totalMs: performance.now() - routeStartedAt
  };
}

function logAndReturn(
  response: Response,
  cacheStatus: "hit" | "miss",
  timing: ExplainApiTimingBreakdown,
  meta: {
    documentId: string;
    wordLength: number;
    sentenceLength: number;
    explanationKind: "word" | "phrase";
  }
): Response {
  logExplainApiTiming(cacheStatus, timing, meta);
  return withTimingHeaders(response, cacheStatus, timing);
}

export async function POST(request: Request) {
  try {
    const routeStartedAt = performance.now();
    const supabase = await createClient();

    const authStartedAt = performance.now();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    const authMs = performance.now() - authStartedAt;

    if (authError || !user) {
      return jsonError(401, "Authentication required.");
    }

    const parseBodyStartedAt = performance.now();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "Invalid JSON body.");
    }
    const parseBodyMs = performance.now() - parseBodyStartedAt;

    const validationStartedAt = performance.now();
    const validation = validateExplainWordRequest(body);
    if (!validation.ok) {
      return jsonError(400, validation.error);
    }

    const { word, sentence, documentId, explanationLanguagePreference } = validation.data;
    const normalizedWord = normalizeWord(word);

    if (!normalizedWord) {
      return jsonError(400, "word is required.");
    }
    const validationMs = performance.now() - validationStartedAt;

    const documentOwnershipStartedAt = performance.now();
    const ownsDocument = await documentBelongsToUser(
      supabase,
      documentId,
      user.id
    );
    const documentOwnershipMs = performance.now() - documentOwnershipStartedAt;

    if (!ownsDocument) {
      return jsonError(403, "You do not have access to this document.");
    }

    const documentLanguageStartedAt = performance.now();
    const documentLanguage = await getDocumentLanguageForUser({
      supabase,
      documentId,
      userId: user.id
    });
    const documentLanguageMs = performance.now() - documentLanguageStartedAt;

    const explanationLanguage = resolveFinalExplanationLanguage(
      explanationLanguagePreference,
      documentLanguage
    );

    const explanationKind = explanationProductEventName(word);
    const requestStartedAt = Date.now();
    const timingMeta = {
      documentId,
      wordLength: word.length,
      sentenceLength: sentence.length,
      explanationKind: (explanationKind === "phrase_explained" ? "phrase" : "word") as
        | "word"
        | "phrase"
    };
    const sharedTiming = {
      authMs,
      parseBodyMs,
      validationMs,
      documentOwnershipMs,
      documentLanguageMs
    };

    const plan = await getUserPlan(supabase, user.id);
    const sentenceHash = createSentenceHash(sentence);

    const cacheLookupStartedAt = performance.now();
    const cached = await findCachedWordExplanation({
      supabase,
      userId: user.id,
      documentId,
      word: normalizedWord,
      sentenceHash,
      explanationLanguage
    });
    const cacheLookupMs = performance.now() - cacheLookupStartedAt;

    if (cached) {
      const usageSnapshotStartedAt = performance.now();
      const usage = await getExplanationUsageSnapshot({
        supabase,
        userId: user.id,
        plan
      });
      const usageSnapshotMs = performance.now() - usageSnapshotStartedAt;

      trackEvent({
        supabase,
        userId: user.id,
        eventName: "ai_cache_hit",
        metadata: buildAiUsageMetadata({
          documentId,
          documentLanguage,
          explanationLanguage,
          explanationKind,
          cacheStatus: "hit",
          durationMs: Date.now() - requestStartedAt,
          cacheLookupMs: roundedMs(cacheLookupMs),
          usageSnapshotMs: roundedMs(usageSnapshotMs)
        })
      });

      trackEvent({
        supabase,
        userId: user.id,
        eventName: explanationProductEventName(word),
        metadata: {
          documentId,
          documentLanguage,
          explanationLanguage,
          source: "cache"
        }
      });

      return logAndReturn(
        jsonExplainWord({
          ...cachedExplanationToPayload(cached),
          usage
        }),
        "hit",
        buildApiTiming(routeStartedAt, {
          ...sharedTiming,
          cacheLookupMs,
          usageSnapshotMs
        }),
        timingMeta
      );
    }

    trackEvent({
      supabase,
      userId: user.id,
      eventName: "ai_cache_miss",
      metadata: buildAiUsageMetadata({
        documentId,
        documentLanguage,
        explanationLanguage,
        explanationKind,
        cacheStatus: "miss",
        word,
        sentence,
        cacheLookupMs: roundedMs(cacheLookupMs)
      })
    });

    const allowanceStartedAt = performance.now();
    const allowance = await checkExplanationAllowance({
      supabase,
      userId: user.id,
      plan
    });
    const allowanceMs = performance.now() - allowanceStartedAt;

    if (!allowance.allowed) {
      trackEvent({
        supabase,
        userId: user.id,
        eventName: "limit_reached",
        metadata: {
          feature: "ai_explanation",
          documentId,
          documentLanguage,
          explanationLanguage,
          plan,
          used: allowance.usage.used,
          limit: allowance.usage.limit
        }
      });

      trackEvent({
        supabase,
        userId: user.id,
        eventName: "ai_limit_reached",
        metadata: {
          documentId,
          documentLanguage,
          explanationLanguage,
          plan,
          used: allowance.usage.used,
          limit: allowance.usage.limit
        }
      });

      return logAndReturn(
        jsonRateLimited(allowance.message, allowance.usage, {
          title: allowance.title
        }),
        "miss",
        buildApiTiming(routeStartedAt, {
          ...sharedTiming,
          cacheLookupMs,
          allowanceMs
        }),
        timingMeta
      );
    }

    const generationStartedAt = performance.now();

    const aiResult = await generateExplanationWithOpenAI({
      word,
      sentence,
      documentLanguage,
      explanationLanguage
    });

    const generationDurationMs = performance.now() - generationStartedAt;

    if (!aiResult.ok) {
      const failureEvent =
        aiResult.reason === "timeout"
          ? "ai_timeout"
          : aiResult.reason === "invalid_response" || aiResult.reason === "empty_response"
            ? "ai_invalid_response"
            : "ai_error";

      const failureMetadata = buildAiUsageMetadata({
        documentId,
        documentLanguage,
        explanationLanguage,
        explanationKind,
        cacheStatus: "miss",
        durationMs: generationDurationMs,
        word,
        sentence,
        reason: aiResult.reason
      });

      trackEvent({
        supabase,
        userId: user.id,
        eventName: failureEvent,
        metadata: failureMetadata
      });

      trackEvent({
        supabase,
        userId: user.id,
        eventName: "ai_generation_failed",
        metadata: failureMetadata
      });

      Sentry.captureMessage("AI explanation generation failed", {
        level: aiResult.reason === "timeout" ? "warning" : "error",
        tags: {
          area: "ai-explain",
          reason: aiResult.reason
        },
        extra: {
          documentLanguage,
          explanationLanguage
        }
      });

      const missGenerationTiming = (extra?: Partial<ExplainApiTimingBreakdown>) =>
        buildApiTiming(routeStartedAt, {
          ...sharedTiming,
          cacheLookupMs,
          allowanceMs,
          openAiMs: generationDurationMs,
          ...extra
        });

      if (aiResult.reason === "not_configured") {
        return logAndReturn(
          jsonError(
            503,
            "Word explanations are temporarily unavailable. Please try again later."
          ),
          "miss",
          missGenerationTiming(),
          timingMeta
        );
      }

      if (aiResult.reason === "timeout") {
        return logAndReturn(
          jsonError(
            504,
            "Explanation took too long. Please try again."
          ),
          "miss",
          missGenerationTiming(),
          timingMeta
        );
      }

      if (
        aiResult.reason === "invalid_response" ||
        aiResult.reason === "empty_response"
      ) {
        return logAndReturn(
          jsonError(
            502,
            "Could not understand the explanation response. Please try again."
          ),
          "miss",
          missGenerationTiming(),
          timingMeta
        );
      }

      return logAndReturn(
        jsonError(502, "Could not generate explanation. Please try again."),
        "miss",
        missGenerationTiming(),
        timingMeta
      );
    }

    const aiValidationStartedAt = performance.now();
    const persistable = isPersistableAiExplanation(aiResult.data);
    const aiValidationMs = performance.now() - aiValidationStartedAt;

    if (!persistable) {
      const incompleteMetadata = buildAiUsageMetadata({
        documentId,
        documentLanguage,
        explanationLanguage,
        explanationKind,
        cacheStatus: "miss",
        durationMs: generationDurationMs,
        word,
        sentence,
        reason: "incomplete_fields"
      });

      trackEvent({
        supabase,
        userId: user.id,
        eventName: "ai_invalid_response",
        metadata: incompleteMetadata
      });

      trackEvent({
        supabase,
        userId: user.id,
        eventName: "ai_generation_failed",
        metadata: incompleteMetadata
      });

      Sentry.captureMessage("AI explanation response incomplete", {
        level: "warning",
        tags: { area: "ai-explain", reason: "incomplete_fields" },
        extra: {
          documentLanguage,
          explanationLanguage
        }
      });

      return logAndReturn(
        jsonError(
          502,
          "Could not understand the explanation response. Please try again."
        ),
        "miss",
        buildApiTiming(routeStartedAt, {
          ...sharedTiming,
          cacheLookupMs,
          allowanceMs,
          openAiMs: generationDurationMs,
          aiValidationMs
        }),
        timingMeta
      );
    }

    const displayWord = cleanDisplayWord(aiResult.data.word) || cleanDisplayWord(word);

    const insertStartedAt = performance.now();
    const wordExplanationId = await insertWordExplanation({
      supabase,
      userId: user.id,
      documentId,
      word: normalizedWord,
      sentence,
      sentenceHash,
      definition: aiResult.data.definition,
      contextual_meaning: aiResult.data.contextual_meaning,
      pronunciation: aiResult.data.pronunciation,
      language: explanationLanguage
    });
    const insertMs = performance.now() - insertStartedAt;

    if (!wordExplanationId) {
      return logAndReturn(
        jsonError(500, "Could not save explanation. Please try again."),
        "miss",
        buildApiTiming(routeStartedAt, {
          ...sharedTiming,
          cacheLookupMs,
          allowanceMs,
          openAiMs: generationDurationMs,
          aiValidationMs,
          insertMs
        }),
        timingMeta
      );
    }

    const usageIncrementStartedAt = performance.now();
    const usageAfter = await incrementExplanationUsage({
      supabase,
      userId: user.id,
      plan
    });
    const usageIncrementMs = performance.now() - usageIncrementStartedAt;

    if (!usageAfter) {
      return logAndReturn(
        jsonError(500, "Could not update usage. Please try again."),
        "miss",
        buildApiTiming(routeStartedAt, {
          ...sharedTiming,
          cacheLookupMs,
          allowanceMs,
          openAiMs: generationDurationMs,
          aiValidationMs,
          insertMs,
          usageIncrementMs
        }),
        timingMeta
      );
    }

    trackEvent({
      supabase,
      userId: user.id,
      eventName: "ai_generated",
      metadata: buildAiUsageMetadata({
        documentId,
        documentLanguage,
        explanationLanguage,
        explanationKind,
        cacheStatus: "miss",
        durationMs: generationDurationMs,
        cacheLookupMs: roundedMs(cacheLookupMs),
        allowanceMs: roundedMs(allowanceMs),
        openAiMs: roundedMs(generationDurationMs),
        insertMs: roundedMs(insertMs),
        usageIncrementMs: roundedMs(usageIncrementMs),
        word,
        sentence,
        definition: aiResult.data.definition,
        contextualMeaning: aiResult.data.contextual_meaning,
        pronunciation: aiResult.data.pronunciation
      })
    });

    trackEvent({
      supabase,
      userId: user.id,
      eventName: explanationProductEventName(word),
      metadata: {
        documentId,
        documentLanguage,
        explanationLanguage,
        source: "ai"
      }
    });

    return logAndReturn(
      jsonExplainWord({
        ...aiExplanationToPayload({
          ai: aiResult.data,
          sentence,
          language: explanationLanguage,
          displayWord,
          wordExplanationId
        }),
        usage: usageAfter
      }),
      "miss",
      buildApiTiming(routeStartedAt, {
        ...sharedTiming,
        cacheLookupMs,
        allowanceMs,
        openAiMs: generationDurationMs,
        aiValidationMs,
        insertMs,
        usageIncrementMs
      }),
      timingMeta
    );
  } catch (error) {
    return handleRouteError("POST /api/explain-word", error);
  }
}
