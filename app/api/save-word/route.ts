import { createClient } from "@/lib/supabase/server";
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

    return NextResponse.json(result.response);
  } catch {
    return jsonError(500, "Something went wrong. Please try again.");
  }
}
