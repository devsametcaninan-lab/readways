import type { Plan } from "@/lib/supabase/schema";

export const DAILY_EXPLANATION_LIMITS: Record<Plan, number> = {
  free: 20,
  pro: 300
};

export function getDailyExplanationLimit(plan: Plan): number {
  return DAILY_EXPLANATION_LIMITS[plan];
}

export function dailyExplanationLimitMessage(plan: Plan, limit: number): string {
  if (plan === "pro") {
    return `You've reached your daily limit of ${limit} explanations.`;
  }

  return `You've reached your daily limit of ${limit} explanations. Upgrade to Pro for more.`;
}
