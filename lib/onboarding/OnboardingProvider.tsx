"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  dismissOnboardingStep,
  fetchOnboardingState,
  readOnboardingCache
} from "./profile";
import {
  isStepComplete,
  mergeOnboardingDismiss,
  type OnboardingState,
  type OnboardingStep
} from "./types";

type OnboardingContextValue = {
  ready: boolean;
  state: OnboardingState;
  shouldShow: (step: OnboardingStep) => boolean;
  dismiss: (step: OnboardingStep) => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }

  return ctx;
}

export function useOnboardingOptional(): OnboardingContextValue | null {
  return useContext(OnboardingContext);
}

export default function OnboardingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<OnboardingState>(() => readOnboardingCache() ?? {});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (cancelled) {
        return;
      }

      if (!user) {
        setReady(true);
        return;
      }

      setUserId(user.id);

      try {
        const remote = await fetchOnboardingState(supabase, user.id);
        if (!cancelled) {
          setState(remote);
        }
      } catch {
        // keep cached/local state
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const shouldShow = useCallback(
    (step: OnboardingStep) => ready && !isStepComplete(state, step),
    [ready, state]
  );

  const dismiss = useCallback(
    async (step: OnboardingStep) => {
      const next = mergeOnboardingDismiss(state, step);
      setState(next);

      if (!userId) {
        return;
      }

      try {
        const supabase = createClient();
        const saved = await dismissOnboardingStep({
          supabase,
          userId,
          current: state,
          step
        });
        setState(saved);
      } catch {
        // optimistic UI already updated; cache is written in dismissOnboardingStep attempt
      }
    },
    [state, userId]
  );

  const value = useMemo(
    () => ({ ready, state, shouldShow, dismiss }),
    [ready, state, shouldShow, dismiss]
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}
