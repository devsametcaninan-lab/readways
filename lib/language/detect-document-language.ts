import {
  DEFAULT_DOCUMENT_LANGUAGE,
  SUPPORTED_DOCUMENT_LANGUAGES,
  type DocumentLanguage
} from "./document-language";

const SAMPLE_MAX_LENGTH = 12_000;

const LANGUAGE_MARKERS: Record<
  DocumentLanguage,
  { chars: RegExp; words: string[] }
> = {
  en: {
    chars: /[a-z]/gi,
    words: [
      "the",
      "and",
      "of",
      "to",
      "in",
      "that",
      "is",
      "for",
      "with",
      "this",
      "as",
      "are",
      "was",
      "on",
      "by"
    ]
  },
  tr: {
    chars: /[ğıüşöçİ]/gi,
    words: [
      "ve",
      "bir",
      "bu",
      "için",
      "ile",
      "olan",
      "gibi",
      "daha",
      "çok",
      "kadar",
      "değil",
      "olarak",
      "ancak",
      "ise",
      "her"
    ]
  },
  de: {
    chars: /[äöüß]/gi,
    words: [
      "der",
      "die",
      "das",
      "und",
      "ist",
      "nicht",
      "mit",
      "auf",
      "für",
      "auch",
      "sich",
      "dem",
      "ein",
      "eine",
      "werden"
    ]
  },
  fr: {
    chars: /[àâæçéèêëîïôùûü]/gi,
    words: [
      "le",
      "la",
      "les",
      "des",
      "est",
      "dans",
      "pour",
      "une",
      "sur",
      "pas",
      "que",
      "avec",
      "plus",
      "par",
      "comme"
    ]
  },
  es: {
    chars: /[ñáéíóúü¿¡]/gi,
    words: [
      "el",
      "la",
      "de",
      "que",
      "en",
      "los",
      "las",
      "por",
      "con",
      "una",
      "para",
      "como",
      "del",
      "se",
      "su"
    ]
  }
};

function buildDetectionSample(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.length <= SAMPLE_MAX_LENGTH) {
    return normalized.toLowerCase();
  }

  const chunk = Math.floor(SAMPLE_MAX_LENGTH / 3);
  const middleStart = Math.floor(normalized.length / 2) - Math.floor(chunk / 2);

  return [
    normalized.slice(0, chunk),
    normalized.slice(middleStart, middleStart + chunk),
    normalized.slice(-chunk)
  ]
    .join(" ")
    .toLowerCase();
}

function countWordHits(sample: string, words: string[]): number {
  let score = 0;

  for (const word of words) {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const matches = sample.match(pattern);
    if (matches) {
      score += matches.length;
    }
  }

  return score;
}

function scoreLanguage(sample: string, language: DocumentLanguage): number {
  const markers = LANGUAGE_MARKERS[language];
  const charHits = (sample.match(markers.chars) ?? []).length;
  const wordHits = countWordHits(sample, markers.words);

  if (language === "tr") {
    return charHits * 4 + wordHits * 2;
  }

  if (language === "de" || language === "es") {
    return charHits * 3 + wordHits * 2;
  }

  if (language === "fr") {
    return charHits * 2 + wordHits * 2;
  }

  return charHits + wordHits * 2;
}

/**
 * Lightweight heuristic detector for common document languages.
 * Defaults to English when confidence is low.
 */
export function detectDocumentLanguage(text: string): DocumentLanguage {
  const sample = buildDetectionSample(text);
  if (!sample) {
    return DEFAULT_DOCUMENT_LANGUAGE;
  }

  const scores = SUPPORTED_DOCUMENT_LANGUAGES.map((language) => ({
    language,
    score: scoreLanguage(sample, language)
  })).sort((left, right) => right.score - left.score);

  const top = scores[0];
  const second = scores[1];

  if (!top || top.score < 10) {
    return DEFAULT_DOCUMENT_LANGUAGE;
  }

  if (second && top.score - second.score < 4) {
    return DEFAULT_DOCUMENT_LANGUAGE;
  }

  return top.language;
}
