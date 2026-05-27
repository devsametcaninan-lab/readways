export type PanelVocabularyStatus = "loading" | "ready" | "error";

export type PanelSaveState = "idle" | "saving" | "saved" | "already_saved";

export type PanelPaywallState = {
  title: string;
  message: string;
};

export type PanelVocabularySelection = {
  saveKey: string;
  highlightKey: string;
  documentId: string;
  wordExplanationId?: string;
  normalizedWord: string;
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  definition: string;
  contextMeaning: string;
  exampleUsage?: string;
  difficulty?: string;
  sentence: string;
  sourceTitle: string;
  status: PanelVocabularyStatus;
  saveState: PanelSaveState;
  explanationSource?: "cache" | "ai";
  explanationLanguageLabel?: string;
  errorMessage?: string;
  paywall?: PanelPaywallState;
};
