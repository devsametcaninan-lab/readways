import { REVIEW_RATING_VALUES } from "@/lib/supabase/schema";
import type { ReviewFlashcardRequestBody } from "./review-types";

export type ReviewFlashcardValidationResult =
  | { ok: true; data: ReviewFlashcardRequestBody }
  | { ok: false; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateReviewFlashcardRequest(
  body: unknown
): ReviewFlashcardValidationResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const record = body as ReviewFlashcardRequestBody;

  if (!isNonEmptyString(record.flashcardId)) {
    return { ok: false, error: "flashcardId is required." };
  }

  if (
    typeof record.rating !== "string" ||
    !REVIEW_RATING_VALUES.includes(record.rating as ReviewFlashcardRequestBody["rating"])
  ) {
    return { ok: false, error: 'rating must be "hard", "good", or "easy".' };
  }

  return {
    ok: true,
    data: {
      flashcardId: record.flashcardId.trim(),
      rating: record.rating
    }
  };
}
