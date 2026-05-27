import { handleRouteError } from "@/lib/api/route-error";
import { jsonError } from "@/lib/ai-dictionary/http";
import { queueSavedWordForReview } from "@/lib/saved-words/queue-review";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return jsonError(400, "Saved word id is required.");
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError(401, "Authentication required.");
    }

    const result = await queueSavedWordForReview({
      supabase,
      userId: user.id,
      savedWordId: id.trim()
    });

    if (!result.ok) {
      if (result.reason === "not_found") {
        return jsonError(404, "Saved word not found.");
      }

      if (result.reason === "no_flashcard") {
        return jsonError(404, "No flashcard found for this word.");
      }

      return jsonError(500, "Could not queue review. Please try again.");
    }

    return NextResponse.json({ ok: true, flashcardId: result.flashcardId });
  } catch (error) {
    return handleRouteError("POST /api/saved-words/[id]/queue-review", error);
  }
}
