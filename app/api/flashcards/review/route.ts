import { createClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/ai-dictionary/http";
import { persistFlashcardReview } from "@/lib/flashcards/review-persist";
import { validateReviewFlashcardRequest } from "@/lib/flashcards/validate-review";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError(401, "Authentication required.");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "Invalid JSON body.");
    }

    const validation = validateReviewFlashcardRequest(body);
    if (!validation.ok) {
      return jsonError(400, validation.error);
    }

    const { flashcardId, rating } = validation.data;

    const result = await persistFlashcardReview({
      supabase,
      userId: user.id,
      flashcardId,
      rating
    });

    if (!result.ok) {
      if (result.reason === "not_found") {
        return jsonError(404, "Flashcard not found.");
      }

      return jsonError(500, "Could not save review. Please try again.");
    }

    return NextResponse.json(result.response);
  } catch {
    return jsonError(500, "Something went wrong. Please try again.");
  }
}
