"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_UI_LOCALE,
  UI_LOCALE_STORAGE_KEY,
  type UiLocale
} from "@/lib/i18n/constants";
import {
  getMessages,
  resolveUiLocale,
  type Messages,
  type TranslationKey
} from "@/lib/i18n/dictionaries";

type I18nContextValue = {
  locale: UiLocale;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function translate(messages: Messages, key: TranslationKey): string {
  const parts = key.split(".");
  let current: unknown = messages;

  for (const part of parts) {
    if (!current || typeof current !== "object") {
      return key;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : key;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<UiLocale>(DEFAULT_UI_LOCALE);

  useEffect(() => {
    const persisted = window.localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    setLocale(resolveUiLocale(persisted));
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key) => translate(messages, key)
    }),
    [locale, messages]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
