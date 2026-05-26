import { createClient } from "@/lib/supabase/server";
import { fetchUserDisplay } from "@/lib/profile/display";
import { fetchDashboardData } from "./queries";
import type { DashboardData } from "./types";
import type { UserDisplay } from "@/lib/profile/display";

export type DashboardPageData = {
  user: UserDisplay;
  dashboard: DashboardData;
};

export async function getDashboardPageData(): Promise<DashboardPageData | null> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [userDisplay, dashboard] = await Promise.all([
    fetchUserDisplay(supabase),
    fetchDashboardData(supabase, user.id)
  ]);

  if (!userDisplay) {
    return null;
  }

  return { user: userDisplay, dashboard };
}
