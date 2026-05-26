"use client";

import { createClient } from "@/lib/supabase/client";
import { removeDocumentFromStorage } from "./storage";

/**
 * Removes a failed in-progress upload so the library does not show a broken row.
 */
export async function rollbackProcessingDocument(params: {
  documentId: string;
  storagePath?: string | null;
}): Promise<void> {
  const supabase = createClient();
  const { documentId, storagePath } = params;

  if (storagePath) {
    await removeDocumentFromStorage(supabase, storagePath).catch(() => undefined);
  }

  await supabase.from("documents").delete().eq("id", documentId);
}
