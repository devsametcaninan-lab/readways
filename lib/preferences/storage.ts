import {
  DEFAULT_EXPLANATION_LANGUAGE_VALUES,
  DEFAULT_USER_PREFERENCES,
  EXPLANATION_STYLE_VALUES,
  HIGHLIGHT_MODE_VALUES,
  LEGACY_IMPLICIT_EXPLANATION_LANGUAGE,
  THEME_PREFERENCE_VALUES,
  type DefaultExplanationLanguage,
  type ExplanationStyle,
  type HighlightMode,
  type ThemePreference,
  type UserPreferences
} from "./types";

export const USER_PREFERENCES_STORAGE_KEY = "readways:preferences:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isHighlightMode(value: unknown): value is HighlightMode {
  return (
    typeof value === "string" &&
    (HIGHLIGHT_MODE_VALUES as readonly string[]).includes(value)
  );
}

function isExplanationStyle(value: unknown): value is ExplanationStyle {
  return (
    typeof value === "string" &&
    (EXPLANATION_STYLE_VALUES as readonly string[]).includes(value)
  );
}

function isDefaultExplanationLanguage(
  value: unknown
): value is DefaultExplanationLanguage {
  return (
    typeof value === "string" &&
    (DEFAULT_EXPLANATION_LANGUAGE_VALUES as readonly string[]).includes(value)
  );
}

function isThemePreference(value: unknown): value is ThemePreference {
  return (
    typeof value === "string" &&
    (THEME_PREFERENCE_VALUES as readonly string[]).includes(value)
  );
}

export function parseUserPreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_USER_PREFERENCES };
  }

  const record = raw as Record<string, unknown>;

  return {
    highlightMode: isHighlightMode(record.highlightMode)
      ? record.highlightMode
      : DEFAULT_USER_PREFERENCES.highlightMode,
    autoSaveWords:
      typeof record.autoSaveWords === "boolean"
        ? record.autoSaveWords
        : DEFAULT_USER_PREFERENCES.autoSaveWords,
    phraseSelectionHints:
      typeof record.phraseSelectionHints === "boolean"
        ? record.phraseSelectionHints
        : DEFAULT_USER_PREFERENCES.phraseSelectionHints,
    theme: isThemePreference(record.theme)
      ? record.theme === "light"
        ? "dark"
        : record.theme
      : DEFAULT_USER_PREFERENCES.theme,
    explanationStyle: isExplanationStyle(record.explanationStyle)
      ? record.explanationStyle
      : DEFAULT_USER_PREFERENCES.explanationStyle,
    defaultExplanationLanguage: isDefaultExplanationLanguage(
      record.defaultExplanationLanguage
    )
      ? record.defaultExplanationLanguage
      : LEGACY_IMPLICIT_EXPLANATION_LANGUAGE,
  };
}

export function readUserPreferences(): UserPreferences {
  if (!isBrowser()) {
    return { ...DEFAULT_USER_PREFERENCES };
  }

  try {
    const raw = window.localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_USER_PREFERENCES };
    }

    return parseUserPreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export function writeUserPreferences(preferences: UserPreferences): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      USER_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    );
  } catch {
    // Quota or private mode — ignore
  }
}
