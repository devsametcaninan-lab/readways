"use client";

import { usePathname } from "next/navigation";
import { UploadPdfProvider } from "@/components/upload/UploadPdfContext";
import AppShell from "./AppShell";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showActivityPanel = pathname === "/dashboard";
  const isReader = pathname.startsWith("/reader");

  return (
    <UploadPdfProvider>
      <AppShell showActivityPanel={showActivityPanel} fullHeightMain={isReader}>
        {children}
      </AppShell>
    </UploadPdfProvider>
  );
}
