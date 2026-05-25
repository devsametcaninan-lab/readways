import type { ExplainWordPayload } from "./types";
import type { ValidatedAiExplanation } from "./openai-response";

export function aiExplanationToPayload(params: {
  ai: ValidatedAiExplanation;
  sentence: string;
  language: string;
  displayWord: string;
}): ExplainWordPayload {
  const { ai, sentence, language, displayWord } = params;

  return {
    source: "ai",
    word: displayWord || ai.word,
    pronunciation: ai.pronunciation,
    definition: ai.definition,
    contextual_meaning: ai.contextual_meaning,
    sentence,
    language
  };
}
