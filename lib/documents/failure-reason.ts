import type { PdfErrorCode } from "@/lib/pdf/errors";
import { PDF_ERROR_MESSAGES } from "@/lib/pdf/errors";

const FAILURE_PREFIX = "__error__:";

export function encodeDocumentFailureReason(code: PdfErrorCode): string {
  return `${FAILURE_PREFIX}${code}`;
}

export function parseDocumentFailureReason(
  extractedText: string | null | undefined
): PdfErrorCode | null {
  if (!extractedText?.startsWith(FAILURE_PREFIX)) {
    return null;
  }

  const code = extractedText.slice(FAILURE_PREFIX.length) as PdfErrorCode;
  if (code in PDF_ERROR_MESSAGES) {
    return code;
  }

  return null;
}

export function failureMessageForCode(code: PdfErrorCode | null): string | null {
  if (!code) {
    return null;
  }

  return PDF_ERROR_MESSAGES[code];
}
