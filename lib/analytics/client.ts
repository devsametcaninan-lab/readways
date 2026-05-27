import type { AnalyticsEventName } from "./events";

const CLIENT_TRACKABLE_EVENTS = new Set<AnalyticsEventName>([
  "pdf_uploaded",
  "first_upload_started",
  "first_upload_completed",
  "first_upload_failed",
  "pdf_parse_failed",
  "upload_error",
  "pdf_storage_uploaded",
  "pdf_storage_failed",
  "document_processing_ready",
  "document_processing_failed",
  "document_needs_ocr",
  "document_job_created",
  "document_job_completed",
  "document_job_failed",
  "paywall_shown",
  "upgrade_cta_clicked",
  "limit_reached",
  "review_completed",
  "duplicate_request_prevented"
]);

/**
 * Non-blocking client analytics for flows without a dedicated API hook.
 */
export function trackAnalyticsEventClient(params: {
  eventName: AnalyticsEventName;
  metadata?: Record<string, unknown>;
}): void {
  if (!CLIENT_TRACKABLE_EVENTS.has(params.eventName)) {
    return;
  }

  void fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      eventName: params.eventName,
      metadata: params.metadata
    })
  }).catch(() => undefined);
}
