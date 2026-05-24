export type VocabularyEntry = {
  id: string;
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  definition: string;
  contextMeaning: string;
  sentence: string;
};

/** Fallback definitions for common words until AI explanations ship */
export const knownVocabularyByWord: Record<string, VocabularyEntry> = {
  framework: {
    id: "framework",
    word: "framework",
    partOfSpeech: "noun",
    pronunciation: "/ˈfreɪmwɜːrk/",
    definition: "a basic structure underlying a system, concept, or text",
    contextMeaning:
      "A connected structure linking ideas, habits, or parts of a system.",
    sentence: "The result is a framework that feels useful in theory."
  },
  deliberate: {
    id: "deliberate",
    word: "deliberate",
    partOfSpeech: "adjective",
    pronunciation: "/dɪˈlɪbərət/",
    definition: "done consciously and intentionally",
    contextMeaning: "Chosen on purpose rather than by accident or habit alone.",
    sentence: "Great readers build deliberate habits."
  },
  coherent: {
    id: "coherent",
    word: "coherent",
    partOfSpeech: "adjective",
    pronunciation: "/koʊˈhɪrənt/",
    definition: "logical, consistent, and easy to understand",
    contextMeaning: "Ideas or patterns that fit together clearly.",
    sentence: "Patterns become coherent through repeated reading."
  },
  sustain: {
    id: "sustain",
    word: "sustain",
    partOfSpeech: "verb",
    pronunciation: "/səˈsteɪn/",
    definition: "to maintain or keep going over time",
    contextMeaning: "To keep knowledge or effort active across sessions.",
    sentence: "A strong reading system must help knowledge sustain over time."
  },
  reliable: {
    id: "reliable",
    word: "reliable",
    partOfSpeech: "adjective",
    pronunciation: "/rɪˈlaɪəbəl/",
    definition: "consistently good and dependable",
    contextMeaning: "A method that works repeatedly in practice.",
    sentence: "The most effective learners take a reliable approach."
  },
  approach: {
    id: "approach",
    word: "approach",
    partOfSpeech: "noun",
    pronunciation: "/əˈproʊtʃ/",
    definition: "a way of dealing with something; a method",
    contextMeaning: "How someone chooses to work through a task or text.",
    sentence: "They refine their approach over time."
  },
  effortless: {
    id: "effortless",
    word: "effortless",
    partOfSpeech: "adjective",
    pronunciation: "/ˈefərtləs/",
    definition: "requiring little or no effort",
    contextMeaning: "Feeling natural after enough contextual exposure.",
    sentence: "Fluency can feel almost effortless."
  }
};
