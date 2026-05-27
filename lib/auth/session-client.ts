import { clearOnboardingCache } from "@/lib/onboarding/profile";

/** Clear client-only session UI state on sign-out. */
export function clearAppSessionState(): void {
  clearOnboardingCache();
}
