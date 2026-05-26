import { PDF_ERROR_MESSAGES, type PdfErrorCode } from "@/lib/pdf/errors";

export type UploadFeedback = {
  variant: "default" | "error" | "warning" | "success" | "info";
  title: string;
  description: string;
  showUpgradeCta?: boolean;
};

export function feedbackForPdfErrorCode(code: PdfErrorCode): UploadFeedback {
  const description = PDF_ERROR_MESSAGES[code];

  switch (code) {
    case "SCANNED":
      return {
        variant: "warning",
        title: "Scanned PDF — OCR coming soon",
        description
      };
    case "NO_TEXT":
      return {
        variant: "warning",
        title: "No readable text found",
        description
      };
    case "ENCRYPTED":
      return {
        variant: "warning",
        title: "This PDF is locked",
        description
      };
    case "TOO_LARGE":
      return {
        variant: "warning",
        title: "File is too large",
        description
      };
    case "TOO_MANY_PAGES":
      return {
        variant: "warning",
        title: "Too many pages",
        description
      };
    case "TOO_MUCH_TEXT":
      return {
        variant: "warning",
        title: "This PDF is too large to prepare",
        description
      };
    case "CORRUPTED":
    case "INVALID_FILE":
    case "EMPTY_FILE":
      return {
        variant: "error",
        title: "Could not process this PDF",
        description
      };
    default:
      return {
        variant: "error",
        title: "Could not process this PDF",
        description
      };
  }
}

export function feedbackForStorageFailure(message: string): UploadFeedback {
  return {
    variant: "error",
    title: "Upload didn't finish",
    description: message
  };
}
