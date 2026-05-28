import { PDF_ERROR_MESSAGES, type PdfErrorCode } from "@/lib/pdf/errors";

export type UploadFeedback = {
  variant: "default" | "error" | "warning" | "success" | "info";
  title: string;
  description: string;
  showUpgradeCta?: boolean;
};

type Translate = (key: string) => string;

export function feedbackForPdfErrorCode(code: PdfErrorCode, t: Translate): UploadFeedback {
  const descriptionMap: Record<PdfErrorCode, string> = {
    TOO_LARGE: t("app.uploadErrTooLargeBody"),
    TOO_MANY_PAGES: t("app.uploadErrTooManyPagesBody"),
    TOO_MUCH_TEXT: t("app.uploadErrTooMuchTextBody"),
    SCANNED: t("app.uploadErrScannedBody"),
    NO_TEXT: t("app.uploadErrNoTextBody"),
    ENCRYPTED: t("app.uploadErrEncryptedBody"),
    CORRUPTED: t("app.uploadErrCorruptedBody"),
    EMPTY_FILE: t("app.uploadErrEmptyBody"),
    INVALID_FILE: t("app.uploadErrInvalidBody"),
    UNKNOWN: t("app.uploadErrUnknownBody")
  };
  const description = descriptionMap[code] ?? PDF_ERROR_MESSAGES[code];

  switch (code) {
    case "SCANNED":
      return {
        variant: "warning",
        title: t("app.uploadErrScannedTitle"),
        description
      };
    case "NO_TEXT":
      return {
        variant: "warning",
        title: t("app.uploadErrNoTextTitle"),
        description
      };
    case "ENCRYPTED":
      return {
        variant: "warning",
        title: t("app.uploadErrEncryptedTitle"),
        description
      };
    case "TOO_LARGE":
      return {
        variant: "warning",
        title: t("app.uploadErrTooLargeTitle"),
        description
      };
    case "TOO_MANY_PAGES":
      return {
        variant: "warning",
        title: t("app.uploadErrTooManyPagesTitle"),
        description
      };
    case "TOO_MUCH_TEXT":
      return {
        variant: "warning",
        title: t("app.uploadErrTooMuchTextTitle"),
        description
      };
    case "CORRUPTED":
    case "INVALID_FILE":
    case "EMPTY_FILE":
      return {
        variant: "error",
        title: t("app.uploadProcessFailedTitle"),
        description
      };
    default:
      return {
        variant: "error",
        title: t("app.uploadProcessFailedTitle"),
        description
      };
  }
}

export function feedbackForStorageFailure(message: string, t: Translate): UploadFeedback {
  return {
    variant: "error",
    title: t("app.uploadDidNotFinish"),
    description: message
  };
}
