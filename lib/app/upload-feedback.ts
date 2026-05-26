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
    case "NO_TEXT":
      return {
        variant: "warning",
        title: "This PDF looks scanned",
        description
      };
    case "ENCRYPTED":
      return {
        variant: "warning",
        title: "This PDF is locked",
        description
      };
    case "TOO_LARGE":
    case "TOO_MANY_PAGES":
    case "TOO_MUCH_TEXT":
      return {
        variant: "warning",
        title: "This PDF is too large",
        description
      };
    default:
      return {
        variant: "error",
        title: "Couldn't prepare this PDF",
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
