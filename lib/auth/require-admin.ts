import { notFound } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getUserPlan } from "@/lib/ai-dictionary/usage";
import { planToTier } from "@/lib/billing/plans";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./require-user";

export async function isAdminUser(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const plan = await getUserPlan(supabase, userId);
  return planToTier(plan) === "admin";
}

export async function requireAdminUser(): Promise<User> {
  const user = await requireUser();

  if (!(await isAdminUser(user.id))) {
    notFound();
  }

  return user;
}
