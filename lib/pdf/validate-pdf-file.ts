import { MAX_PDF_BYTES, MAX_PDF_PAGES } from "./constants";
import { pdfError } from "./errors";

export function validatePdfFileBasics(file: File): void {
  if (!file || file.size === 0) {
    throw pdfError("EMPTY_FILE");
  }

  if (file.size > MAX_PDF_BYTES) {
    throw pdfError("TOO_LARGE");
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  const looksLikePdf =
    type === "application/pdf" || name.endsWith(".pdf") || type === "";

  if (!looksLikePdf) {
    throw pdfError("INVALID_FILE");
  }
}

export async function validatePdfFileSignature(file: File): Promise<void> {
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const signature = String.fromCharCode(...header);

  if (!signature.startsWith("%PDF")) {
    throw pdfError("CORRUPTED");
  }
}

export function validatePdfPageCount(pageCount: number): void {
  if (!Number.isFinite(pageCount) || pageCount < 1) {
    throw pdfError("CORRUPTED");
  }

  if (pageCount > MAX_PDF_PAGES) {
    throw pdfError("TOO_MANY_PAGES");
  }
}
