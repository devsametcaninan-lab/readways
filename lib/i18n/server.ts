import { DEFAULT_UI_LOCALE } from "./constants";
import { getMessages, type TranslationKey } from "./dictionaries";

function translate(key: TranslationKey): string {
  const messages = getMessages(DEFAULT_UI_LOCALE);
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

export function getServerT() {
  return translate;
}
