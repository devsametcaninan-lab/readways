import { savedWordsCatalog } from "@/lib/saved-words-mock-data";
import { vocabularyById, type VocabularyEntry } from "@/lib/reader-mock-data";
import type { PanelVocabularySelection } from "./types";
import { cleanDisplayWord } from "./text-tokens";

const KNOWN_WORDS = new Map<string, VocabularyEntry>();

function registerKnown(entry: VocabularyEntry) {
  KNOWN_WORDS.set(entry.word.toLowerCase(), entry);
}

for (const entry of Object.values(vocabularyById)) {
  registerKnown(entry);
}

for (const item of savedWordsCatalog) {
  const key = item.word.toLowerCase();
  if (KNOWN_WORDS.has(key)) continue;

  registerKnown({
    id: key,
    word: item.word,
    partOfSpeech: item.partOfSpeech,
    pronunciation: item.pronunciation,
    definition: item.meaning,
    contextMeaning: item.meaning,
    sentence: item.contextSentence
  });
}

export function panelEntryFromMockId(
  id: string,
  sourceTitle: string
): PanelVocabularySelection | null {
  const entry = vocabularyById[id];
  if (!entry) return null;

  return {
    saveKey: entry.id,
    highlightKey: entry.id,
    word: entry.word,
    partOfSpeech: entry.partOfSpeech,
    pronunciation: entry.pronunciation,
    definition: entry.definition,
    contextMeaning: entry.contextMeaning,
    sentence: entry.sentence,
    sourceTitle
  };
}

export function buildPanelEntry(params: {
  rawWord: string;
  normalizedWord: string;
  sentence: string;
  sourceTitle: string;
  highlightKey: string;
}): PanelVocabularySelection {
  const { rawWord, normalizedWord, sentence, sourceTitle, highlightKey } = params;
  const displayWord = cleanDisplayWord(rawWord);
  const known = KNOWN_WORDS.get(normalizedWord);

  if (known) {
    return {
      saveKey: `${highlightKey}:${normalizedWord}`,
      highlightKey,
      word: displayWord,
      partOfSpeech: known.partOfSpeech,
      pronunciation: known.pronunciation,
      definition: known.definition,
      contextMeaning: known.contextMeaning,
      sentence: sentence || known.sentence,
      sourceTitle
    };
  }

  return {
    saveKey: `${highlightKey}:${normalizedWord}`,
    highlightKey,
    word: displayWord,
    partOfSpeech: "word",
    pronunciation: "Coming soon",
    definition: "AI-powered contextual meaning will appear here.",
    contextMeaning: "This word was selected from your document context.",
    sentence,
    sourceTitle
  };
}
