import { getOpenAIConfig } from "./openai-env";
import { buildExplanationSystemPrompt, buildExplanationUserPrompt } from "./openai-prompt";
import { parseAiExplanationJson, type ValidatedAiExplanation } from "./openai-response";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30_000;

export type GenerateExplanationResult =
  | { ok: true; data: ValidatedAiExplanation }
  | { ok: false; reason: "not_configured" | "request_failed" | "invalid_response" };

export async function generateExplanationWithOpenAI(params: {
  word: string;
  sentence: string;
  language: string;
}): Promise<GenerateExplanationResult> {
  const config = getOpenAIConfig();
  if (!config) {
    return { ok: false, reason: "not_configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildExplanationSystemPrompt() },
          {
            role: "user",
            content: buildExplanationUserPrompt(params)
          }
        ]
      })
    });

    if (!response.ok) {
      return { ok: false, reason: "request_failed" };
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };

    const content = body.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return { ok: false, reason: "invalid_response" };
    }

    const parsed = parseAiExplanationJson(content);
    if (!parsed.ok) {
      return { ok: false, reason: "invalid_response" };
    }

    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, reason: "request_failed" };
  } finally {
    clearTimeout(timeout);
  }
}
