"use client";

import { usePathname } from "next/navigation";
import AppShell from "./AppShell";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showActivityPanel = pathname === "/dashboard";
  const isReader = pathname.startsWith("/reader");

  return (
    <AppShell showActivityPanel={showActivityPanel} fullHeightMain={isReader}>
      {children}
    </AppShell>
  );
}
