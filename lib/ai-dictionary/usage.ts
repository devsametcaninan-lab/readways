import { dailyExplanationLimitMessage, getDailyExplanationLimit } from "./plan-limits";
import type { ExplainWordUsage } from "./types";
import type { Plan } from "@/lib/supabase/schema";
import type { SupabaseClient } from "@/lib/supabase/types";

export function getTodayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildUsageSnapshot(used: number, limit: number): ExplainWordUsage {
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used)
  };
}

export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<Plan> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return "free";
  }

  return data.plan === "pro" ? "pro" : "free";
}

export async function getTodayUsageCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const today = getTodayUtcDateString();

  const { data, error } = await supabase
    .from("usage_limits")
    .select("ai_explanations_used")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (error || !data) {
    return 0;
  }

  return data.ai_explanations_used;
}

export async function ensureTodayUsageRow(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const today = getTodayUtcDateString();

  const { data: existing } = await supabase
    .from("usage_limits")
    .select("id")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    return;
  }

  await supabase.from("usage_limits").insert({
    user_id: userId,
    date: today,
    ai_explanations_used: 0,
    pdf_uploads_used: 0
  });
}

export type ExplanationAllowanceResult =
  | { allowed: true; usage: ExplainWordUsage; plan: Plan }
  | { allowed: false; usage: ExplainWordUsage; plan: Plan; message: string };

export async function checkExplanationAllowance(params: {
  supabase: SupabaseClient;
  userId: string;
  plan: Plan;
}): Promise<ExplanationAllowanceResult> {
  const { supabase, userId, plan } = params;
  const limit = getDailyExplanationLimit(plan);

  await ensureTodayUsageRow(supabase, userId);

  const used = await getTodayUsageCount(supabase, userId);
  const usage = buildUsageSnapshot(used, limit);

  if (used >= limit) {
    return {
      allowed: false,
      usage,
      plan,
      message: dailyExplanationLimitMessage(plan, limit)
    };
  }

  return { allowed: true, usage, plan };
}

export async function getExplanationUsageSnapshot(params: {
  supabase: SupabaseClient;
  userId: string;
  plan: Plan;
}): Promise<ExplainWordUsage> {
  const { supabase, userId, plan } = params;
  const limit = getDailyExplanationLimit(plan);
  const used = await getTodayUsageCount(supabase, userId);
  return buildUsageSnapshot(used, limit);
}

export async function incrementExplanationUsage(params: {
  supabase: SupabaseClient;
  userId: string;
  plan: Plan;
}): Promise<ExplainWordUsage | null> {
  const { supabase, userId, plan } = params;
  const today = getTodayUtcDateString();
  const limit = getDailyExplanationLimit(plan);

  await ensureTodayUsageRow(supabase, userId);

  const usedBefore = await getTodayUsageCount(supabase, userId);
  const nextUsed = usedBefore + 1;

  const { error } = await supabase
    .from("usage_limits")
    .update({ ai_explanations_used: nextUsed })
    .eq("user_id", userId)
    .eq("date", today);

  if (error) {
    return null;
  }

  return buildUsageSnapshot(nextUsed, limit);
}
