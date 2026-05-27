import { handleRouteError } from "@/lib/api/route-error";
import { jsonError } from "@/lib/ai-dictionary/http";
import { deleteSavedWordForUser } from "@/lib/saved-words/delete-saved-word";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
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

    const result = await deleteSavedWordForUser({
      supabase,
      userId: user.id,
      savedWordId: id.trim()
    });

    if (!result.ok) {
      if (result.reason === "not_found") {
        return jsonError(404, "Saved word not found.");
      }

      return jsonError(500, "Could not remove word. Please try again.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError("DELETE /api/saved-words/[id]", error);
  }
}
