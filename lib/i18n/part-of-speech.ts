type Translate = (key: string) => string;

const POS_LABEL_KEYS: Record<string, string> = {
  noun: "app.partOfSpeechNoun",
  verb: "app.partOfSpeechVerb",
  adjective: "app.partOfSpeechAdjective",
  word: "app.partOfSpeechWord",
  phrase: "app.partOfSpeechPhrase"
};

export function localizePartOfSpeech(partOfSpeech: string, t: Translate): string {
  const normalized = partOfSpeech.trim().toLowerCase();
  const key = POS_LABEL_KEYS[normalized];
  if (key) {
    return t(key);
  }

  return partOfSpeech;
}
