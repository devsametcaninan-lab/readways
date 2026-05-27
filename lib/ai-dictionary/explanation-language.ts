import {
  documentLanguageLabel,
  normalizeDocumentLanguage,
  type DocumentLanguage
} from "@/lib/language/document-language";

export const EXPLANATION_LANGUAGE_PREFERENCE_VALUES = [
  "same_as_document",
  "tr",
  "en"
] as const;

export type ExplanationLanguagePreference =
  (typeof EXPLANATION_LANGUAGE_PREFERENCE_VALUES)[number];

const PREFERENCE_SET = new Set<string>(EXPLANATION_LANGUAGE_PREFERENCE_VALUES);

export function parseExplanationLanguagePreference(
  value: unknown
): ExplanationLanguagePreference | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!PREFERENCE_SET.has(normalized)) {
    return null;
  }

  return normalized as ExplanationLanguagePreference;
}

/** Maps Settings UI value (`document`) to API preference. */
export function mapSettingsLanguageToApiPreference(
  preference: "document" | "tr" | "en"
): ExplanationLanguagePreference {
  if (preference === "document") {
    return "same_as_document";
  }

  return preference;
}

export function resolveFinalExplanationLanguage(
  preference: ExplanationLanguagePreference,
  documentLanguage: string | null | undefined
): DocumentLanguage {
  if (preference === "tr") {
    return "tr";
  }

  if (preference === "en") {
    return "en";
  }

  return normalizeDocumentLanguage(documentLanguage);
}

export function explanationLanguageDisplayLabel(
  language: string | null | undefined
): string {
  return documentLanguageLabel(language);
}
