import { logServerError } from "@/lib/logging/server-log";
import { trackEvent } from "@/lib/analytics/track-event";
import { validateClientTrackRequest } from "@/lib/analytics/validate-track-request";
import { jsonError } from "@/lib/ai-dictionary/http";
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

    const validation = validateClientTrackRequest(body);
    if (!validation.ok) {
      return jsonError(400, validation.error);
    }

    trackEvent({
      supabase,
      userId: user.id,
      eventName: validation.data.eventName,
      metadata: validation.data.metadata
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logServerError("POST /api/analytics/track", error);
    return new NextResponse(null, { status: 204 });
  }
}
