import type { DocumentLanguage } from "@/lib/language/document-language";
import type { ExplanationLanguagePreference } from "./explanation-language";

export type ExplainWordRequestBody = {
  word: string;
  sentence: string;
  documentId: string;
  /** @deprecated Ignored — server uses document language from DB. */
  language?: string;
  documentLanguage?: string;
  explanationLanguagePreference?: string;
};

export type ValidatedExplainWordRequest = {
  word: string;
  sentence: string;
  documentId: string;
  explanationLanguagePreference: ExplanationLanguagePreference;
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

export type ApiErrorCode = "limit_reached" | "paywall";

export type ApiErrorBody = {
  error: string;
  code?: ApiErrorCode;
  title?: string;
  usage?: ExplainWordUsage;
};
