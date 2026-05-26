import {
  PLAN_VALUES,
  type Plan,
  SUBSCRIPTION_STATUS_VALUES,
  type SubscriptionStatus
} from "@/lib/supabase/schema";

export { PLAN_VALUES, SUBSCRIPTION_STATUS_VALUES };
export type { Plan, SubscriptionStatus };

export const BILLING_PROVIDER_VALUES = ["iyzico", "stripe"] as const;
export type BillingProvider = (typeof BILLING_PROVIDER_VALUES)[number];

export type PlanTier = "free" | "pro" | "admin";

const PRO_PLANS: ReadonlySet<Plan> = new Set(["pro_monthly", "pro_yearly"]);

const LEGACY_PRO_PLAN = "pro" as const;

/** Maps DB plan to limit tier (admin and entitled pro vs free). */
export function planToTier(plan: string | null | undefined): PlanTier {
  const normalized = normalizePlan(plan);

  if (normalized === "admin") {
    return "admin";
  }

  if (PRO_PLANS.has(normalized)) {
    return "pro";
  }

  return "free";
}

/** Canonical plan value from DB (handles legacy `pro`). */
export function normalizePlan(plan: string | null | undefined): Plan {
  if (!plan) {
    return "free";
  }

  if (plan === LEGACY_PRO_PLAN) {
    return "pro_monthly";
  }

  if ((PLAN_VALUES as readonly string[]).includes(plan)) {
    return plan as Plan;
  }

  return "free";
}

export function isProPlan(plan: Plan): boolean {
  return PRO_PLANS.has(plan);
}

export function isAdminPlan(plan: Plan): boolean {
  return plan === "admin";
}

export function planDisplayName(plan: Plan): string {
  switch (plan) {
    case "admin":
      return "Admin";
    case "pro_monthly":
      return "Pro Monthly";
    case "pro_yearly":
      return "Pro Yearly";
    case "free":
    default:
      return "Free";
  }
}
