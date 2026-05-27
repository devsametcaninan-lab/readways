"use client";

import { I18nProvider } from "@/lib/i18n/provider";
import { ToastProvider } from "./ToastProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>{children}</ToastProvider>
    </I18nProvider>
  );
}
