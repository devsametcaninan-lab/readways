import type { PlanTier } from "./plans";

export const PAYWALL_CODES = {
  AI_DAILY_LIMIT: "ai_daily_limit",
  PDF_MONTHLY_LIMIT: "pdf_monthly_limit"
} as const;

export type PaywallCode = (typeof PAYWALL_CODES)[keyof typeof PAYWALL_CODES];

export function aiDailyLimitTitle(): string {
  return "Daily AI limit reached";
}

export function aiDailyLimitMessage(tier: PlanTier): string {
  if (tier === "pro" || tier === "admin") {
    return "You've used all AI explanations available for today. Try again tomorrow.";
  }

  return "Upgrade to continue reading without limits.";
}

export function pdfMonthlyLimitTitle(): string {
  return "Monthly PDF limit reached";
}

export function pdfMonthlyLimitMessage(tier: PlanTier): string {
  if (tier === "pro" || tier === "admin") {
    return "You've reached your monthly PDF upload limit.";
  }

  return "Upgrade to upload more documents and keep learning.";
}

export function upgradeCtaLabel(): string {
  return "View upgrade options";
}
