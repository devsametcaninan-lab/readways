export type WordToken = {
  type: "word";
  value: string;
  normalized: string;
  start: number;
  end: number;
  wordIndex: number;
};

export type NonWordToken = {
  type: "whitespace" | "punctuation";
  value: string;
};

export type ParagraphToken = WordToken | NonWordToken;

const TOKEN_PATTERN = /[\w']+|[^\s\w']+|\s+/g;

export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/^['']+|['']+$/g, "")
    .trim();
}

export function cleanDisplayWord(word: string): string {
  const cleaned = word.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, "");
  return cleaned || word;
}

export function tokenizeParagraph(text: string): ParagraphToken[] {
  const tokens: ParagraphToken[] = [];
  let wordIndex = 0;
  const matches = text.matchAll(TOKEN_PATTERN);

  for (const match of matches) {
    const value = match[0];
    const start = match.index ?? 0;
    const end = start + value.length;

    if (/^\s+$/.test(value)) {
      tokens.push({ type: "whitespace", value });
      continue;
    }

    if (/^[\w']+$/.test(value)) {
      const normalized = normalizeWord(value);
      if (!normalized) continue;

      tokens.push({
        type: "word",
        value,
        normalized,
        start,
        end,
        wordIndex: wordIndex++
      });
      continue;
    }

    tokens.push({ type: "punctuation", value });
  }

  return tokens;
}

export function extractSentence(paragraph: string, wordStart: number): string {
  if (!paragraph.trim()) return paragraph;

  let start = wordStart;
  while (start > 0) {
    const previous = paragraph[start - 1];
    if (previous === "." || previous === "!" || previous === "?") break;
    start -= 1;
  }

  let end = wordStart;
  while (end < paragraph.length) {
    const current = paragraph[end];
    if (current === "." || current === "!" || current === "?") {
      end += 1;
      break;
    }
    end += 1;
  }

  const sentence = paragraph.slice(start, end).trim();
  return sentence || paragraph.trim();
}

export function highlightKeyForWord(paragraphIndex: number, wordIndex: number): string {
  return `${paragraphIndex}:${wordIndex}`;
}
