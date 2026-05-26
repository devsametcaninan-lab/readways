import type { SupabaseClient } from "@/lib/supabase/types";

export type QueueSavedWordReviewResult =
  | { ok: true; flashcardId: string }
  | { ok: false; reason: "not_found" | "no_flashcard" | "db_error" };

export async function queueSavedWordForReview(params: {
  supabase: SupabaseClient;
  userId: string;
  savedWordId: string;
}): Promise<QueueSavedWordReviewResult> {
  const { supabase, userId, savedWordId } = params;

  const { data: savedWord, error: savedError } = await supabase
    .from("saved_words")
    .select("id")
    .eq("id", savedWordId)
    .eq("user_id", userId)
    .maybeSingle();

  if (savedError) {
    return { ok: false, reason: "db_error" };
  }

  if (!savedWord) {
    return { ok: false, reason: "not_found" };
  }

  const { data: flashcard, error: flashcardError } = await supabase
    .from("flashcards")
    .select("id")
    .eq("saved_word_id", savedWordId)
    .eq("user_id", userId)
    .maybeSingle();

  if (flashcardError) {
    return { ok: false, reason: "db_error" };
  }

  if (!flashcard) {
    return { ok: false, reason: "no_flashcard" };
  }

  const { error: updateError } = await supabase
    .from("flashcards")
    .update({ next_review_at: new Date().toISOString() })
    .eq("id", flashcard.id)
    .eq("user_id", userId);

  if (updateError) {
    return { ok: false, reason: "db_error" };
  }

  return { ok: true, flashcardId: flashcard.id };
}
