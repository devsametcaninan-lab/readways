export {
  BILLING_PROVIDER_VALUES,
  normalizePlan,
  planDisplayName,
  planToTier,
  isProPlan,
  isAdminPlan,
  type BillingProvider,
  type Plan,
  type PlanTier,
  type SubscriptionStatus
} from "./plans";

export {
  buildLimitSnapshot,
  getUserPlanLimits,
  type FeatureLimitSnapshot,
  type UserPlanLimits
} from "./limits";

export {
  canUploadPDF,
  canUseAIExplanations,
  isProUser,
  subscriptionGrantsProEntitlement
} from "./gates";

export {
  getUserSubscription,
  effectivePlanTier,
  type UserSubscription
} from "./subscription";

export {
  checkAiExplanationAllowance,
  checkPdfUploadAllowance,
  getBillingUsageSnapshot,
  incrementAiExplanationUsage,
  getTodayAiUsageCount,
  countDocumentsUploadedThisMonth,
  type AiExplanationAllowanceResult,
  type PdfUploadAllowanceResult,
  type BillingUsageSnapshot
} from "./usage";

export {
  aiDailyLimitMessage,
  aiDailyLimitTitle,
  pdfMonthlyLimitMessage,
  pdfMonthlyLimitTitle,
  upgradeCtaLabel,
  PAYWALL_CODES,
  type PaywallCode
} from "./messages";

export { syncSubscriptionFromProvider } from "./webhooks/sync-subscription";
export type { ProviderSubscriptionSyncPayload } from "./providers/types";
