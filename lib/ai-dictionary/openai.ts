import { getOpenAIConfig } from "./openai-env";
import {
  buildExplanationRepairUserPrompt,
  buildExplanationSystemPrompt,
  buildExplanationUserPrompt,
  detectExplanationMode,
  type ExplanationPromptMode
} from "./openai-prompt";
import { parseAiExplanationJson, type ValidatedAiExplanation } from "./openai-response";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30_000;

export type GenerateExplanationResult =
  | { ok: true; data: ValidatedAiExplanation }
  | { ok: false; reason: "not_configured" | "request_failed" | "invalid_response" };

async function requestExplanationJson(params: {
  apiKey: string;
  model: string;
  mode: ExplanationPromptMode;
  word: string;
  sentence: string;
  language: string;
  repair: boolean;
  signal?: AbortSignal;
}): Promise<string | null> {
  const { apiKey, model, mode, word, sentence, language, repair, signal } = params;

  const userContent = repair
    ? buildExplanationRepairUserPrompt({ word, sentence, language, mode })
    : buildExplanationUserPrompt({ word, sentence, language, mode });

  const response = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    signal,
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildExplanationSystemPrompt(mode) },
        { role: "user", content: userContent }
      ]
    })
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = body.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    return null;
  }

  return content;
}

export async function generateExplanationWithOpenAI(params: {
  word: string;
  sentence: string;
  language: string;
  signal?: AbortSignal;
}): Promise<GenerateExplanationResult> {
  const config = getOpenAIConfig();
  if (!config) {
    return { ok: false, reason: "not_configured" };
  }

  const mode = detectExplanationMode(params.word);
  const sanitizeInput = {
    word: params.word,
    sentence: params.sentence,
    isPhrase: mode === "phrase"
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const signal = params.signal ?? controller.signal;

  try {
    const first = await requestExplanationJson({
      apiKey: config.apiKey,
      model: config.model,
      mode,
      word: params.word,
      sentence: params.sentence,
      language: params.language,
      repair: false,
      signal
    });

    if (first) {
      const parsed = parseAiExplanationJson(first, sanitizeInput);
      if (parsed.ok) {
        return { ok: true, data: parsed.data };
      }
    }

    const second = await requestExplanationJson({
      apiKey: config.apiKey,
      model: config.model,
      mode,
      word: params.word,
      sentence: params.sentence,
      language: params.language,
      repair: true,
      signal
    });

    if (!second) {
      return { ok: false, reason: "request_failed" };
    }

    const repaired = parseAiExplanationJson(second, sanitizeInput);
    if (!repaired.ok) {
      return { ok: false, reason: "invalid_response" };
    }

    return { ok: true, data: repaired.data };
  } catch {
    return { ok: false, reason: "request_failed" };
  } finally {
    clearTimeout(timeout);
  }
}
