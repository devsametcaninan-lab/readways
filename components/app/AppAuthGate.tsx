"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { useI18n } from "@/lib/i18n/provider";
import AppRouteLoading from "./AppRouteLoading";

type GateState = "loading" | "authed" | "redirecting";

export default function AppAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [state, setState] = useState<GateState>("loading");
  const [loadingLabel, setLoadingLabel] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setState("redirecting");
      router.replace("/login");
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    const redirectToLogin = (reason?: "session_expired") => {
      setState("redirecting");
      if (reason === "session_expired") {
        setLoadingLabel(t("auth.sessionExpiredRedirecting"));
      }
      const next = encodeURIComponent(pathname);
      const reasonParam = reason ? `&reason=${reason}` : "";
      router.replace(`/login?next=${next}${reasonParam}`);
    };

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) {
        return;
      }

      if (!user) {
        redirectToLogin();
        return;
      }

      setState("authed");
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        redirectToLogin("session_expired");
        return;
      }

      if ((event === "TOKEN_REFRESHED" || event === "USER_UPDATED") && !session?.user) {
        redirectToLogin("session_expired");
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (state !== "authed") {
    return <AppRouteLoading label={loadingLabel} />;
  }

  return children;
}
