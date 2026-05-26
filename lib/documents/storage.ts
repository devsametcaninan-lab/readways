import type { SupabaseClient } from "@/lib/supabase/types";

export const DOCUMENTS_STORAGE_BUCKET = "documents";

export class DocumentStorageUploadError extends Error {
  readonly code: "storage_upload_failed" | "storage_rejected";

  constructor(
    message: string,
    code: "storage_upload_failed" | "storage_rejected" = "storage_upload_failed"
  ) {
    super(message);
    this.name = "DocumentStorageUploadError";
    this.code = code;
  }
}

export function isDocumentStorageUploadError(
  error: unknown
): error is DocumentStorageUploadError {
  return error instanceof DocumentStorageUploadError;
}

/** Safe file name segment for storage paths (no directories). */
export function sanitizeOriginalFileName(fileName: string): string {
  const baseName = fileName.split(/[/\\]/).pop()?.trim() ?? "";
  const cleaned = baseName
    .replace(/[^\w.\-() ]+/g, "_")
    .replace(/\s+/g, " ")
    .trim();

  const withExtension = cleaned.toLowerCase().endsWith(".pdf")
    ? cleaned
    : `${cleaned || "document"}.pdf`;

  return withExtension.slice(0, 180);
}

/**
 * userId/documentId/original-file-name.pdf
 */
export function buildDocumentStoragePath(
  userId: string,
  documentId: string,
  originalFileName: string
): string {
  const safeName = sanitizeOriginalFileName(originalFileName);
  return `${userId}/${documentId}/${safeName}`;
}

function mapStorageUploadError(message: string): DocumentStorageUploadError {
  if (/payload too large|exceeded|file_size_limit/i.test(message)) {
    return new DocumentStorageUploadError(
      "This PDF exceeds the storage size limit. Please upload a smaller file.",
      "storage_rejected"
    );
  }

  if (/mime|content type|invalid/i.test(message)) {
    return new DocumentStorageUploadError(
      "This file type is not allowed. Please upload a PDF.",
      "storage_rejected"
    );
  }

  return new DocumentStorageUploadError(
    "Could not store your PDF securely. Please try again."
  );
}

export async function uploadDocumentPdfToStorage(params: {
  supabase: SupabaseClient;
  userId: string;
  documentId: string;
  file: File;
}): Promise<{ storagePath: string; originalFileName: string }> {
  const { supabase, userId, documentId, file } = params;
  const originalFileName = sanitizeOriginalFileName(file.name);
  const storagePath = buildDocumentStoragePath(userId, documentId, originalFileName);

  const { error } = await supabase.storage
    .from(DOCUMENTS_STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/pdf",
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw mapStorageUploadError(error.message);
  }

  return { storagePath, originalFileName };
}

export type RemoveDocumentFromStorageResult =
  | { ok: true }
  | { ok: false; message: string };

export async function removeDocumentFromStorage(
  supabase: SupabaseClient,
  storagePath: string
): Promise<RemoveDocumentFromStorageResult> {
  if (!storagePath.trim()) {
    return { ok: true };
  }

  const { error } = await supabase.storage
    .from(DOCUMENTS_STORAGE_BUCKET)
    .remove([storagePath]);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
