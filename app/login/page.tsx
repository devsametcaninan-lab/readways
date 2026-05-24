import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0b10] px-6 py-16">
      <div className="w-full max-w-md">
        <AuthCard mode="login" />
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
