import type { Metadata } from "next";
import AppLayoutClient from "@/components/app/AppLayoutClient";

export const metadata: Metadata = {
  title: "ReadWays App",
  description: "Read, learn vocabulary, and review with ReadWays."
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
