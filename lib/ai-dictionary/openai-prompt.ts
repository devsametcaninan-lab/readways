import {
  languageNameForPrompt,
  type DocumentLanguage
} from "@/lib/language/document-language";
import { countPhraseWords } from "@/lib/reader/phrase-selection";

export type ExplanationPromptMode = "word" | "phrase";

export function detectExplanationMode(text: string): ExplanationPromptMode {
  return countPhraseWords(text) >= 2 ? "phrase" : "word";
}

export function buildExplanationSystemPrompt(
  mode: ExplanationPromptMode,
  documentLanguage: DocumentLanguage,
  explanationLanguage: DocumentLanguage
): string {
  const documentLanguageName = languageNameForPrompt(documentLanguage);
  const explanationLanguageName = languageNameForPrompt(explanationLanguage);
  const modeBlock =
    mode === "phrase"
      ? `The selection is a PHRASE (idiom, phrasal verb, or multi-word expression). Explain the whole phrase as one unit — never word-by-word unless essential. Examples: "come on", "look up", "in spite of", "as well as".`
      : `The selection is a single WORD. Give a quick gloss plus how it reads in this sentence.`;

  const languageBlock =
    documentLanguage === explanationLanguage
      ? `The document sentence is in ${documentLanguageName}. Write every explanation field VALUE in ${explanationLanguageName}.`
      : `The document sentence is in ${documentLanguageName}. The reader wants explanations in ${explanationLanguageName} while learning from ${documentLanguageName} content.
- Write definition, contextual_meaning, and pronunciation in ${explanationLanguageName}.
- Write example_usage in ${documentLanguageName} only — a new English (or document-language) example sentence. Do NOT translate example_usage into ${explanationLanguageName}.
- Keep the JSON key "word" exactly as the reader selected it (do not translate the selection).
- Do not paste or translate the full source sentence into your fields unless one or two words are essential for clarity.`;

  const exampleUsageRule =
    documentLanguage === explanationLanguage
      ? `- example_usage: one new, natural example sentence in ${documentLanguageName} using the word/phrase (different from the source; max ~20 words).`
      : `- example_usage: one new, natural example sentence in ${documentLanguageName} (the document language — usually English), using the word/phrase as written in the selection. Different from the source; max ~20 words. Never translate this field into ${explanationLanguageName}.`;

  const outputLanguageRule =
    documentLanguage === explanationLanguage
      ? `- Field values must be in ${explanationLanguageName}.`
      : `- definition and contextual_meaning must be in ${explanationLanguageName}; example_usage must be in ${documentLanguageName}.`;

  return `You help someone who is actively reading a real document and tapped text for a fast explanation.

${languageBlock}

${modeBlock}

Voice and priorities:
- Lead with contextual meaning (how it reads here), not dictionary style.
- Sound natural and helpful — like a thoughtful friend, not a textbook or linguistics lecture.
- Be concise: every field should be short and scannable.
- Do not repeat or quote the full source sentence in your fields.
- Do not translate the entire sentence unless one or two words are essential.
- Skip grammar lectures unless they unlock the meaning.
- For very common words used in a plain way, keep it brief and set difficulty to "beginner".

Field rules:
- word: the selected text exactly as the reader chose it (preserve casing where sensible).
- pronunciation: simple guide for learners in ${explanationLanguageName} (IPA or readable respelling), no brackets.
- definition: one short general meaning in ${explanationLanguageName} (max ~15 words).
- contextual_meaning: the meaning IN this sentence in ${explanationLanguageName} — this is the most important field (1–2 short sentences, max ~35 words).
${exampleUsageRule}
- difficulty: "beginner" | "intermediate" | "advanced" — realistic for this text and selection.

Output:
- Return strict JSON only. JSON keys must stay in English (word, pronunciation, definition, contextual_meaning, example_usage, difficulty).
${outputLanguageRule}
- No markdown. No code fences. No commentary before or after.
- Use this exact shape:
{"word":"","pronunciation":"","definition":"","contextual_meaning":"","example_usage":"","difficulty":"beginner"}`;
}

export function buildExplanationUserPrompt(params: {
  word: string;
  sentence: string;
  documentLanguage: DocumentLanguage;
  explanationLanguage: DocumentLanguage;
  mode: ExplanationPromptMode;
}): string {
  const { word, sentence, documentLanguage, explanationLanguage, mode } = params;
  const kind = mode === "phrase" ? "Phrase" : "Word";
  const documentLanguageName = languageNameForPrompt(documentLanguage);
  const explanationLanguageName = languageNameForPrompt(explanationLanguage);

  const fieldLanguageHint =
    documentLanguage === explanationLanguage
      ? `Write all field values in ${explanationLanguageName}.`
      : `Write definition and contextual_meaning in ${explanationLanguageName}. Write example_usage as a new sentence in ${documentLanguageName} (do not translate the example into ${explanationLanguageName}).`;

  return `${kind}: ${word}
Sentence (context only — preserve as-is, do not copy into fields): ${sentence}
Document language: ${documentLanguageName}
Explanation language: ${explanationLanguageName}

Explain for a reader mid-flow. Prioritize contextual_meaning. ${fieldLanguageHint} Keep fields compact.`;
}

export function buildExplanationRepairUserPrompt(params: {
  word: string;
  sentence: string;
  documentLanguage: DocumentLanguage;
  explanationLanguage: DocumentLanguage;
  mode: ExplanationPromptMode;
}): string {
  return `${buildExplanationUserPrompt(params)}

Your previous reply was invalid. Return only one valid JSON object matching the required schema.`;
}
