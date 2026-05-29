import Link from "next/link";
import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import { sanitizeNextPath } from "@/lib/auth/paths";
import { getServerT } from "@/lib/i18n/server";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string; reason?: string }>;
};

export const metadata: Metadata = {
  title: "Giriş",
  description: "ReadWays hesabına giriş yap. PDF okurken AI ile İngilizce öğrenmeye devam et.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const t = getServerT();
  const { next, error, reason } = await searchParams;
  const nextPath = sanitizeNextPath(next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b10] px-6 py-16">
      <div className="w-full max-w-md">
        {error === "auth_callback_failed" ? (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200/90">
            {t("auth.callbackFailed")}
          </p>
        ) : null}
        {reason === "session_expired" ? (
          <p className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-100/90">
            {t("auth.sessionExpiredMessage")}
          </p>
        ) : null}
        <AuthCard mode="login" nextPath={nextPath} />
        <p className="mt-5 text-center text-sm text-zinc-500">
          {t("auth.newToReadways")}{" "}
          <Link href="/signup" className="text-zinc-300 transition hover:text-white">
            {t("auth.createAccount")}
          </Link>
        </p>
      </div>
    </main>
  );
}
