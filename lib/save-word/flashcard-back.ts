export function buildFlashcardBack(params: {
  definition: string;
  contextual_meaning: string;
  sentence: string;
}): string {
  const { definition, contextual_meaning, sentence } = params;

  return [definition, contextual_meaning, `"${sentence}"`].join("\n\n");
}

/** Initial SM-2-style bucket: 1 = learning / new card */
export const INITIAL_FLASHCARD_DIFFICULTY = 1;
