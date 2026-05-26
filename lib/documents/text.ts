import {
  MAX_PARAGRAPH_CHARS,
  TARGET_PARAGRAPH_WORDS
} from "@/lib/reader/document-limits";

/** Split an oversized paragraph into stable, readable chunks. */
export function splitOversizedParagraph(text: string): string[] {
  if (text.length <= MAX_PARAGRAPH_CHARS) {
    return [text];
  }

  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks: string[] = [];
    let chunkWords: string[] = [];

    for (const word of words) {
      chunkWords.push(word);
      if (chunkWords.join(" ").length >= MAX_PARAGRAPH_CHARS) {
        chunks.push(chunkWords.join(" "));
        chunkWords = [];
      }
    }

    if (chunkWords.length > 0) {
      chunks.push(chunkWords.join(" "));
    }

    return chunks.length > 0 ? chunks : [text];
  }

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > MAX_PARAGRAPH_CHARS && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [text];
}

function flattenParagraphChunks(blocks: string[]): string[] {
  const flattened: string[] = [];

  for (const block of blocks) {
    for (const chunk of splitOversizedParagraph(block)) {
      flattened.push(chunk);
    }
  }

  return flattened;
}

/** Split stored extracted text into reader paragraphs */
export function extractedTextToParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const byBreak = trimmed
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter((block) => block.length > 0);

  if (byBreak.length > 0) {
    return flattenParagraphChunks(byBreak);
  }

  const normalized = trimmed.replace(/\s+/g, " ");
  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 3) {
    return flattenParagraphChunks([normalized]);
  }

  const paragraphs: string[] = [];
  let chunk = "";

  for (const sentence of sentences) {
    chunk = chunk ? `${chunk} ${sentence}` : sentence;
    if (chunk.split(/\s+/).length >= TARGET_PARAGRAPH_WORDS) {
      paragraphs.push(chunk);
      chunk = "";
    }
  }

  if (chunk) {
    paragraphs.push(chunk);
  }

  return flattenParagraphChunks(
    paragraphs.length > 0 ? paragraphs : [normalized]
  );
}

export function paragraphsToExtractedText(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}
