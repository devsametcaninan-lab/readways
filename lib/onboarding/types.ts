export const ONBOARDING_STEPS = ["welcome", "reader", "flashcards"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** ISO timestamps for dismissed/completed steps. */
export type OnboardingState = {
  welcomeAt?: string;
  readerAt?: string;
  flashcardsAt?: string;
};

export function parseOnboardingState(value: unknown): OnboardingState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const state: OnboardingState = {};

  if (typeof record.welcomeAt === "string") {
    state.welcomeAt = record.welcomeAt;
  }
  if (typeof record.readerAt === "string") {
    state.readerAt = record.readerAt;
  }
  if (typeof record.flashcardsAt === "string") {
    state.flashcardsAt = record.flashcardsAt;
  }

  return state;
}

export function isStepComplete(
  state: OnboardingState,
  step: OnboardingStep
): boolean {
  switch (step) {
    case "welcome":
      return Boolean(state.welcomeAt);
    case "reader":
      return Boolean(state.readerAt);
    case "flashcards":
      return Boolean(state.flashcardsAt);
    default:
      return false;
  }
}

export function mergeOnboardingDismiss(
  current: OnboardingState,
  step: OnboardingStep
): OnboardingState {
  const at = new Date().toISOString();

  switch (step) {
    case "welcome":
      return { ...current, welcomeAt: at };
    case "reader":
      return { ...current, readerAt: at };
    case "flashcards":
      return { ...current, flashcardsAt: at };
    default:
      return current;
  }
}
