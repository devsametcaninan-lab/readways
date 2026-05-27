export const UI_LOCALE_VALUES = ["tr", "en"] as const;
export type UiLocale = (typeof UI_LOCALE_VALUES)[number];

export const DEFAULT_UI_LOCALE: UiLocale = "tr";
export const UI_LOCALE_STORAGE_KEY = "readways.ui-locale";
