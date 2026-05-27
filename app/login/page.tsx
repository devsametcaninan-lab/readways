import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import { sanitizeNextPath } from "@/lib/auth/paths";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  const nextPath = sanitizeNextPath(next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b10] px-6 py-16">
      <div className="w-full max-w-md">
        {error === "auth_callback_failed" ? (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200/90">
            Sign-in could not be completed. Please try again.
          </p>
        ) : null}
        <AuthCard mode="login" nextPath={nextPath} />
        <p className="mt-5 text-center text-sm text-zinc-500">
          New to ReadWays?{" "}
          <Link href="/signup" className="text-zinc-300 transition hover:text-white">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
