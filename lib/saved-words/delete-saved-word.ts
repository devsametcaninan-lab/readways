import type { SupabaseClient } from "@/lib/supabase/types";

export type DeleteSavedWordResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "db_error" };

export async function deleteSavedWordForUser(params: {
  supabase: SupabaseClient;
  userId: string;
  savedWordId: string;
}): Promise<DeleteSavedWordResult> {
  const { supabase, userId, savedWordId } = params;

  const { data, error } = await supabase
    .from("saved_words")
    .delete()
    .eq("id", savedWordId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, reason: "db_error" };
  }

  if (!data) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true };
}
