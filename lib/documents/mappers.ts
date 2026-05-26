import { failureMessageForCode, parseDocumentFailureReason } from "./failure-reason";
import { formatRelativeUpdatedAt } from "./format";
import type { DocumentListItem, DocumentRecord, ReaderDocument } from "./types";
import { extractedTextToParagraphs } from "./text";

export function toDocumentListItem(row: DocumentRecord): DocumentListItem {
  return {
    id: row.id,
    title: row.title,
    fileName: row.file_name,
    source: "PDF",
    progress: 0,
    updatedAtLabel: formatRelativeUpdatedAt(row.updated_at),
    savedWordsCount: 0,
    status: row.status,
    pageCount: row.page_count,
    failureMessage:
      row.status === "failed"
        ? failureMessageForCode(parseDocumentFailureReason(row.extracted_text))
        : null
  };
}

export function toReaderDocument(row: DocumentRecord): ReaderDocument | null {
  if (row.status !== "ready" || !row.extracted_text?.trim()) {
    return null;
  }

  const paragraphs = extractedTextToParagraphs(row.extracted_text);
  if (paragraphs.length === 0) return null;

  return {
    id: row.id,
    title: row.title,
    source: row.file_name,
    pageCount: row.page_count,
    progress: 0,
    paragraphs
  };
}
