import { isAnalyticsEventName, type AnalyticsEventName } from "./events";

export type TrackEventRequestBody = {
  eventName: string;
  metadata?: Record<string, unknown>;
};

export type TrackEventValidationResult =
  | { ok: true; data: { eventName: AnalyticsEventName; metadata?: Record<string, unknown> } }
  | { ok: false; error: string };

const CLIENT_ALLOWED_EVENTS = new Set<AnalyticsEventName>([
  "pdf_uploaded",
  "first_upload_started",
  "first_upload_completed",
  "first_upload_failed",
  "pdf_parse_failed",
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
  "review_completed"
]);

export function validateClientTrackRequest(body: unknown): TrackEventValidationResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const record = body as TrackEventRequestBody;

  if (typeof record.eventName !== "string" || !isAnalyticsEventName(record.eventName)) {
    return { ok: false, error: "Invalid event name." };
  }

  if (!CLIENT_ALLOWED_EVENTS.has(record.eventName)) {
    return { ok: false, error: "Event cannot be tracked from the client." };
  }

  const metadata =
    record.metadata &&
    typeof record.metadata === "object" &&
    !Array.isArray(record.metadata)
      ? (record.metadata as Record<string, unknown>)
      : undefined;

  return {
    ok: true,
    data: {
      eventName: record.eventName,
      metadata
    }
  };
}
