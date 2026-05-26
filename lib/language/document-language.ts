export const SUPPORTED_DOCUMENT_LANGUAGES = ["en", "tr", "de", "fr", "es"] as const;

export type DocumentLanguage = (typeof SUPPORTED_DOCUMENT_LANGUAGES)[number];

export const DEFAULT_DOCUMENT_LANGUAGE: DocumentLanguage = "en";

export const DOCUMENT_LANGUAGE_LABELS: Record<DocumentLanguage, string> = {
  en: "English",
  tr: "Turkish",
  de: "German",
  fr: "French",
  es: "Spanish"
};

export function normalizeDocumentLanguage(
  value: string | null | undefined
): DocumentLanguage {
  const code = value?.trim().toLowerCase();

  if (
    code &&
    SUPPORTED_DOCUMENT_LANGUAGES.includes(code as DocumentLanguage)
  ) {
    return code as DocumentLanguage;
  }

  return DEFAULT_DOCUMENT_LANGUAGE;
}

export function documentLanguageLabel(
  value: string | null | undefined
): string {
  return DOCUMENT_LANGUAGE_LABELS[normalizeDocumentLanguage(value)];
}

export function languageNameForPrompt(
  value: string | null | undefined
): string {
  return documentLanguageLabel(value);
}
