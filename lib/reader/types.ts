export type PanelVocabularyStatus = "loading" | "ready" | "error";

export type PanelVocabularySelection = {
  saveKey: string;
  highlightKey: string;
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  definition: string;
  contextMeaning: string;
  sentence: string;
  sourceTitle: string;
  status: PanelVocabularyStatus;
  explanationSource?: "cache" | "mock";
  errorMessage?: string;
};
