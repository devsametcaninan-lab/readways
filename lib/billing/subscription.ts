import {
  isAdminPlan,
  isProPlan,
  normalizePlan,
  type Plan,
  type PlanTier,
  planToTier
} from "./plans";
import type { BillingProvider, SubscriptionStatus } from "./plans";
import type { SupabaseClient } from "@/lib/supabase/types";

export type UserSubscription = {
  userId: string;
  plan: Plan;
  tier: PlanTier;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  billingProvider: BillingProvider | null;
  billingCustomerId: string | null;
};

const ENTITLED_STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  "active",
  "trialing"
]);

export function subscriptionGrantsProEntitlement(
  subscription: Pick<UserSubscription, "plan" | "subscriptionStatus">
): boolean {
  if (isAdminPlan(subscription.plan)) {
    return true;
  }

  if (!isProPlan(subscription.plan)) {
    return false;
  }

  return ENTITLED_STATUSES.has(subscription.subscriptionStatus);
}

export function effectivePlanTier(
  subscription: Pick<UserSubscription, "plan" | "subscriptionStatus">
): PlanTier {
  if (isAdminPlan(subscription.plan)) {
    return "admin";
  }

  if (subscriptionGrantsProEntitlement(subscription)) {
    return "pro";
  }

  return "free";
}

export async function getUserSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<UserSubscription> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, plan, subscription_status, current_period_end, trial_ends_at, billing_provider, billing_customer_id"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return {
      userId,
      plan: "free",
      tier: "free",
      subscriptionStatus: "active",
      currentPeriodEnd: null,
      trialEndsAt: null,
      billingProvider: null,
      billingCustomerId: null
    };
  }

  const plan = normalizePlan(data.plan);
  const subscriptionStatus = (data.subscription_status ??
    "active") as SubscriptionStatus;

  const base = {
    userId,
    plan,
    subscriptionStatus,
    currentPeriodEnd: data.current_period_end,
    trialEndsAt: data.trial_ends_at,
    billingProvider: data.billing_provider as BillingProvider | null,
    billingCustomerId: data.billing_customer_id
  };

  return {
    ...base,
    tier: effectivePlanTier({ plan, subscriptionStatus })
  };
}
