"use client";

import { createClient } from "@/lib/supabase/client";
import { fetchDashboardData } from "./queries";
import type { DashboardData } from "./types";

export async function fetchDashboardDataForCurrentUser(): Promise<DashboardData | null> {
  const supabase = createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return fetchDashboardData(supabase, user.id);
}
