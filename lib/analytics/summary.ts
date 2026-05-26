import { createClient } from "@/lib/supabase/server";
import { ANALYTICS_EVENT_NAMES } from "./events";

export type AnalyticsEventSummaryRow = {
  eventName: string;
  count: number;
};

export type AnalyticsUsageSummary = {
  since: string;
  totalEvents: number;
  byEvent: AnalyticsEventSummaryRow[];
};

const SUMMARY_WINDOW_DAYS = 7;

export async function getAnalyticsUsageSummaryForUser(): Promise<AnalyticsUsageSummary | null> {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - SUMMARY_WINDOW_DAYS);

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_name")
    .eq("user_id", user.id)
    .gte("created_at", since.toISOString());

  if (error || !data) {
    return null;
  }

  const counts = new Map<string, number>();

  for (const row of data) {
    counts.set(row.event_name, (counts.get(row.event_name) ?? 0) + 1);
  }

  const byEvent = ANALYTICS_EVENT_NAMES.map((eventName) => ({
    eventName,
    count: counts.get(eventName) ?? 0
  })).filter((row) => row.count > 0);

  return {
    since: since.toISOString(),
    totalEvents: data.length,
    byEvent
  };
}
