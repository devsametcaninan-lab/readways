export function buildExplanationSystemPrompt(): string {
  return `You are a vocabulary assistant for language learners reading documents.
Explain the selected word using the provided sentence as context.

Rules:
- Keep the explanation short and useful.
- Do not over-explain.
- Do not translate the whole sentence.
- If the word is too common or meaningless alone, explain briefly and set difficulty to "beginner".
- Return valid JSON only, with no markdown or extra text.

Required JSON shape:
{
  "word": "string",
  "pronunciation": "string",
  "definition": "string",
  "contextual_meaning": "string",
  "example_usage": "string",
  "difficulty": "beginner | intermediate | advanced"
}`;
}

export function buildExplanationUserPrompt(params: {
  word: string;
  sentence: string;
  language: string;
}): string {
  const { word, sentence, language } = params;

  return `Word: ${word}
Sentence: ${sentence}
Document language: ${language}

Explain the word in context.`;
}
