import {
  explanationLanguageDisplayLabel,
  parseExplanationLanguagePreference,
  type ExplanationLanguagePreference
} from "@/lib/ai-dictionary/explanation-language";
import {
  normalizeDocumentLanguage,
  type DocumentLanguage
} from "@/lib/language/document-language";
import { safeUserFacingMessage } from "@/lib/api/client-error";
import type { ApiErrorBody, ExplainWordPayload } from "@/lib/ai-dictionary/types";
import { parseExplainLimitPaywall } from "./explain-limit";

export type ExplainClickKind = "word" | "phrase";

export type ExplainClickPayload = {
  rawWord: string;
  normalizedWord: string;
  sentence: string;
  highlightKey: string;
  kind: ExplainClickKind;
};

/** @deprecated Use ExplainClickPayload */
export type WordClickPayload = ExplainClickPayload;

export function explainWordRequestKey(
  documentId: string,
  normalizedWord: string,
  sentence: string,
  explanationLanguage: string
): string {
  return `${documentId}:${normalizedWord}:${sentence.trim()}:${explanationLanguage}`;
}

export async function fetchExplainWord(params: {
  word: string;
  sentence: string;
  documentId: string;
  documentLanguage: DocumentLanguage | string;
  explanationLanguagePreference: ExplanationLanguagePreference;
  signal?: AbortSignal;
}): Promise<ExplainWordPayload> {
  const documentLanguage = normalizeDocumentLanguage(params.documentLanguage);
  const explanationLanguagePreference =
    parseExplanationLanguagePreference(params.explanationLanguagePreference) ??
    "same_as_document";

  const response = await fetch("/api/explain-word", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal: params.signal,
    body: JSON.stringify({
      word: params.word,
      sentence: params.sentence,
      documentId: params.documentId,
      documentLanguage,
      explanationLanguagePreference
    })
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    const paywall = parseExplainLimitPaywall(body);

    if (paywall) {
      const err = new Error(paywall.message) as Error & {
        paywall?: typeof paywall;
      };
      err.paywall = paywall;
      throw err;
    }

    throw new Error(
      safeUserFacingMessage(body?.error, "Could not load word explanation.")
    );
  }

  return response.json() as Promise<ExplainWordPayload>;
}

export type ExplainPanelFields = {
  wordExplanationId: string;
  word: string;
  pronunciation: string;
  definition: string;
  contextMeaning: string;
  exampleUsage?: string;
  difficulty?: string;
  sentence: string;
  explanationSource: ExplainWordPayload["source"];
  explanationLanguageLabel: string;
};

export function explainWordPayloadToPanelFields(
  payload: ExplainWordPayload
): ExplainPanelFields {
  return {
    wordExplanationId: payload.wordExplanationId,
    word: payload.word,
    pronunciation: payload.pronunciation,
    definition: payload.definition,
    contextMeaning: payload.contextual_meaning,
    exampleUsage: payload.example_usage,
    difficulty: payload.difficulty,
    sentence: payload.sentence,
    explanationSource: payload.source,
    explanationLanguageLabel: explanationLanguageDisplayLabel(payload.language)
  };
}
