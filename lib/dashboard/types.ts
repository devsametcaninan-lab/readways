export type DashboardStats = {
  documentsCount: number;
  documentsReadyCount: number;
  savedWordsCount: number;
  flashcardsCount: number;
  flashcardsDueCount: number;
  reviewsCount: number;
  positiveReviewsCount: number;
  masteredWordsCount: number;
};

export type DashboardProgressStat = {
  label: string;
  value: string;
  sub: string;
};

export type DashboardSavedWordPreview = {
  id: string;
  word: string;
  meaning: string;
};

export type DashboardDueFlashcardPreview = {
  id: string;
  word: string;
  context: string;
  dueLabel: string;
  nextReviewAt: string | null;
};

export type DashboardData = {
  stats: DashboardStats;
  progressStats: DashboardProgressStat[];
  savedWordPreviews: DashboardSavedWordPreview[];
  dueFlashcardPreviews: DashboardDueFlashcardPreview[];
  isNewUser: boolean;
};
