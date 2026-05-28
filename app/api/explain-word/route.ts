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

type ExplainTimingBreakdown = {
  totalMs: number;
  cacheLookupMs?: number;
  usageSnapshotMs?: number;
  allowanceMs?: number;
  openAiMs?: number;
  insertMs?: number;
  usageIncrementMs?: number;
};

function roundedMs(value: number | undefined): number | undefined {
  if (value == null || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.round(value));
}

function withTimingHeaders<T>(
  response: Response,
  cacheStatus: "hit" | "miss",
  timing: ExplainTimingBreakdown
): Response {
  response.headers.set("X-ReadWays-Cache", cacheStatus);

  const totalMs = roundedMs(timing.totalMs) ?? 0;
  response.headers.set("X-ReadWays-Timing-Total-Ms", String(totalMs));

  const headerParts = [`total;dur=${totalMs}`];
  const map: Array<[string, number | undefined]> = [
    ["cache_lookup", timing.cacheLookupMs],
    ["usage_snapshot", timing.usageSnapshotMs],
    ["allowance", timing.allowanceMs],
    ["openai", timing.openAiMs],
    ["insert", timing.insertMs],
    ["usage_increment", timing.usageIncrementMs]
  ];

  for (const [name, value] of map) {
    const ms = roundedMs(value);
    if (ms == null) {
      continue;
    }
    response.headers.set(`X-ReadWays-Timing-${name}-Ms`, String(ms));
    headerParts.push(`${name};dur=${ms}`);
  }

  response.headers.set("Server-Timing", headerParts.join(", "));
  return response;
}

export async function POST(request: Request) {
  try {
    const routeStartedAt = performance.now();
    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError(401, "Authentication required.");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "Invalid JSON body.");
    }

    const validation = validateExplainWordRequest(body);
    if (!validation.ok) {
      return jsonError(400, validation.error);
    }

    const { word, sentence, documentId, explanationLanguagePreference } = validation.data;
    const normalizedWord = normalizeWord(word);

    if (!normalizedWord) {
      return jsonError(400, "word is required.");
    }

    const ownsDocument = await documentBelongsToUser(
      supabase,
      documentId,
      user.id
    );

    if (!ownsDocument) {
      return jsonError(403, "You do not have access to this document.");
    }

    const documentLanguage = await getDocumentLanguageForUser({
      supabase,
      documentId,
      userId: user.id
    });

    const explanationLanguage = resolveFinalExplanationLanguage(
      explanationLanguagePreference,
      documentLanguage
    );

    const explanationKind = explanationProductEventName(word);
    const requestStartedAt = Date.now();

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

      return withTimingHeaders(
        jsonExplainWord({
          ...cachedExplanationToPayload(cached),
          usage
        }),
        "hit",
        {
          totalMs: performance.now() - routeStartedAt,
          cacheLookupMs,
          usageSnapshotMs
        }
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

      return withTimingHeaders(
        jsonRateLimited(allowance.message, allowance.usage, {
          title: allowance.title
        }),
        "miss",
        {
          totalMs: performance.now() - routeStartedAt,
          cacheLookupMs,
          allowanceMs
        }
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

      if (aiResult.reason === "not_configured") {
        return withTimingHeaders(
          jsonError(
            503,
            "Word explanations are temporarily unavailable. Please try again later."
          ),
          "miss",
          {
            totalMs: performance.now() - routeStartedAt,
            cacheLookupMs,
            allowanceMs,
            openAiMs: generationDurationMs
          }
        );
      }

      if (aiResult.reason === "timeout") {
        return withTimingHeaders(
          jsonError(
            504,
            "Explanation took too long. Please try again."
          ),
          "miss",
          {
            totalMs: performance.now() - routeStartedAt,
            cacheLookupMs,
            allowanceMs,
            openAiMs: generationDurationMs
          }
        );
      }

      if (
        aiResult.reason === "invalid_response" ||
        aiResult.reason === "empty_response"
      ) {
        return withTimingHeaders(
          jsonError(
            502,
            "Could not understand the explanation response. Please try again."
          ),
          "miss",
          {
            totalMs: performance.now() - routeStartedAt,
            cacheLookupMs,
            allowanceMs,
            openAiMs: generationDurationMs
          }
        );
      }

      return withTimingHeaders(
        jsonError(502, "Could not generate explanation. Please try again."),
        "miss",
        {
          totalMs: performance.now() - routeStartedAt,
          cacheLookupMs,
          allowanceMs,
          openAiMs: generationDurationMs
        }
      );
    }

    if (!isPersistableAiExplanation(aiResult.data)) {
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

      return withTimingHeaders(
        jsonError(
          502,
          "Could not understand the explanation response. Please try again."
        ),
        "miss",
        {
          totalMs: performance.now() - routeStartedAt,
          cacheLookupMs,
          allowanceMs,
          openAiMs: generationDurationMs
        }
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
      return withTimingHeaders(
        jsonError(500, "Could not save explanation. Please try again."),
        "miss",
        {
          totalMs: performance.now() - routeStartedAt,
          cacheLookupMs,
          allowanceMs,
          openAiMs: generationDurationMs,
          insertMs
        }
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
      return withTimingHeaders(
        jsonError(500, "Could not update usage. Please try again."),
        "miss",
        {
          totalMs: performance.now() - routeStartedAt,
          cacheLookupMs,
          allowanceMs,
          openAiMs: generationDurationMs,
          insertMs,
          usageIncrementMs
        }
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

    return withTimingHeaders(
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
      {
        totalMs: performance.now() - routeStartedAt,
        cacheLookupMs,
        allowanceMs,
        openAiMs: generationDurationMs,
        insertMs,
        usageIncrementMs
      }
    );
  } catch (error) {
    return handleRouteError("POST /api/explain-word", error);
  }
}
