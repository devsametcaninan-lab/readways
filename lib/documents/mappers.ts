import { normalizeDocumentLanguage } from "@/lib/language/document-language";
import { failureMessageForCode, parseDocumentFailureReason } from "./failure-reason";
import { formatRelativeUpdatedAt } from "./format";
import type { DocumentListItem, DocumentRecord, ReaderDocument } from "./types";
import { extractedTextToParagraphs } from "./text";

/** Same rules as the reader route: status ready plus usable extracted text. */
export function documentCanOpenInReader(row: DocumentRecord): boolean {
  return toReaderDocument(row) !== null;
}

export function toDocumentListItem(row: DocumentRecord): DocumentListItem {
  return {
    id: row.id,
    title: row.title,
    fileName: row.file_name,
    source: "PDF",
    progress: null,
    updatedAtLabel: formatRelativeUpdatedAt(row.updated_at),
    savedWordsCount: 0,
    status: row.status,
    canOpenInReader: documentCanOpenInReader(row),
    pageCount: row.page_count,
    failureMessage:
      row.status === "failed" || row.status === "needs_ocr"
        ? failureMessageForCode(parseDocumentFailureReason(row.extracted_text))
        : null
  };
}

export function toReaderDocument(row: DocumentRecord): ReaderDocument | null {
  if (row.status !== "ready" || !row.extracted_text?.trim()) {
    return null;
  }

  if (parseDocumentFailureReason(row.extracted_text)) {
    return null;
  }

  const paragraphs = extractedTextToParagraphs(row.extracted_text);
  if (paragraphs.length === 0) return null;

  return {
    id: row.id,
    title: row.title,
    source: row.file_name,
    pageCount: row.page_count,
    progress: null,
    paragraphs,
    language: normalizeDocumentLanguage(row.language)
  };
}
