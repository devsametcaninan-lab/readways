import { buildLimitSnapshot, getUserPlanLimits, type FeatureLimitSnapshot } from "./limits";
import {
  effectivePlanTier,
  type UserSubscription,
  subscriptionGrantsProEntitlement
} from "./subscription";

export function isProUser(
  subscription: Pick<UserSubscription, "plan" | "subscriptionStatus" | "tier">
): boolean {
  return subscription.tier === "pro" || subscription.tier === "admin";
}

export function canUseAIExplanations(params: {
  subscription: UserSubscription;
  usedToday: number;
}): { allowed: boolean; limits: FeatureLimitSnapshot } {
  const tier = effectivePlanTier(params.subscription);
  const planLimits = getUserPlanLimits(tier);
  const limits = buildLimitSnapshot(params.usedToday, planLimits.dailyAiExplanations);

  return { allowed: limits.allowed, limits };
}

export function canUploadPDF(params: {
  subscription: UserSubscription;
  uploadsThisMonth: number;
}): { allowed: boolean; limits: FeatureLimitSnapshot } {
  const tier = effectivePlanTier(params.subscription);
  const planLimits = getUserPlanLimits(tier);
  const limits = buildLimitSnapshot(
    params.uploadsThisMonth,
    planLimits.monthlyPdfUploads
  );

  return { allowed: limits.allowed, limits };
}

export { getUserPlanLimits, subscriptionGrantsProEntitlement };
