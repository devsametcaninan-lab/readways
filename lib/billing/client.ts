"use client";

import type { FeatureLimitSnapshot } from "./limits";
import type { Plan, PlanTier, SubscriptionStatus } from "./plans";

export type BillingLimitsResponse = {
  plan: Plan;
  tier: PlanTier;
  subscriptionStatus: SubscriptionStatus;
  isPro: boolean;
  ai: FeatureLimitSnapshot;
  pdf: FeatureLimitSnapshot;
};

export class BillingLimitError extends Error {
  readonly title: string;
  readonly code = "limit_reached" as const;
  readonly usage?: FeatureLimitSnapshot;

  constructor(params: { title: string; message: string; usage?: FeatureLimitSnapshot }) {
    super(params.message);
    this.name = "BillingLimitError";
    this.title = params.title;
    this.usage = params.usage;
  }
}

export async function fetchBillingLimits(): Promise<BillingLimitsResponse> {
  const response = await fetch("/api/billing/limits", {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Could not load plan limits.");
  }

  return response.json() as Promise<BillingLimitsResponse>;
}

export async function assertPdfUploadAllowed(): Promise<BillingLimitsResponse> {
  const limits = await fetchBillingLimits();

  if (!limits.pdf.allowed) {
    throw new BillingLimitError({
      title: "Monthly PDF limit reached",
      message: limits.isPro
        ? "You've reached your monthly PDF upload limit."
        : "Upgrade to upload more documents and keep learning.",
      usage: limits.pdf
    });
  }

  return limits;
}
