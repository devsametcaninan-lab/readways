import type { ExplanationLanguagePreference } from "@/lib/ai-dictionary/explanation-language";
import type { DocumentLanguage } from "@/lib/language/document-language";
import type { WordToken } from "./text-tokens";
import type { ExplainLocalCache } from "./explain-local-cache";
import {
  explainWordRequestKey,
  fetchExplainWord,
} from "./explain-word-client";
import { resolveExplainIntoCache } from "./explain-fetch-coordinator";
import { isPrefetchableExplainWord } from "./explain-request";
import type { PreparedParagraph } from "./prepare-paragraphs";
import { extractSentence } from "./text-tokens";

export type ExplainPrefetchWordTarget = {
  requestKey: string;
  rawWord: string;
  normalizedWord: string;
  sentence: string;
};

export function buildParagraphPrefetchTargets(params: {
  paragraph: PreparedParagraph;
  documentId: string;
  explanationLanguage: string;
  cache: ExplainLocalCache;
}): ExplainPrefetchWordTarget[] {
  const { paragraph, documentId, explanationLanguage, cache } = params;
  const targets: ExplainPrefetchWordTarget[] = [];
  const seenKeys = new Set<string>();

  for (const token of paragraph.tokens) {
    if (token.type !== "word") {
      continue;
    }

    if (!isPrefetchableExplainWord(token.value)) {
      continue;
    }

    const sentence = extractSentence(paragraph.text, token.start);
    const requestKey = explainWordRequestKey(
      documentId,
      token.normalized,
      sentence,
      explanationLanguage,
      "word"
    );

    if (seenKeys.has(requestKey) || cache.get(requestKey)) {
      continue;
    }

    seenKeys.add(requestKey);
    targets.push({
      requestKey,
      rawWord: token.value,
      normalizedWord: token.normalized,
      sentence
    });
  }

  return targets;
}

export function buildPrefetchTargetFromToken(params: {
  paragraph: PreparedParagraph;
  token: WordToken;
  documentId: string;
  explanationLanguage: string;
  cache: ExplainLocalCache;
}): ExplainPrefetchWordTarget | null {
  if (!isPrefetchableExplainWord(params.token.value)) {
    return null;
  }

  const sentence = extractSentence(params.paragraph.text, params.token.start);
  const requestKey = explainWordRequestKey(
    params.documentId,
    params.token.normalized,
    sentence,
    params.explanationLanguage,
    "word"
  );

  if (params.cache.get(requestKey)) {
    return null;
  }

  return {
    requestKey,
    rawWord: params.token.value,
    normalizedWord: params.token.normalized,
    sentence
  };
}

export type ExplainPrefetchRunParams = {
  target: ExplainPrefetchWordTarget;
  documentId: string;
  documentLanguage: DocumentLanguage | string;
  explanationLanguagePreference: ExplanationLanguagePreference;
  cache: ExplainLocalCache;
  signal?: AbortSignal;
};

export async function runExplainPrefetchTarget(
  params: ExplainPrefetchRunParams
): Promise<"stored" | "skipped" | "rate_limited" | "failed"> {
  const {
    target,
    documentId,
    documentLanguage,
    explanationLanguagePreference,
    cache,
    signal
  } = params;

  if (cache.get(target.requestKey)) {
    return "skipped";
  }

  try {
    const entry = await resolveExplainIntoCache({
      requestKey: target.requestKey,
      cache,
      rawWord: target.rawWord,
      kind: "word",
      signal,
      fetchPayload: () =>
        fetchExplainWord({
          word: target.rawWord,
          sentence: target.sentence,
          documentId,
          documentLanguage,
          explanationLanguagePreference,
          signal
        })
    });

    if (signal?.aborted) {
      return "skipped";
    }

    return entry ? "stored" : "skipped";
  } catch (error) {
    if (signal?.aborted) {
      return "skipped";
    }

    const paywall =
      error instanceof Error && "paywall" in error
        ? (error as Error & { paywall?: unknown }).paywall
        : undefined;

    if (paywall) {
      return "rate_limited";
    }

    return "failed";
  }
}
