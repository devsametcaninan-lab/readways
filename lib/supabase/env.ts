/**
 * Supabase environment variables (optional until auth/storage is wired).
 * Frontend continues to work without these set.
 */

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { url, anonKey };
}

export function hasSupabaseEnv(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey);
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return { url, anonKey };
}
