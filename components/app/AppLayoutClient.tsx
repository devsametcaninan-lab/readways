"use client";

import { usePathname } from "next/navigation";
import AppShell from "./AppShell";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showActivityPanel = pathname === "/dashboard";

  return <AppShell showActivityPanel={showActivityPanel}>{children}</AppShell>;
}
