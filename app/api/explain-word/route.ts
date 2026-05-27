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

export async function POST(request: Request) {
  try {
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

    const cached = await findCachedWordExplanation({
      supabase,
      userId: user.id,
      documentId,
      word: normalizedWord,
      sentenceHash,
      explanationLanguage
    });

    if (cached) {
      const usage = await getExplanationUsageSnapshot({
        supabase,
        userId: user.id,
        plan
      });

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
          durationMs: Date.now() - requestStartedAt
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

      return jsonExplainWord({
        ...cachedExplanationToPayload(cached),
        usage
      });
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
        sentence
      })
    });

    const allowance = await checkExplanationAllowance({
      supabase,
      userId: user.id,
      plan
    });

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

      return jsonRateLimited(allowance.message, allowance.usage, {
        title: allowance.title
      });
    }

    const generationStartedAt = Date.now();

    const aiResult = await generateExplanationWithOpenAI({
      word,
      sentence,
      documentLanguage,
      explanationLanguage
    });

    const generationDurationMs = Date.now() - generationStartedAt;

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
        return jsonError(
          503,
          "Word explanations are temporarily unavailable. Please try again later."
        );
      }

      if (aiResult.reason === "timeout") {
        return jsonError(
          504,
          "Explanation took too long. Please try again."
        );
      }

      if (
        aiResult.reason === "invalid_response" ||
        aiResult.reason === "empty_response"
      ) {
        return jsonError(
          502,
          "Could not understand the explanation response. Please try again."
        );
      }

      return jsonError(502, "Could not generate explanation. Please try again.");
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

      return jsonError(
        502,
        "Could not understand the explanation response. Please try again."
      );
    }

    const displayWord = cleanDisplayWord(aiResult.data.word) || cleanDisplayWord(word);

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

    if (!wordExplanationId) {
      return jsonError(500, "Could not save explanation. Please try again.");
    }

    const usageAfter = await incrementExplanationUsage({
      supabase,
      userId: user.id,
      plan
    });

    if (!usageAfter) {
      return jsonError(500, "Could not update usage. Please try again.");
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

    return jsonExplainWord({
      ...aiExplanationToPayload({
        ai: aiResult.data,
        sentence,
        language: explanationLanguage,
        displayWord,
        wordExplanationId
      }),
      usage: usageAfter
    });
  } catch (error) {
    return handleRouteError("POST /api/explain-word", error);
  }
}
