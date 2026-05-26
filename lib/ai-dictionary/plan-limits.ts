import { getUserPlanLimits } from "@/lib/billing/limits";
import { effectivePlanTier } from "@/lib/billing/subscription";
import type { Plan } from "@/lib/supabase/schema";
import { normalizePlan } from "@/lib/billing/plans";

/** @deprecated Use getUserPlanLimits from @/lib/billing */
export function getDailyExplanationLimit(plan: Plan): number {
  const tier = effectivePlanTier({
    plan: normalizePlan(plan),
    subscriptionStatus: "active"
  });

  return getUserPlanLimits(tier).dailyAiExplanations;
}

export function dailyExplanationLimitMessage(_plan: Plan, limit: number): string {
  return `You've reached your daily limit of ${limit} AI explanations. Upgrade to continue reading without limits.`;
}
