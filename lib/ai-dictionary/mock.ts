import type { ExplainWordPayload } from "./types";

export function buildMockExplanation(params: {
  word: string;
  sentence: string;
  language: string;
}): ExplainWordPayload {
  const { word, sentence, language } = params;

  return {
    source: "mock",
    word,
    pronunciation: "Coming soon",
    definition: "AI-powered definition will appear here.",
    contextual_meaning: "This word was selected from your document context.",
    sentence,
    language
  };
}
