import { jsonError } from "@/lib/ai-dictionary/http";
import { handleRouteError } from "@/lib/api/route-error";
import { validateSubmitFeedbackRequest } from "@/lib/feedback/validate";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/sanitize-metadata";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
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

    const validation = validateSubmitFeedbackRequest(body);
    if (!validation.ok) {
      return jsonError(400, validation.error);
    }

    const { type, message, route, metadata } = validation.data;
    const safeMetadata = sanitizeAnalyticsMetadata(metadata) as Json;

    const { data, error } = await supabase
      .from("feedback_submissions")
      .insert({
        user_id: user.id,
        type,
        message,
        route,
        metadata: safeMetadata,
        status: "new"
      })
      .select("id")
      .single();

    if (error || !data) {
      return jsonError(500, "Could not save feedback. Please try again.");
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return handleRouteError("POST /api/feedback", error);
  }
}
