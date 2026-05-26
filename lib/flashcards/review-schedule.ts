import type { ReviewRating, SavedWordStatus } from "@/lib/supabase/schema";

export const MIN_INTERVAL_DAYS = 1;
export const MAX_INTERVAL_DAYS = 90;
export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 3.0;
export const DEFAULT_EASE_FACTOR = 2.5;

const EASE_DELTA_HARD = -0.15;
const EASE_DELTA_EASY = 0.15;

export type FlashcardReviewState = {
  reviewCount: number;
  easeFactor: number;
  intervalDays: number;
};

export type ReviewSchedule = {
  nextReviewAt: string;
  flashcardDifficulty: number;
  savedWordStatus: SavedWordStatus;
  reviewCount: number;
  easeFactor: number;
  intervalDays: number;
  lastReviewedAt: string;
  feedbackMessage: string;
};

export function clampEaseFactor(value: number): number {
  return Math.min(MAX_EASE_FACTOR, Math.max(MIN_EASE_FACTOR, value));
}

export function clampIntervalDays(value: number): number {
  return Math.min(
    MAX_INTERVAL_DAYS,
    Math.max(MIN_INTERVAL_DAYS, Math.round(value))
  );
}

export function formatReviewFeedback(intervalDays: number): string {
  if (intervalDays <= 1) {
    return "Again tomorrow";
  }

  return `Next review in ${intervalDays} days`;
}

export function normalizeFlashcardReviewState(row: {
  review_count?: number | null;
  ease_factor?: number | null;
  interval_days?: number | null;
}): FlashcardReviewState {
  return {
    reviewCount: row.review_count ?? 0,
    easeFactor: clampEaseFactor(row.ease_factor ?? DEFAULT_EASE_FACTOR),
    intervalDays: Math.max(0, row.interval_days ?? 0)
  };
}

export function scheduleReviewFromRating(
  rating: ReviewRating,
  state: FlashcardReviewState,
  now: Date = new Date()
): ReviewSchedule {
  const currentEase = clampEaseFactor(state.easeFactor);
  const isFirstReview = state.reviewCount === 0;

  let easeFactor = currentEase;
  let intervalDays: number;
  let savedWordStatus: SavedWordStatus;
  let flashcardDifficulty: number;

  switch (rating) {
    case "hard":
      easeFactor = clampEaseFactor(currentEase + EASE_DELTA_HARD);
      intervalDays = MIN_INTERVAL_DAYS;
      savedWordStatus = "learning";
      flashcardDifficulty = 1;
      break;
    case "good":
      intervalDays = isFirstReview
        ? 3
        : state.intervalDays * currentEase;
      intervalDays = clampIntervalDays(intervalDays);
      savedWordStatus = "reviewing";
      flashcardDifficulty = 3;
      break;
    case "easy":
      easeFactor = clampEaseFactor(currentEase + EASE_DELTA_EASY);
      intervalDays = isFirstReview
        ? 7
        : state.intervalDays * currentEase * 1.5;
      intervalDays = clampIntervalDays(intervalDays);
      savedWordStatus = "mastered";
      flashcardDifficulty = 5;
      break;
  }

  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + intervalDays);

  return {
    nextReviewAt: next.toISOString(),
    flashcardDifficulty,
    savedWordStatus,
    reviewCount: state.reviewCount + 1,
    easeFactor,
    intervalDays,
    lastReviewedAt: now.toISOString(),
    feedbackMessage: formatReviewFeedback(intervalDays)
  };
}
