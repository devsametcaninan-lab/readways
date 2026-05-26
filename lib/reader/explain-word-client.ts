import {
  normalizeDocumentLanguage,
  type DocumentLanguage
} from "@/lib/language/document-language";
import type { ApiErrorBody, ExplainWordPayload } from "@/lib/ai-dictionary/types";

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
  sentence: string
): string {
  return `${documentId}:${normalizedWord}:${sentence.trim()}`;
}

export async function fetchExplainWord(params: {
  word: string;
  sentence: string;
  documentId: string;
  language: DocumentLanguage | string;
  signal?: AbortSignal;
}): Promise<ExplainWordPayload> {
  const language = normalizeDocumentLanguage(params.language);

  const response = await fetch("/api/explain-word", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal: params.signal,
    body: JSON.stringify({
      word: params.word,
      sentence: params.sentence,
      documentId: params.documentId,
      language
    })
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(body?.error ?? "Could not load word explanation.");
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
    explanationSource: payload.source
  };
}
