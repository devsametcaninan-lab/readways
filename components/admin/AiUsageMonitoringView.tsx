import AppCard from "@/components/app/AppCard";
import type { AiUsageMonitoringSummary } from "@/lib/ai-monitoring/aggregate";

function formatUsd(value: number): string {
  if (value === 0) {
    return "$0.00";
  }

  if (value < 0.01) {
    return "under $0.01";
  }

  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number | null): string {
  if (value == null) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

type AiUsageMonitoringViewProps = {
  summary: AiUsageMonitoringSummary;
  queryFailed?: boolean;
};

export default function AiUsageMonitoringView({
  summary,
  queryFailed = false
}: AiUsageMonitoringViewProps) {
  const windowLabel = new Date(summary.windowStartUtc).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 md:px-8 lg:px-10">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
          Internal · AI monitoring
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-100">AI usage &amp; cost (UTC day)</h1>
        <p className="mt-2 text-sm text-slate-400">
          Closed-beta visibility since {windowLabel} UTC. Estimates are approximate; user IDs are
          truncated prefixes only.
        </p>
      </header>

      {queryFailed ? (
        <AppCard>
          <p className="text-sm font-medium text-amber-200/90">Could not load analytics data</p>
          <p className="mt-2 text-sm text-slate-400">
            The dashboard reads from <span className="font-mono text-slate-300">analytics_events</span>{" "}
            in Supabase. Check that you are on the admin plan and that migration{" "}
            <span className="font-mono text-slate-300">20250531140000_analytics_events_admin_select</span>{" "}
            has been applied.
          </p>
        </AppCard>
      ) : null}

      {!queryFailed && !summary.hasEventsToday ? (
        <AppCard>
          <p className="text-sm font-medium text-slate-200">No AI usage recorded yet today</p>
          <p className="mt-2 text-sm text-slate-400">
            Metrics appear when users request explanations via{" "}
            <span className="font-mono text-slate-300">POST /api/explain-word</span>, which inserts{" "}
            <span className="font-mono text-slate-300">ai_cache_hit</span>,{" "}
            <span className="font-mono text-slate-300">ai_cache_miss</span>, and{" "}
            <span className="font-mono text-slate-300">ai_generated</span> rows into{" "}
            <span className="font-mono text-slate-300">analytics_events</span>.
          </p>
        </AppCard>
      ) : null}

      {!queryFailed && summary.hasEventsToday ? (
      <>
      <div className="grid gap-4 sm:grid-cols-2">
        <AppCard>
          <p className="text-xs text-slate-500">Total AI requests today</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-100">
            {summary.totalAiRequestsToday}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {summary.aiGenerations} new generations · {summary.cacheHits} cache hits
          </p>
        </AppCard>

        <AppCard>
          <p className="text-xs text-slate-500">Cache hit rate</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-100">
            {formatPercent(summary.cacheHitRate)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {summary.cacheMisses} misses · {summary.limitReached} limit blocks
          </p>
        </AppCard>

        <AppCard>
          <p className="text-xs text-slate-500">Estimated daily cost</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-100">
            {formatUsd(summary.estimatedDailyCostUsd)}
          </p>
          <p className="mt-1 text-xs text-slate-500">gpt-4o-mini heuristic from token estimates</p>
        </AppCard>

        <AppCard>
          <p className="text-xs text-slate-500">Avg AI response time</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-100">
            {summary.averageResponseMs != null ? `${summary.averageResponseMs} ms` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {summary.slowRequests} slow · {summary.timeouts} timeouts · {summary.failedGenerations}{" "}
            failures
          </p>
        </AppCard>
      </div>

      <AppCard>
        <p className="text-sm font-medium text-slate-200">Most active users (request count)</p>
        {summary.topActiveUsers.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No AI requests recorded yet today.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {summary.topActiveUsers.map((row) => (
              <li
                key={row.userIdPrefix}
                className="flex items-center justify-between text-sm text-slate-300"
              >
                <span className="font-mono text-[12px] text-slate-400">{row.userIdPrefix}…</span>
                <span className="tabular-nums text-slate-200">{row.requestCount}</span>
              </li>
            ))}
          </ul>
        )}
      </AppCard>
      </>
      ) : null}

      <p className="text-xs text-slate-600">
        Updated {new Date(summary.generatedAt).toLocaleString("en-US")}. Admin-only; no document text
        or AI responses are stored in analytics.
      </p>
    </div>
  );
}
