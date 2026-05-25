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

export type ExplainWordSource = "cache" | "ai";

export type ExplainWordUsage = {
  used: number;
  limit: number;
  remaining: number;
};

export type ExplainWordPayload = {
  source: ExplainWordSource;
  wordExplanationId: string;
  word: string;
  pronunciation: string;
  definition: string;
  contextual_meaning: string;
  sentence: string;
  language: string;
  usage?: ExplainWordUsage;
};

export type ApiErrorBody = {
  error: string;
  usage?: ExplainWordUsage;
};
