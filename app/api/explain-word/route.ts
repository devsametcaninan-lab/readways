import { explanationProductEventName } from "@/lib/analytics/explanation-event";
import { trackEvent } from "@/lib/analytics/track-event";
import { createClient } from "@/lib/supabase/server";
import { aiExplanationToPayload } from "@/lib/ai-dictionary/ai-payload";
import {
  cachedExplanationToPayload,
  findCachedWordExplanation
} from "@/lib/ai-dictionary/cache";
import { documentBelongsToUser } from "@/lib/ai-dictionary/document-ownership";
import { getDocumentLanguageForUser } from "@/lib/documents/document-language";
import { jsonError, jsonExplainWord, jsonRateLimited } from "@/lib/ai-dictionary/http";
import { generateExplanationWithOpenAI } from "@/lib/ai-dictionary/openai";
import { normalizeWord } from "@/lib/ai-dictionary/normalize-word";
import { insertWordExplanation } from "@/lib/ai-dictionary/save-explanation";
import { createSentenceHash } from "@/lib/ai-dictionary/sentence-hash";
import {
  checkExplanationAllowance,
  getExplanationUsageSnapshot,
  getUserPlan,
  incrementExplanationUsage
} from "@/lib/ai-dictionary/usage";
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

    const { word, sentence, documentId } = validation.data;
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

    const language = await getDocumentLanguageForUser({
      supabase,
      documentId,
      userId: user.id
    });

    const plan = await getUserPlan(supabase, user.id);
    const sentenceHash = createSentenceHash(sentence);

    const cached = await findCachedWordExplanation({
      supabase,
      userId: user.id,
      documentId,
      word: normalizedWord,
      sentenceHash
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
        metadata: {
          documentId,
          language,
          explanationKind: explanationProductEventName(word)
        }
      });

      trackEvent({
        supabase,
        userId: user.id,
        eventName: explanationProductEventName(word),
        metadata: { documentId, language, source: "cache" }
      });

      return jsonExplainWord({
        ...cachedExplanationToPayload(cached),
        usage
      });
    }

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
          language,
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
          language,
          plan,
          used: allowance.usage.used,
          limit: allowance.usage.limit
        }
      });

      return jsonRateLimited(allowance.message, allowance.usage, {
        title: allowance.title
      });
    }

    const aiResult = await generateExplanationWithOpenAI({
      word,
      sentence,
      language
    });

    if (!aiResult.ok) {
      trackEvent({
        supabase,
        userId: user.id,
        eventName: "ai_error",
        metadata: {
          documentId,
          language,
          reason: aiResult.reason
        }
      });

      if (aiResult.reason === "not_configured") {
        return jsonError(
          503,
          "Word explanations are temporarily unavailable. Please try again later."
        );
      }

      if (aiResult.reason === "invalid_response") {
        return jsonError(
          502,
          "Could not understand the explanation response. Please try again."
        );
      }

      return jsonError(502, "Could not generate explanation. Please try again.");
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
      language
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
      metadata: {
        documentId,
        language,
        explanationKind: explanationProductEventName(word)
      }
    });

    trackEvent({
      supabase,
      userId: user.id,
      eventName: explanationProductEventName(word),
      metadata: { documentId, language, source: "ai" }
    });

    return jsonExplainWord({
      ...aiExplanationToPayload({
        ai: aiResult.data,
        sentence,
        language,
        displayWord,
        wordExplanationId
      }),
      usage: usageAfter
    });
  } catch {
    return jsonError(500, "Something went wrong. Please try again.");
  }
}
