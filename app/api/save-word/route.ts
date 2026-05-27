import { trackEvent } from "@/lib/analytics/track-event";
import { createClient } from "@/lib/supabase/server";
import { handleRouteError } from "@/lib/api/route-error";
import { jsonError } from "@/lib/ai-dictionary/http";
import { persistSaveWord } from "@/lib/save-word/persist";
import { validateSaveWordRequest } from "@/lib/save-word/validate";
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

    const validation = validateSaveWordRequest(body);
    if (!validation.ok) {
      return jsonError(400, validation.error);
    }

    const { documentId, wordExplanationId, word } = validation.data;

    const result = await persistSaveWord({
      supabase,
      userId: user.id,
      documentId,
      wordExplanationId,
      word
    });

    if (!result.ok) {
      if (result.reason === "forbidden_document") {
        return jsonError(403, "You do not have access to this document.");
      }

      if (result.reason === "forbidden_explanation") {
        return jsonError(403, "You do not have access to this explanation.");
      }

      return jsonError(500, "Could not save word. Please try again.");
    }

    trackEvent({
      supabase,
      userId: user.id,
      eventName: "word_saved",
      metadata: {
        documentId,
        status: result.response.status
      }
    });

    return NextResponse.json(result.response);
  } catch (error) {
    return handleRouteError("POST /api/save-word", error);
  }
}
