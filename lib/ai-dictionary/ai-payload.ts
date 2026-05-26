import type { ExplainWordPayload } from "./types";
import type { ValidatedAiExplanation } from "./openai-response";

export function aiExplanationToPayload(params: {
  ai: ValidatedAiExplanation;
  sentence: string;
  language: string;
  displayWord: string;
  wordExplanationId: string;
}): ExplainWordPayload {
  const { ai, sentence, language, displayWord, wordExplanationId } = params;

  return {
    source: "ai",
    wordExplanationId,
    word: displayWord || ai.word,
    pronunciation: ai.pronunciation,
    definition: ai.definition,
    contextual_meaning: ai.contextual_meaning,
    example_usage: ai.example_usage,
    difficulty: ai.difficulty,
    sentence,
    language
  };
}
