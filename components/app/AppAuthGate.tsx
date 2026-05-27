"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import AppRouteLoading from "./AppRouteLoading";

type GateState = "loading" | "authed" | "redirecting";

export default function AppAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GateState>("loading");

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setState("redirecting");
      router.replace("/login");
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) {
        return;
      }

      if (!user) {
        setState("redirecting");
        const next = encodeURIComponent(pathname);
        router.replace(`/login?next=${next}`);
        return;
      }

      setState("authed");
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setState("redirecting");
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (state !== "authed") {
    return <AppRouteLoading />;
  }

  return children;
}
