import { parseApiErrorMessage } from "@/lib/api/client-error";
import type { ReviewRating } from "@/lib/supabase/schema";
import type { ReviewFlashcardResponse } from "./review-types";

export async function submitFlashcardReview(params: {
  flashcardId: string;
  rating: ReviewRating;
}): Promise<ReviewFlashcardResponse> {
  const response = await fetch("/api/flashcards/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, "Could not save review."));
  }

  return response.json() as Promise<ReviewFlashcardResponse>;
}
