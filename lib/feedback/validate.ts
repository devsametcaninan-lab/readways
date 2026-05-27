import { FEEDBACK_TYPE_VALUES, type FeedbackType } from "./types";

const MAX_MESSAGE_LENGTH = 5000;
const MIN_MESSAGE_LENGTH = 10;
const MAX_ROUTE_LENGTH = 500;

export type SubmitFeedbackRequestBody = {
  type: string;
  message: string;
  route?: string;
  metadata?: Record<string, unknown>;
};

export type SubmitFeedbackValidationResult =
  | {
      ok: true;
      data: {
        type: FeedbackType;
        message: string;
        route: string;
        metadata?: Record<string, unknown>;
      };
    }
  | { ok: false; error: string };

function isFeedbackType(value: string): value is FeedbackType {
  return (FEEDBACK_TYPE_VALUES as readonly string[]).includes(value);
}

export function validateSubmitFeedbackRequest(body: unknown): SubmitFeedbackValidationResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const record = body as SubmitFeedbackRequestBody;

  if (typeof record.type !== "string" || !isFeedbackType(record.type)) {
    return { ok: false, error: "Invalid feedback type." };
  }

  if (typeof record.message !== "string") {
    return { ok: false, error: "Message is required." };
  }

  const message = record.message.trim();

  if (message.length < MIN_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "Message is too long." };
  }

  let route = "";
  if (record.route != null) {
    if (typeof record.route !== "string") {
      return { ok: false, error: "Invalid route." };
    }

    route = record.route.trim().slice(0, MAX_ROUTE_LENGTH);
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
      type: record.type,
      message,
      route,
      metadata
    }
  };
}
