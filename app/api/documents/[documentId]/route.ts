import { jsonError } from "@/lib/ai-dictionary/http";
import { deleteDocumentForUser } from "@/lib/documents/delete-document";
import { trackEvent } from "@/lib/analytics/track-event";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;

    if (!documentId?.trim()) {
      return jsonError(400, "Document id is required.");
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError(401, "Authentication required.");
    }

    const result = await deleteDocumentForUser({
      supabase,
      userId: user.id,
      documentId: documentId.trim()
    });

    if (!result.ok) {
      if (result.reason === "not_found") {
        trackEvent({
          supabase,
          userId: user.id,
          eventName: "document_delete_failed",
          metadata: { documentId: documentId.trim(), reason: "not_found" }
        });

        return jsonError(404, "Document not found.");
      }

      trackEvent({
        supabase,
        userId: user.id,
        eventName: "document_delete_failed",
        metadata: { documentId: documentId.trim(), reason: "db_error" }
      });

      return jsonError(500, "Could not delete document. Please try again.");
    }

    trackEvent({
      supabase,
      userId: user.id,
      eventName: "document_deleted",
      metadata: {
        documentId: documentId.trim(),
        hadStorageWarning: Boolean(result.storageWarning)
      }
    });

    return NextResponse.json({
      ok: true,
      storageWarning: result.storageWarning
    });
  } catch {
    return jsonError(500, "Something went wrong. Please try again.");
  }
}
