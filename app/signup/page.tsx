import Link from "next/link";
import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import { getServerT } from "@/lib/i18n/server";

type SignupPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export const metadata: Metadata = {
  title: "Kayit ol",
  description: "ReadWays hesabini olustur ve PDF'lerden ogrenmeye basla.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const t = getServerT();
  const { plan } = await searchParams;
  const normalizedPlan = plan === "pro" ? "pro" : plan === "free" ? "free" : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b10] px-6 py-16">
      <div className="w-full max-w-md">
        <AuthCard mode="signup" plan={normalizedPlan} />
        <p className="mt-5 text-center text-sm text-zinc-500">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-zinc-300 transition hover:text-white">
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    </main>
  );
}
