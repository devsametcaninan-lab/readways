import { notFound } from "next/navigation";
import AiUsageMonitoringView from "@/components/admin/AiUsageMonitoringView";
import { getAiUsageMonitoringSummary } from "@/lib/ai-monitoring/aggregate";
import { requireAdminUser } from "@/lib/auth/require-admin";

export const metadata = {
  title: "AI Usage · ReadWays",
  robots: { index: false, follow: false }
};

export default async function AdminAiUsagePage() {
  await requireAdminUser();

  const result = await getAiUsageMonitoringSummary();

  if (!result) {
    notFound();
  }

  return (
    <AiUsageMonitoringView summary={result.summary} queryFailed={result.queryFailed} />
  );
}
