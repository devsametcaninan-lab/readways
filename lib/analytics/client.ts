import type { AnalyticsEventName } from "./events";

const CLIENT_TRACKABLE_EVENTS = new Set<AnalyticsEventName>([
  "pdf_uploaded",
  "pdf_parse_failed",
  "pdf_storage_uploaded",
  "pdf_storage_failed",
  "review_completed"
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
