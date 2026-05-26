"use client";

import { createClient } from "@/lib/supabase/client";
import {
  isDocumentStorageUploadError,
  uploadDocumentPdfToStorage
} from "./storage";

export { isDocumentStorageUploadError };

export async function storeDocumentPdfFile(
  documentId: string,
  file: File
): Promise<{ storagePath: string; originalFileName: string }> {
  const supabase = createClient();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to upload documents.");
  }

  return uploadDocumentPdfToStorage({
    supabase,
    userId: user.id,
    documentId,
    file
  });
}
