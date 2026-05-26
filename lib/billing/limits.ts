import type { PlanTier } from "./plans";

export type FeatureLimitSnapshot = {
  used: number;
  limit: number;
  remaining: number;
  allowed: boolean;
};

export type UserPlanLimits = {
  tier: PlanTier;
  dailyAiExplanations: number;
  monthlyPdfUploads: number;
  unlimited: boolean;
};

const FREE_DAILY_AI = 20;
const FREE_MONTHLY_PDFS = 3;
const PRO_DAILY_AI = 300;
const PRO_MONTHLY_PDFS = 100;

const ADMIN_DAILY_AI = 1_000_000;
const ADMIN_MONTHLY_PDFS = 1_000_000;

export function getUserPlanLimits(tier: PlanTier): UserPlanLimits {
  switch (tier) {
    case "admin":
      return {
        tier,
        dailyAiExplanations: ADMIN_DAILY_AI,
        monthlyPdfUploads: ADMIN_MONTHLY_PDFS,
        unlimited: true
      };
    case "pro":
      return {
        tier,
        dailyAiExplanations: PRO_DAILY_AI,
        monthlyPdfUploads: PRO_MONTHLY_PDFS,
        unlimited: false
      };
  }

  return {
    tier: "free",
    dailyAiExplanations: FREE_DAILY_AI,
    monthlyPdfUploads: FREE_MONTHLY_PDFS,
    unlimited: false
  };
}

export function buildLimitSnapshot(used: number, limit: number): FeatureLimitSnapshot {
  const safeLimit = Math.max(0, limit);

  return {
    used,
    limit: safeLimit,
    remaining: Math.max(0, safeLimit - used),
    allowed: used < safeLimit
  };
}
