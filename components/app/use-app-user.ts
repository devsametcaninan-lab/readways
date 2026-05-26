"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { mockUser } from "@/lib/mock-data";

export type AppUserDisplay = {
  name: string;
  email: string;
  avatarUrl: string | null;
  planLabel: string;
  loading: boolean;
};

const fallback: AppUserDisplay = {
  name: mockUser.name,
  email: "",
  avatarUrl: null,
  planLabel: mockUser.plan,
  loading: false
};

function formatPlanLabel(plan: string | null | undefined): string {
  if (plan === "admin") return "Admin";
  if (plan === "pro_monthly" || plan === "pro_yearly" || plan === "pro") return "Pro";
  if (plan === "free") return "Personal Reader";
  return mockUser.plan;
}

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

      const meta = authUser.user_metadata ?? {};
      const avatarUrl =
        profile?.avatar_url ??
        (typeof meta.avatar_url === "string" ? meta.avatar_url : null) ??
        (typeof meta.picture === "string" ? meta.picture : null);

      const fullName =
        profile?.full_name ??
        (typeof meta.full_name === "string" ? meta.full_name : null) ??
        (typeof meta.name === "string" ? meta.name : null);

      const email = profile?.email ?? authUser.email ?? "";

      setUser({
        name: fullName || email.split("@")[0] || "Reader",
        email,
        avatarUrl,
        planLabel: formatPlanLabel(profile?.plan),
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
