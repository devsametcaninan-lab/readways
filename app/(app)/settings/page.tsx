import AnalyticsDevSummary from "@/components/analytics/AnalyticsDevSummary";
import SettingsView from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <>
      <SettingsView />
      {process.env.NODE_ENV === "development" ? (
        <div className="mx-auto max-w-xl px-6 pb-10 md:px-8 lg:px-10">
          <AnalyticsDevSummary />
        </div>
      ) : null}
    </>
  );
}
