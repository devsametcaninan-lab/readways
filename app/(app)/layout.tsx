import type { Metadata } from "next";
import AppAuthGate from "@/components/app/AppAuthGate";
import AppLayoutClient from "@/components/app/AppLayoutClient";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "ReadWays App",
  description: "Read, learn vocabulary, and review with ReadWays."
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <AppLayoutClient>
      <AppAuthGate>{children}</AppAuthGate>
    </AppLayoutClient>
  );
}
