import { tokenizeParagraph, type ParagraphToken } from "./text-tokens";

export type PreparedParagraph = {
  index: number;
  text: string;
  tokens: ParagraphToken[];
};

export function buildPreparedParagraphs(paragraphs: string[]): PreparedParagraph[] {
  return paragraphs.map((text, index) => ({
    index,
    text,
    tokens: tokenizeParagraph(text)
  }));
}
