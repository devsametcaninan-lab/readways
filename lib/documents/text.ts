/** Split stored extracted text into reader paragraphs */
export function extractedTextToParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const byBreak = trimmed
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter((block) => block.length > 0);

  if (byBreak.length > 0) return byBreak;

  const normalized = trimmed.replace(/\s+/g, " ");
  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 3) return [normalized];

  const paragraphs: string[] = [];
  let chunk = "";

  for (const sentence of sentences) {
    chunk = chunk ? `${chunk} ${sentence}` : sentence;
    if (chunk.split(/\s+/).length >= 55) {
      paragraphs.push(chunk);
      chunk = "";
    }
  }

  if (chunk) paragraphs.push(chunk);
  return paragraphs.length > 0 ? paragraphs : [normalized];
}

export function paragraphsToExtractedText(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}
