import type { ExplainWordUsage } from "./types";
import {
  buildLimitSnapshot,
  getUserPlanLimits
} from "@/lib/billing/limits";
import {
  checkAiExplanationAllowance,
  getTodayAiUsageCount,
  incrementAiExplanationUsage
} from "@/lib/billing/usage";
import { getUserSubscription } from "@/lib/billing/subscription";
import { normalizePlan } from "@/lib/billing/plans";
import type { Plan } from "@/lib/supabase/schema";
import type { SupabaseClient } from "@/lib/supabase/types";

export { getTodayUtcDateString } from "@/lib/billing/usage";

export function buildUsageSnapshot(used: number, limit: number): ExplainWordUsage {
  const snapshot = buildLimitSnapshot(used, limit);

  return {
    used: snapshot.used,
    limit: snapshot.limit,
    remaining: snapshot.remaining
  };
}

/** @deprecated Prefer getUserSubscription from @/lib/billing */
export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<Plan> {
  const subscription = await getUserSubscription(supabase, userId);
  return subscription.plan;
}

export { getTodayAiUsageCount as getTodayUsageCount };

export { ensureTodayUsageRow } from "@/lib/billing/usage";

export type ExplanationAllowanceResult =
  | { allowed: true; usage: ExplainWordUsage; plan: Plan }
  | { allowed: false; usage: ExplainWordUsage; plan: Plan; message: string; title: string };

export async function checkExplanationAllowance(params: {
  supabase: SupabaseClient;
  userId: string;
  plan?: Plan;
}): Promise<ExplanationAllowanceResult> {
  const allowance = await checkAiExplanationAllowance({
    supabase: params.supabase,
    userId: params.userId
  });

  const plan = params.plan ?? allowance.subscription.plan;
  const usage = buildUsageSnapshot(allowance.usage.used, allowance.usage.limit);

  if (allowance.allowed) {
    return { allowed: true, usage, plan };
  }

  return {
    allowed: false,
    usage,
    plan,
    title: allowance.title,
    message: allowance.message
  };
}

export async function getExplanationUsageSnapshot(params: {
  supabase: SupabaseClient;
  userId: string;
  plan?: Plan;
}): Promise<ExplainWordUsage> {
  const subscription = await getUserSubscription(params.supabase, params.userId);
  const plan = params.plan ?? subscription.plan;
  const tier = subscription.tier;
  const limit = getUserPlanLimits(tier).dailyAiExplanations;
  const used = await getTodayAiUsageCount(params.supabase, params.userId);

  return buildUsageSnapshot(used, limit);
}

export async function incrementExplanationUsage(params: {
  supabase: SupabaseClient;
  userId: string;
  plan?: Plan;
}): Promise<ExplainWordUsage | null> {
  const snapshot = await incrementAiExplanationUsage({
    supabase: params.supabase,
    userId: params.userId
  });

  if (!snapshot) {
    return null;
  }

  return buildUsageSnapshot(snapshot.used, snapshot.limit);
}
