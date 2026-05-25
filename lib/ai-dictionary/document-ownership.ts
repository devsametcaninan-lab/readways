import type { SupabaseClient } from "@/lib/supabase/types";

/**
 * Returns true when the document exists and belongs to the given user.
 * Uses the authenticated Supabase client (RLS applies on select).
 */
export async function documentBelongsToUser(
  supabase: SupabaseClient,
  documentId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("documents")
    .select("user_id")
    .eq("id", documentId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return data.user_id === userId;
}
