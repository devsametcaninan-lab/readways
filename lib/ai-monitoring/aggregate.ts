import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/ai-dictionary/usage";
import { planToTier } from "@/lib/billing/plans";
import type { Json } from "@/lib/supabase/database.types";
import { AI_REQUEST_EVENTS, AI_USAGE_EVENT_NAMES } from "./events";

export type AiUsageActiveUserRow = {
  userIdPrefix: string;
  requestCount: number;
};

export type AiUsageMonitoringSummary = {
  generatedAt: string;
  windowStartUtc: string;
  /** True when at least one AI usage row was returned from analytics_events today. */
  hasEventsToday: boolean;
  totalAiRequestsToday: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number | null;
  aiGenerations: number;
  estimatedDailyCostUsd: number;
  averageResponseMs: number | null;
  slowRequests: number;
  timeouts: number;
  failedGenerations: number;
  limitReached: number;
  topActiveUsers: AiUsageActiveUserRow[];
};

export type AiUsageMonitoringQueryResult = {
  summary: AiUsageMonitoringSummary;
  /** Set when the Supabase query failed (e.g. missing admin RLS policy). */
  queryFailed: boolean;
};

type AnalyticsRow = {
  event_name: string;
  user_id: string | null;
  metadata: Json;
  created_at: string;
};

const TOP_USERS_LIMIT = 8;
const QUERY_ROW_LIMIT = 10_000;

function startOfUtcDay(iso: string = new Date().toISOString()): string {
  const date = new Date(iso);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

function metadataRecord(metadata: Json): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }

  return {};
}

function readNumber(metadata: Record<string, unknown>, key: string): number | null {
  const value = metadata[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function readBoolean(metadata: Record<string, unknown>, key: string): boolean {
  return metadata[key] === true;
}

function userIdPrefix(userId: string | null): string {
  if (!userId) {
    return "anonymous";
  }

  return userId.slice(0, 8);
}

function emptySummary(windowStartUtc: string): AiUsageMonitoringSummary {
  return {
    generatedAt: new Date().toISOString(),
    windowStartUtc,
    hasEventsToday: false,
    totalAiRequestsToday: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheHitRate: null,
    aiGenerations: 0,
    estimatedDailyCostUsd: 0,
    averageResponseMs: null,
    slowRequests: 0,
    timeouts: 0,
    failedGenerations: 0,
    limitReached: 0,
    topActiveUsers: []
  };
}

export async function getAiUsageMonitoringSummary(): Promise<AiUsageMonitoringQueryResult | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const plan = await getUserPlan(supabase, user.id);
  if (planToTier(plan) !== "admin") {
    return null;
  }

  const windowStartUtc = startOfUtcDay();

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_name, user_id, metadata, created_at")
    .gte("created_at", windowStartUtc)
    .in("event_name", [...AI_USAGE_EVENT_NAMES])
    .order("created_at", { ascending: false })
    .limit(QUERY_ROW_LIMIT);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[ai-monitoring] analytics_events query failed:", error.message);
    }

    return { summary: emptySummary(windowStartUtc), queryFailed: true };
  }

  const rows = (data ?? []) as AnalyticsRow[];

  let cacheHits = 0;
  let cacheMisses = 0;
  let aiGenerations = 0;
  let estimatedDailyCostUsd = 0;
  let durationTotalMs = 0;
  let durationCount = 0;
  let slowRequests = 0;
  let timeouts = 0;
  let failedGenerations = 0;
  let limitReached = 0;

  const userRequestCounts = new Map<string, number>();

  for (const row of rows) {
    const eventName = row.event_name;
    const meta = metadataRecord(row.metadata);

    if ((AI_REQUEST_EVENTS as readonly string[]).includes(eventName)) {
      const userKey = row.user_id ?? "anonymous";
      userRequestCounts.set(userKey, (userRequestCounts.get(userKey) ?? 0) + 1);
    }

    if (eventName === "ai_cache_hit") {
      cacheHits += 1;
    }

    if (eventName === "ai_cache_miss") {
      cacheMisses += 1;
    }

    if (eventName === "ai_generated") {
      aiGenerations += 1;
      const cost = readNumber(meta, "estimatedCostUsd");
      if (cost != null) {
        estimatedDailyCostUsd += cost;
      }
    }

    const durationMs = readNumber(meta, "durationMs");
    if (durationMs != null && (eventName === "ai_generated" || eventName === "ai_cache_hit")) {
      durationTotalMs += durationMs;
      durationCount += 1;
    }

    if (readBoolean(meta, "slowRequest")) {
      slowRequests += 1;
    }

    if (eventName === "ai_timeout") {
      timeouts += 1;
    }

    if (eventName === "ai_generation_failed") {
      failedGenerations += 1;
    }

    if (eventName === "ai_limit_reached") {
      limitReached += 1;
    }
  }

  const totalAiRequestsToday = cacheHits + cacheMisses;
  const cacheHitRate =
    totalAiRequestsToday > 0 ? Math.round((cacheHits / totalAiRequestsToday) * 1000) / 10 : null;

  const topActiveUsers = [...userRequestCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_USERS_LIMIT)
    .map(([userId, requestCount]) => ({
      userIdPrefix: userIdPrefix(userId === "anonymous" ? null : userId),
      requestCount
    }));

  return {
    summary: {
      generatedAt: new Date().toISOString(),
      windowStartUtc,
      hasEventsToday: rows.length > 0,
      totalAiRequestsToday,
      cacheHits,
      cacheMisses,
      cacheHitRate,
      aiGenerations,
      estimatedDailyCostUsd: Math.round(estimatedDailyCostUsd * 1_000_000) / 1_000_000,
      averageResponseMs:
        durationCount > 0 ? Math.round(durationTotalMs / durationCount) : null,
      slowRequests,
      timeouts,
      failedGenerations,
      limitReached,
      topActiveUsers
    },
    queryFailed: false
  };
}
