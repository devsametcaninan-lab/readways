export const HIGHLIGHT_MODE_VALUES = ["subtle", "focused", "off"] as const;
export type HighlightMode = (typeof HIGHLIGHT_MODE_VALUES)[number];

export const EXPLANATION_STYLE_VALUES = ["concise", "balanced", "detailed"] as const;
export type ExplanationStyle = (typeof EXPLANATION_STYLE_VALUES)[number];

export const DEFAULT_EXPLANATION_LANGUAGE_VALUES = ["document", "tr", "en"] as const;
export type DefaultExplanationLanguage =
  (typeof DEFAULT_EXPLANATION_LANGUAGE_VALUES)[number];

export const THEME_PREFERENCE_VALUES = ["dark", "light"] as const;
export type ThemePreference = (typeof THEME_PREFERENCE_VALUES)[number];

export type UserPreferences = {
  highlightMode: HighlightMode;
  autoSaveWords: boolean;
  phraseSelectionHints: boolean;
  theme: ThemePreference;
  explanationStyle: ExplanationStyle;
  defaultExplanationLanguage: DefaultExplanationLanguage;
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  highlightMode: "focused",
  autoSaveWords: false,
  phraseSelectionHints: true,
  theme: "dark",
  explanationStyle: "balanced",
  defaultExplanationLanguage: "document"
};
