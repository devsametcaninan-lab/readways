import en from "@/messages/en.json";
import tr from "@/messages/tr.json";
import { DEFAULT_UI_LOCALE, UI_LOCALE_VALUES, type UiLocale } from "./constants";

export type Messages = typeof tr;
export type TranslationKey =
  | "nav.library"
  | "nav.reader"
  | "nav.savedWords"
  | "nav.flashcards"
  | "nav.progress"
  | "nav.settings"
  | "common.openMenu"
  | "common.closeMenu"
  | "common.cancel"
  | "common.submit"
  | "common.signOut"
  | "common.signingOut"
  | "common.sendFeedback"
  | "shell.activity";

const dictionaries: Record<UiLocale, Messages> = {
  tr,
  en
};

export function isUiLocale(value: string): value is UiLocale {
  return (UI_LOCALE_VALUES as readonly string[]).includes(value);
}

export function resolveUiLocale(value: string | null | undefined): UiLocale {
  if (!value) {
    return DEFAULT_UI_LOCALE;
  }

  return isUiLocale(value) ? value : DEFAULT_UI_LOCALE;
}

export function getMessages(locale: UiLocale): Messages {
  return dictionaries[locale];
}
