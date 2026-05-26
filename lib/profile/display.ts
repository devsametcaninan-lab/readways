import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UserDisplay = {
  name: string;
  email: string;
  avatarUrl: string | null;
  planLabel: string;
};

export function formatPlanLabel(plan: string | null | undefined): string {
  if (plan === "admin") return "Admin";
  if (plan === "pro_monthly" || plan === "pro_yearly" || plan === "pro") return "Pro";
  if (plan === "free") return "Personal Reader";
  return "Personal Reader";
}

export function resolveUserDisplayFromAuth(
  authUser: User,
  profile: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    plan: string | null;
  } | null
): UserDisplay {
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

  return {
    name: fullName?.trim() || email.split("@")[0] || "Reader",
    email,
    avatarUrl,
    planLabel: formatPlanLabel(profile?.plan)
  };
}

export async function fetchUserDisplay(
  supabase: SupabaseClient
): Promise<UserDisplay | null> {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url, plan")
    .eq("id", user.id)
    .maybeSingle();

  return resolveUserDisplayFromAuth(user, profile);
}
