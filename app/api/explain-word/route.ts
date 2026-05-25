import { createClient } from "@/lib/supabase/server";
import {
  cachedExplanationToPayload,
  findCachedWordExplanation
} from "@/lib/ai-dictionary/cache";
import { documentBelongsToUser } from "@/lib/ai-dictionary/document-ownership";
import { jsonError, jsonExplainWord, jsonRateLimited } from "@/lib/ai-dictionary/http";
import { buildMockExplanation } from "@/lib/ai-dictionary/mock";
import { normalizeWord } from "@/lib/ai-dictionary/normalize-word";
import { createSentenceHash } from "@/lib/ai-dictionary/sentence-hash";
import {
  checkExplanationAllowance,
  getExplanationUsageSnapshot,
  getUserPlan,
  incrementExplanationUsage
} from "@/lib/ai-dictionary/usage";
import { validateExplainWordRequest } from "@/lib/ai-dictionary/validate";

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

    const { word, sentence, documentId, language } = validation.data;
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
      return jsonRateLimited(allowance.message, allowance.usage);
    }

    const mock = buildMockExplanation({
      word: normalizedWord,
      sentence,
      language
    });

    const usageAfter = await incrementExplanationUsage({
      supabase,
      userId: user.id,
      plan
    });

    if (!usageAfter) {
      return jsonError(500, "Could not update usage. Please try again.");
    }

    return jsonExplainWord({
      ...mock,
      usage: usageAfter
    });
  } catch {
    return jsonError(500, "Something went wrong. Please try again.");
  }
}
