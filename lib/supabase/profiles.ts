import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "./types";

export async function ensureProfileExists(supabase: SupabaseClient, user: User) {
  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    null;

  const avatarUrl =
    (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) || null;

  const profileRow = {
    id: user.id,
    email: user.email ?? "",
    full_name: fullName,
    avatar_url: avatarUrl
  };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({ ...profileRow, plan: "free" });
    return;
  }

  await supabase.from("profiles").update(profileRow).eq("id", user.id);
}
