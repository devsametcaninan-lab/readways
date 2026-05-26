import type { Json } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@/lib/supabase/types";
import {
  mergeOnboardingDismiss,
  parseOnboardingState,
  type OnboardingState,
  type OnboardingStep
} from "./types";
import { ONBOARDING_STORAGE_KEY } from "./constants";

export function readOnboardingCache(): OnboardingState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return parseOnboardingState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeOnboardingCache(state: OnboardingState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export async function fetchOnboardingState(
  supabase: SupabaseClient,
  userId: string
): Promise<OnboardingState> {
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return readOnboardingCache() ?? {};
  }

  const parsed = parseOnboardingState(data.onboarding);
  writeOnboardingCache(parsed);
  return parsed;
}

export async function dismissOnboardingStep(params: {
  supabase: SupabaseClient;
  userId: string;
  current: OnboardingState;
  step: OnboardingStep;
}): Promise<OnboardingState> {
  const next = mergeOnboardingDismiss(params.current, params.step);
  writeOnboardingCache(next);

  const { error } = await params.supabase
    .from("profiles")
    .update({ onboarding: next as Json })
    .eq("id", params.userId);

  if (error) {
    throw new Error(error.message);
  }

  return next;
}
