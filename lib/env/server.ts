/**
 * Server-only environment checks. Never import from client components.
 */

const FORBIDDEN_PUBLIC_SECRET_ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY"
] as const;

let publicSecretGuardRan = false;

/**
 * Fail fast when a server secret is accidentally exposed via NEXT_PUBLIC_*.
 */
export function assertNoPublicServerSecrets(): void {
  if (publicSecretGuardRan) {
    return;
  }

  publicSecretGuardRan = true;

  for (const key of FORBIDDEN_PUBLIC_SECRET_ENV_KEYS) {
    const publicKey = `NEXT_PUBLIC_${key}`;
    if (process.env[publicKey]?.trim()) {
      throw new Error(
        `Misconfigured env: remove ${publicKey}. Use server-only ${key} instead.`
      );
    }
  }

  if (process.env.NEXT_PUBLIC_OPENAI_API_KEY?.trim()) {
    throw new Error(
      "Misconfigured env: remove NEXT_PUBLIC_OPENAI_API_KEY. OpenAI must stay server-only."
    );
  }
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getServerEnvSummary(): {
  supabaseConfigured: boolean;
  openaiConfigured: boolean;
} {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );

  return {
    supabaseConfigured,
    openaiConfigured: isOpenAIConfigured()
  };
}
