import type { Json } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@/lib/supabase/types";
import {
  eventTypeForName,
  isAnalyticsEventName,
  type AnalyticsEventName,
  type AnalyticsEventType
} from "./events";
import { sanitizeAnalyticsMetadata } from "./sanitize-metadata";

export type TrackEventParams = {
  supabase: SupabaseClient;
  userId?: string | null;
  eventName: AnalyticsEventName;
  eventType?: AnalyticsEventType;
  metadata?: Record<string, unknown>;
};

function logAnalyticsFailure(context: string, error: unknown): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[analytics] ${context}: ${message}`);
}

async function insertAnalyticsEvent(params: TrackEventParams): Promise<void> {
  const { supabase, userId = null, eventName, metadata } = params;

  if (!isAnalyticsEventName(eventName)) {
    return;
  }

  const eventType = params.eventType ?? eventTypeForName(eventName);
  const safeMetadata = sanitizeAnalyticsMetadata(metadata);

  const { error } = await supabase.from("analytics_events").insert({
    user_id: userId,
    event_name: eventName,
    event_type: eventType,
    metadata: safeMetadata as Json
  });

  if (error) {
    throw error;
  }
}

/**
 * Fire-and-forget analytics insert. Never throws to callers.
 */
export function trackEvent(params: TrackEventParams): void {
  void insertAnalyticsEvent(params).catch((error) => {
    logAnalyticsFailure(params.eventName, error);
  });
}
