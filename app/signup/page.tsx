import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";

type SignupPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { plan } = await searchParams;
  const normalizedPlan = plan === "pro" ? "pro" : plan === "free" ? "free" : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b10] px-6 py-16">
      <div className="w-full max-w-md">
        <AuthCard mode="signup" plan={normalizedPlan} />
        <p className="mt-5 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-300 transition hover:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
