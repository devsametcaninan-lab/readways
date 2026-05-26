import DashboardView from "@/components/dashboard/DashboardView";
import { getDashboardPageData } from "@/lib/dashboard/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const data = await getDashboardPageData();

  if (!data) {
    redirect("/login");
  }

  return <DashboardView data={data} />;
}
