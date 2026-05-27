import { redirect } from "next/navigation";
import DashboardView from "@/components/dashboard/DashboardView";
import { getDashboardPageData } from "@/lib/dashboard/server";

export default async function DashboardPage() {
  const data = await getDashboardPageData();

  if (!data) {
    redirect("/login");
  }

  return <DashboardView data={data} />;
}
