"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type AuthCardProps = {
  mode: "login" | "signup";
  plan?: "free" | "pro" | null;
};

export default function AuthCard({ mode, plan }: AuthCardProps) {
  const [loading, setLoading] = useState(false);
  const envReady = hasSupabaseEnv();

  const title = mode === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Sign in to continue your reading and vocabulary progress."
      : "Start with Google and open your reading dashboard in seconds.";

  const planText = useMemo(() => {
    if (plan === "pro") return "Selected plan: Pro";
    if (plan === "free") return "Selected plan: Free";
    return null;
  }, [plan]);

  const handleGoogleContinue = async () => {
    if (!envReady) return;
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: plan ? { plan } : undefined
      }
    });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#12141d] p-7 shadow-[0_20px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <h1 className="text-2xl font-medium tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>

      {planText ? (
        <p className="mt-4 inline-flex rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1 text-[12px] text-zinc-300">
          {planText}
        </p>
      ) : null}

      {!envReady ? (
        <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Missing Supabase environment variables. Set `NEXT_PUBLIC_SUPABASE_URL` and
          `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleGoogleContinue}
        disabled={loading || !envReady}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-white/[0.2] hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.6C16.8 2.8 14.6 2 12 2 6.9 2 2.8 6.5 2.8 12S6.9 22 12 22c6.9 0 9.2-5 9.2-7.6 0-.5 0-.9-.1-1.3H12z"
          />
        </svg>
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>
    </div>
  );
}
