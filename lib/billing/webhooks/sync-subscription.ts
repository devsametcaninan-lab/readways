import type { SupabaseClient } from "@/lib/supabase/types";
import type { ProviderSubscriptionSyncPayload } from "../providers/types";

/**
 * Applies a provider webhook payload to the user's profile.
 * Called by future `/api/billing/webhooks/stripe` and `/api/billing/webhooks/iyzico` routes.
 */
export async function syncSubscriptionFromProvider(
  supabase: SupabaseClient,
  payload: ProviderSubscriptionSyncPayload
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      plan: payload.plan,
      subscription_status: payload.subscriptionStatus,
      current_period_end: payload.currentPeriodEnd,
      trial_ends_at: payload.trialEndsAt ?? null,
      billing_provider: payload.provider,
      billing_customer_id: payload.customerId
    })
    .eq("id", payload.userId);

  if (error) {
    throw new Error(error.message);
  }
}
