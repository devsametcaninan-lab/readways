import { trackAnalyticsEventClient } from "@/lib/analytics/client";
import type { PdfErrorCode } from "@/lib/pdf/errors";

export function trackUploadError(metadata: {
  errorCode?: PdfErrorCode | string;
  reason?: string;
  documentId?: string | null;
  stage?: string;
}): void {
  trackAnalyticsEventClient({
    eventName: "upload_error",
    metadata
  });
}
