export type ExplainWordRequestBody = {
  word: string;
  sentence: string;
  documentId: string;
  language?: string;
};

export type ValidatedExplainWordRequest = {
  word: string;
  sentence: string;
  documentId: string;
  language: string;
};

export type ExplainWordSource = "cache" | "mock";

export type ExplainWordPayload = {
  source: ExplainWordSource;
  word: string;
  pronunciation: string;
  definition: string;
  contextual_meaning: string;
  sentence: string;
  language: string;
};

export type ApiErrorBody = {
  error: string;
};
