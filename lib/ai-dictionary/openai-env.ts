const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export type OpenAIConfig = {
  apiKey: string;
  model: string;
};

export function getOpenAIConfig(): OpenAIConfig | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  return { apiKey, model };
}
