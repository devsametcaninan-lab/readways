"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { normalizePlan } from "@/lib/billing/plans";
import type { Plan } from "@/lib/supabase/schema";
import { resolveUserDisplayFromAuth, type UserDisplay } from "@/lib/profile/display";

export type AppUserDisplay = UserDisplay & {
  plan: Plan;
  loading: boolean;
};

const fallback: AppUserDisplay = {
  name: "Reader",
  email: "",
  avatarUrl: null,
  planLabel: "Personal Reader",
  plan: "free",
  loading: false
};

export function useAppUser(): AppUserDisplay {
  const [user, setUser] = useState<AppUserDisplay>({ ...fallback, loading: true });

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setUser(fallback);
      return;
    }

    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!authUser) {
        setUser({ ...fallback, loading: false });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url, plan")
        .eq("id", authUser.id)
        .maybeSingle();

      if (cancelled) return;

      const display = resolveUserDisplayFromAuth(authUser, profile);

      setUser({
        ...display,
        plan: normalizePlan(profile?.plan),
        loading: false
      });
    }

    load().catch(() => {
      if (!cancelled) setUser({ ...fallback, loading: false });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
