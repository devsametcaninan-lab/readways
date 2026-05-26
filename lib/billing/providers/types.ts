import type { BillingProvider } from "../plans";
import type { Plan, SubscriptionStatus } from "../plans";

/** Payload shape future checkout sessions will produce (not used yet). */
export type CheckoutSessionRequest = {
  plan: Extract<Plan, "pro_monthly" | "pro_yearly">;
  provider: BillingProvider;
  successUrl: string;
  cancelUrl: string;
};

/** Normalized subscription update from a payment provider webhook (not wired yet). */
export type ProviderSubscriptionSyncPayload = {
  provider: BillingProvider;
  customerId: string;
  userId: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  trialEndsAt?: string | null;
};
