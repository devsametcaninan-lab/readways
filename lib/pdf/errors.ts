export type PdfErrorCode =
  | "TOO_LARGE"
  | "TOO_MANY_PAGES"
  | "TOO_MUCH_TEXT"
  | "SCANNED"
  | "NO_TEXT"
  | "ENCRYPTED"
  | "CORRUPTED"
  | "EMPTY_FILE"
  | "INVALID_FILE"
  | "UNKNOWN";

export class PdfUserError extends Error {
  readonly code: PdfErrorCode;

  constructor(message: string, code: PdfErrorCode) {
    super(message);
    this.name = "PdfUserError";
    this.code = code;
  }
}

export function isPdfUserError(error: unknown): error is PdfUserError {
  return error instanceof PdfUserError;
}

export const PDF_ERROR_MESSAGES: Record<PdfErrorCode, string> = {
  TOO_LARGE: "This PDF exceeds the 10 MB limit. Please upload a smaller file.",
  TOO_MANY_PAGES:
    "This PDF has too many pages. Please upload a document up to 30 pages.",
  TOO_MUCH_TEXT:
    "This PDF is too large to prepare in the browser. Try a shorter document.",
  SCANNED:
    "This PDF looks scanned. OCR support is coming soon — try a text-based PDF for now.",
  NO_TEXT:
    "We couldn't find readable text in this PDF. Try uploading a document with selectable text.",
  ENCRYPTED:
    "This PDF is password-protected. Please upload an unlocked copy.",
  CORRUPTED: "We could not read this PDF. The file may be corrupted or incomplete.",
  EMPTY_FILE: "This file is empty. Choose a different PDF.",
  INVALID_FILE: "This file does not look like a valid PDF.",
  UNKNOWN:
    "We couldn't prepare this PDF. Try another file, or upload a shorter text-based document."
};

export function pdfError(code: PdfErrorCode, message?: string): PdfUserError {
  return new PdfUserError(message ?? PDF_ERROR_MESSAGES[code], code);
}
