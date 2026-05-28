import { formatFileSize } from "@/lib/format";
import { MAX_PDF_BYTES, MAX_PDF_PAGES } from "@/lib/pdf/constants";

export const PDF_UPLOAD_LIMITS_SHORT = `PDF only · ${formatFileSize(MAX_PDF_BYTES)} max · ${MAX_PDF_PAGES} pages`;

export const PDF_UPLOAD_LIMITS_DETAIL = `Text-based PDF files · Maximum ${formatFileSize(MAX_PDF_BYTES)} · Up to ${MAX_PDF_PAGES} pages`;

export function pdfUploadLimitsShortLabel(t: (key: string) => string): string {
  return `${t("app.uploadLimitPdfOnly")} · ${formatFileSize(MAX_PDF_BYTES)} ${t("app.uploadLimitMax")} · ${MAX_PDF_PAGES} ${t("app.uploadLimitPages")}`;
}

export function pdfUploadLimitsDetailLabel(t: (key: string) => string): string {
  return `${t("app.uploadLimitTextPdf")} · ${t("app.uploadLimitMaximum")} ${formatFileSize(MAX_PDF_BYTES)} · ${t("app.uploadLimitUpTo")} ${MAX_PDF_PAGES} ${t("app.uploadLimitPages")}`;
}
