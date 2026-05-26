"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { resolveUserDisplayFromAuth, type UserDisplay } from "@/lib/profile/display";

export type AppUserDisplay = UserDisplay & {
  loading: boolean;
};

const fallback: AppUserDisplay = {
  name: "Reader",
  email: "",
  avatarUrl: null,
  planLabel: "Personal Reader",
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
