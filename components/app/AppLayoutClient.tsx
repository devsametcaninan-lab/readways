"use client";

import { usePathname } from "next/navigation";
import OnboardingProvider from "@/lib/onboarding/OnboardingProvider";
import { UploadPdfProvider } from "@/components/upload/UploadPdfContext";
import AppShell from "./AppShell";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showActivityPanel = pathname === "/dashboard";
  const isReader = pathname.startsWith("/reader");

  return (
    <OnboardingProvider>
      <UploadPdfProvider>
        <AppShell showActivityPanel={showActivityPanel} fullHeightMain={isReader}>
          {children}
        </AppShell>
      </UploadPdfProvider>
    </OnboardingProvider>
  );
}
