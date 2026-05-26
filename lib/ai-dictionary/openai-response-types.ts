export const AI_DIFFICULTY_VALUES = ["beginner", "intermediate", "advanced"] as const;
export type AiDifficulty = (typeof AI_DIFFICULTY_VALUES)[number];

export type ValidatedAiExplanation = {
  word: string;
  pronunciation: string;
  definition: string;
  contextual_meaning: string;
  example_usage: string;
  difficulty: AiDifficulty;
};
