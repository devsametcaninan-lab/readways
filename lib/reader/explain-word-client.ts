import type { ApiErrorBody, ExplainWordPayload } from "@/lib/ai-dictionary/types";

export type WordClickPayload = {
  rawWord: string;
  normalizedWord: string;
  sentence: string;
  highlightKey: string;
};

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
  language?: string;
  signal?: AbortSignal;
}): Promise<ExplainWordPayload> {
  const response = await fetch("/api/explain-word", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal: params.signal,
    body: JSON.stringify({
      word: params.word,
      sentence: params.sentence,
      documentId: params.documentId,
      language: params.language ?? "en"
    })
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(body?.error ?? "Could not load word explanation.");
  }

  return response.json() as Promise<ExplainWordPayload>;
}

export function explainWordPayloadToPanelFields(payload: ExplainWordPayload): {
  word: string;
  pronunciation: string;
  definition: string;
  contextMeaning: string;
  sentence: string;
  explanationSource: ExplainWordPayload["source"];
} {
  return {
    word: payload.word,
    pronunciation: payload.pronunciation,
    definition: payload.definition,
    contextMeaning: payload.contextual_meaning,
    sentence: payload.sentence,
    explanationSource: payload.source
  };
}
