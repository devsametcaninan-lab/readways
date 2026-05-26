import AppCard from "@/components/app/AppCard";
import { getAnalyticsUsageSummaryForUser } from "@/lib/analytics/summary";

export default async function AnalyticsDevSummary() {
  const summary = await getAnalyticsUsageSummaryForUser();

  if (!summary) {
    return null;
  }

  return (
    <AppCard>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
        Developer · Analytics (7 days)
      </p>
      <p className="mt-3 text-sm text-slate-400">
        {summary.totalEvents} events since{" "}
        {new Date(summary.since).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        })}
      </p>
      {summary.byEvent.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No events recorded yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {summary.byEvent.map((row) => (
            <li
              key={row.eventName}
              className="flex items-center justify-between text-sm text-slate-300"
            >
              <span className="font-mono text-[12px] text-slate-400">{row.eventName}</span>
              <span className="tabular-nums text-slate-200">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </AppCard>
  );
}
