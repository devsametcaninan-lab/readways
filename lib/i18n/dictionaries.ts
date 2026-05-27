import en from "@/messages/en.json";
import tr from "@/messages/tr.json";
import { DEFAULT_UI_LOCALE, UI_LOCALE_VALUES, type UiLocale } from "./constants";

export type Messages = typeof tr;
export type TranslationKey = string;

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
