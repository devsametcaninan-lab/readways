import type { ReviewRating } from "@/lib/supabase/schema";
import type { Flashcard } from "@/lib/supabase/types";
import type { SupabaseClient } from "@/lib/supabase/types";
import { scheduleReviewFromRating } from "./review-schedule";
import type { ReviewFlashcardResponse } from "./review-types";

type FlashcardOwnershipRow = {
  id: string;
  user_id: string;
  saved_word_id: string;
};

export type PersistFlashcardReviewResult =
  | { ok: true; response: ReviewFlashcardResponse }
  | { ok: false; reason: "not_found" | "db_error" };

export async function persistFlashcardReview(params: {
  supabase: SupabaseClient;
  userId: string;
  flashcardId: string;
  rating: ReviewRating;
}): Promise<PersistFlashcardReviewResult> {
  const { supabase, userId, flashcardId, rating } = params;

  const { data: flashcard, error: fetchError } = await supabase
    .from("flashcards")
    .select("id, user_id, saved_word_id")
    .eq("id", flashcardId)
    .maybeSingle();

  if (fetchError || !flashcard) {
    return { ok: false, reason: "not_found" };
  }

  const row = flashcard as FlashcardOwnershipRow;

  if (row.user_id !== userId) {
    return { ok: false, reason: "not_found" };
  }

  const schedule = scheduleReviewFromRating(rating);

  const { error: logError } = await supabase.from("review_logs").insert({
    user_id: userId,
    flashcard_id: flashcardId,
    rating
  });

  if (logError) {
    return { ok: false, reason: "db_error" };
  }

  const { data: updatedFlashcard, error: updateError } = await supabase
    .from("flashcards")
    .update({
      next_review_at: schedule.nextReviewAt,
      difficulty: schedule.flashcardDifficulty
    })
    .eq("id", flashcardId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateError || !updatedFlashcard) {
    return { ok: false, reason: "db_error" };
  }

  const { error: savedWordError } = await supabase
    .from("saved_words")
    .update({ status: schedule.savedWordStatus })
    .eq("id", row.saved_word_id)
    .eq("user_id", userId);

  if (savedWordError) {
    return { ok: false, reason: "db_error" };
  }

  return {
    ok: true,
    response: {
      flashcard: updatedFlashcard as Flashcard
    }
  };
}
