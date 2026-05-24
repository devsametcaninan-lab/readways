import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { requireSupabaseEnv } from "./env";

/**
 * Browser Supabase client — use in Client Components when auth/data layer is added.
 */
export function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
