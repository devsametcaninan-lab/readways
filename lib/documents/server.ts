import { createClient } from "@/lib/supabase/server";
import type { DocumentStatus } from "@/lib/supabase/schema";
import { failureMessageForCode, parseDocumentFailureReason } from "./failure-reason";
import { toReaderDocument } from "./mappers";
import type { DocumentRecord, ReaderDocument } from "./types";
import type { PdfErrorCode } from "@/lib/pdf/errors";

const READER_COLUMNS =
  "id, title, file_name, file_size, page_count, extracted_text, language, status, created_at, updated_at, user_id";

export type ReaderDocumentResult =
  | { kind: "found"; document: ReaderDocument }
  | { kind: "not_found" }
  | { kind: "unavailable"; status: DocumentStatus; failureCode: PdfErrorCode | null };

export async function getReaderDocumentForUser(
  documentId: string
): Promise<ReaderDocumentResult> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "not_found" };
  }

  const normalizedId = documentId.trim();
  if (!normalizedId) {
    return { kind: "not_found" };
  }

  const { data, error } = await supabase
    .from("documents")
    .select(READER_COLUMNS)
    .eq("id", normalizedId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[documents] reader load not_found", {
        documentId: normalizedId,
        reason: error?.message ?? "no_row"
      });
    }

    return { kind: "not_found" };
  }

  const row = data as DocumentRecord & { user_id: string };

  if (row.status !== "ready") {
    return {
      kind: "unavailable",
      status: row.status,
      failureCode: parseDocumentFailureReason(row.extracted_text)
    };
  }

  const document = toReaderDocument(row);
  if (!document) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[documents] reader load unreadable", {
        documentId: normalizedId,
        status: row.status,
        hasExtractedText: Boolean(row.extracted_text?.trim()),
        failureCode: parseDocumentFailureReason(row.extracted_text)
      });
    }

    return {
      kind: "unavailable",
      status: "failed",
      failureCode: parseDocumentFailureReason(row.extracted_text)
    };
  }

  return { kind: "found", document };
}
