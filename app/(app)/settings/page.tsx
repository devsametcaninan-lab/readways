import AppCard from "@/components/app/AppCard";
import AnalyticsDevSummary from "@/components/analytics/AnalyticsDevSummary";
import { mockUser } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-slate-400">Manage your account and reading preferences.</p>
      </div>

      <div className="mx-auto max-w-xl space-y-4">
        <AppCard>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
            Profile
          </p>
          <p className="mt-3 text-sm text-slate-300">Name</p>
          <p className="mt-1 text-base text-white">{mockUser.name}</p>
          <p className="mt-4 text-sm text-slate-300">Plan</p>
          <p className="mt-1 text-base text-white">{mockUser.plan}</p>
        </AppCard>

        <AppCard>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
            Reading
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Highlight mode</span>
              <span className="text-slate-300">On</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Auto-save words</span>
              <span className="text-slate-300">Off</span>
            </div>
          </div>
        </AppCard>

        <AppCard>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
            Appearance
          </p>
          <p className="mt-3 text-sm text-slate-400">Dark theme (default)</p>
        </AppCard>

        {process.env.NODE_ENV === "development" ? <AnalyticsDevSummary /> : null}
      </div>
    </div>
  );
}
