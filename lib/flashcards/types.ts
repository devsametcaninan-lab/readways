export type FlashcardReviewItem = {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  contextualMeaning: string;
  contextSentence: string;
  source: string;
};

export type SessionStats = {
  dueToday: number;
  learning: number;
  mastered: number;
};
