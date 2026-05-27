"use client";

import { usePathname } from "next/navigation";
import OnboardingProvider from "@/lib/onboarding/OnboardingProvider";
import UserPreferencesProvider from "@/lib/preferences/UserPreferencesProvider";
import { UploadPdfProvider } from "@/components/upload/UploadPdfContext";
import AppShell from "./AppShell";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showActivityPanel = pathname === "/dashboard";
  const isReader = pathname.startsWith("/reader");

  return (
    <UserPreferencesProvider>
      <OnboardingProvider>
        <UploadPdfProvider>
          <AppShell showActivityPanel={showActivityPanel} fullHeightMain={isReader}>
            {children}
          </AppShell>
        </UploadPdfProvider>
      </OnboardingProvider>
    </UserPreferencesProvider>
  );
}
