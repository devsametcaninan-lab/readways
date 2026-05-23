export type PdfErrorCode =
  | "TOO_LARGE"
  | "TOO_MANY_PAGES"
  | "SCANNED"
  | "ENCRYPTED"
  | "CORRUPTED"
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
