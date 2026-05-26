import { formatFileSize } from "@/lib/format";
import { MAX_PDF_BYTES, MAX_PDF_PAGES } from "@/lib/pdf/constants";

export const PDF_UPLOAD_LIMITS_SHORT = `PDF only · ${formatFileSize(MAX_PDF_BYTES)} max · ${MAX_PDF_PAGES} pages`;

export const PDF_UPLOAD_LIMITS_DETAIL = `Text-based PDF files · Maximum ${formatFileSize(MAX_PDF_BYTES)} · Up to ${MAX_PDF_PAGES} pages`;
