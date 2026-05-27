import type { ValidatedAiExplanation } from "./openai-response";

export function isPersistableAiExplanation(data: ValidatedAiExplanation): boolean {
  return Boolean(
    data.word.trim() &&
      data.definition.trim() &&
      data.contextual_meaning.trim()
  );
}
