import type { ReviewRating } from "@/lib/supabase/schema";
import type { Flashcard } from "@/lib/supabase/types";

export type ReviewFlashcardRequestBody = {
  flashcardId: string;
  rating: ReviewRating;
};

export type ReviewFlashcardResponse = {
  flashcard: Flashcard;
};
