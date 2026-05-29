import type { SupabaseClient } from "@/lib/supabase/types";
import {
  buildLimitSnapshot,
  getUserPlanLimits,
  type FeatureLimitSnapshot
} from "./limits";
import {
  canUploadPDF,
  canUseAIExplanations
} from "./gates";
import {
  aiDailyLimitMessage,
  aiDailyLimitTitle,
  pdfMonthlyLimitMessage,
  pdfMonthlyLimitTitle
} from "./messages";
import { getUserSubscription, type UserSubscription } from "./subscription";

export function getTodayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getMonthStartUtcIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getTodayAiUsageCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const today = getTodayUtcDateString();

  const { data, error } = await supabase
    .from("usage_limits")
    .select("ai_explanations_used")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (error || !data) {
    return 0;
  }

  return data.ai_explanations_used;
}

export async function ensureTodayUsageRow(supabase: SupabaseClient): Promise<void> {
  await supabase.rpc("ensure_today_usage_row");
}

export async function countDocumentsUploadedThisMonth(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const monthStart = getMonthStartUtcIso();

  const { count, error } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export type BillingUsageSnapshot = {
  subscription: UserSubscription;
  ai: FeatureLimitSnapshot;
  pdf: FeatureLimitSnapshot;
};

export async function getBillingUsageSnapshot(params: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<BillingUsageSnapshot> {
  const { supabase, userId } = params;
  const subscription = await getUserSubscription(supabase, userId);
  const planLimits = getUserPlanLimits(subscription.tier);

  const [usedToday, uploadsThisMonth] = await Promise.all([
    getTodayAiUsageCount(supabase, userId),
    countDocumentsUploadedThisMonth(supabase, userId)
  ]);

  return {
    subscription,
    ai: buildLimitSnapshot(usedToday, planLimits.dailyAiExplanations),
    pdf: buildLimitSnapshot(uploadsThisMonth, planLimits.monthlyPdfUploads)
  };
}

export type AiExplanationAllowanceResult =
  | {
      allowed: true;
      usage: FeatureLimitSnapshot;
      subscription: UserSubscription;
    }
  | {
      allowed: false;
      usage: FeatureLimitSnapshot;
      subscription: UserSubscription;
      title: string;
      message: string;
    };

export async function checkAiExplanationAllowance(params: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<AiExplanationAllowanceResult> {
  const { supabase, userId } = params;
  const subscription = await getUserSubscription(supabase, userId);

  await ensureTodayUsageRow(supabase);

  const usedToday = await getTodayAiUsageCount(supabase, userId);
  const gate = canUseAIExplanations({ subscription, usedToday });

  if (gate.allowed) {
    return { allowed: true, usage: gate.limits, subscription };
  }

  return {
    allowed: false,
    usage: gate.limits,
    subscription,
    title: aiDailyLimitTitle(),
    message: aiDailyLimitMessage(subscription.tier)
  };
}

export type PdfUploadAllowanceResult =
  | {
      allowed: true;
      usage: FeatureLimitSnapshot;
      subscription: UserSubscription;
    }
  | {
      allowed: false;
      usage: FeatureLimitSnapshot;
      subscription: UserSubscription;
      title: string;
      message: string;
    };

export async function checkPdfUploadAllowance(params: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<PdfUploadAllowanceResult> {
  const { supabase, userId } = params;
  const subscription = await getUserSubscription(supabase, userId);
  const uploadsThisMonth = await countDocumentsUploadedThisMonth(supabase, userId);
  const gate = canUploadPDF({ subscription, uploadsThisMonth });

  if (gate.allowed) {
    return { allowed: true, usage: gate.limits, subscription };
  }

  return {
    allowed: false,
    usage: gate.limits,
    subscription,
    title: pdfMonthlyLimitTitle(),
    message: pdfMonthlyLimitMessage(subscription.tier)
  };
}

export async function incrementAiExplanationUsage(params: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<FeatureLimitSnapshot | null> {
  const { supabase, userId } = params;
  const subscription = await getUserSubscription(supabase, userId);
  const planLimits = getUserPlanLimits(subscription.tier);

  await ensureTodayUsageRow(supabase);

  const { data: nextUsed, error } = await supabase.rpc("increment_ai_explanations_used");

  if (error || nextUsed == null) {
    return null;
  }

  return buildLimitSnapshot(nextUsed, planLimits.dailyAiExplanations);
}
