import type { ApiErrorBody } from "@/lib/ai-dictionary/types";
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
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new Error(body?.error ?? "Could not save review.");
  }

  return response.json() as Promise<ReviewFlashcardResponse>;
}
