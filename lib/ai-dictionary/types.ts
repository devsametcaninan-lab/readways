import type { DocumentLanguage } from "@/lib/language/document-language";

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
  language: DocumentLanguage;
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
  example_usage?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  sentence: string;
  language: string;
  usage?: ExplainWordUsage;
};

export type ApiErrorBody = {
  error: string;
  usage?: ExplainWordUsage;
};
