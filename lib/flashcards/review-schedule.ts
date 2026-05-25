import type { ReviewRating, SavedWordStatus } from "@/lib/supabase/schema";

export type ReviewSchedule = {
  nextReviewAt: string;
  flashcardDifficulty: number;
  savedWordStatus: SavedWordStatus;
};

export function scheduleReviewFromRating(
  rating: ReviewRating,
  now: Date = new Date()
): ReviewSchedule {
  const next = new Date(now);

  switch (rating) {
    case "hard":
      next.setUTCDate(next.getUTCDate() + 1);
      return {
        nextReviewAt: next.toISOString(),
        flashcardDifficulty: 1,
        savedWordStatus: "learning"
      };
    case "good":
      next.setUTCDate(next.getUTCDate() + 3);
      return {
        nextReviewAt: next.toISOString(),
        flashcardDifficulty: 3,
        savedWordStatus: "reviewing"
      };
    case "easy":
      next.setUTCDate(next.getUTCDate() + 7);
      return {
        nextReviewAt: next.toISOString(),
        flashcardDifficulty: 5,
        savedWordStatus: "mastered"
      };
  }
}
