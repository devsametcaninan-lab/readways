export type FlashcardReviewItem = {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  contextualMeaning: string;
  contextSentence: string;
  source: string;
};

export type SessionStats = {
  dueToday: number;
  learning: number;
  mastered: number;
};

export const sessionStats: SessionStats = {
  dueToday: 6,
  learning: 4,
  mastered: 2
};

export const reviewDeck: FlashcardReviewItem[] = [
  {
    id: "1",
    word: "framework",
    pronunciation: "/ˈfreɪmwɜːrk/",
    partOfSpeech: "noun",
    definition: "a basic structure underlying a system or concept",
    contextualMeaning: "the organizing structure behind an idea or process in your reading",
    contextSentence:
      "The result is a framework that feels useful in theory but weak in real comprehension.",
    source: "The_Economist_Article.pdf"
  },
  {
    id: "2",
    word: "deliberate",
    pronunciation: "/dɪˈlɪbərət/",
    partOfSpeech: "adjective",
    definition: "done consciously and intentionally",
    contextualMeaning: "chosen on purpose rather than by habit or accident",
    contextSentence: "Great readers build deliberate habits.",
    source: "The_Economist_Article.pdf"
  },
  {
    id: "3",
    word: "sustain",
    pronunciation: "/səˈsteɪn/",
    partOfSpeech: "verb",
    definition: "to maintain or keep going over time",
    contextualMeaning: "to keep knowledge or effort alive across repeated reading sessions",
    contextSentence:
      "A strong reading system must also help knowledge sustain over time.",
    source: "Neuroscience_Review.pdf"
  },
  {
    id: "4",
    word: "coherent",
    pronunciation: "/koʊˈhɪrənt/",
    partOfSpeech: "adjective",
    definition: "logical, consistent, and easy to understand",
    contextualMeaning: "when separate ideas in a text finally connect into one clear picture",
    contextSentence: "They return to the same passages until patterns become coherent.",
    source: "The_Economist_Article.pdf"
  },
  {
    id: "5",
    word: "reliable",
    pronunciation: "/rɪˈlaɪəbəl/",
    partOfSpeech: "adjective",
    definition: "consistently good and dependable",
    contextualMeaning: "a method you can trust to work the same way every time you read",
    contextSentence: "The most effective learners take a reliable approach.",
    source: "Product_Strategy_Essay.pdf"
  },
  {
    id: "6",
    word: "effortless",
    pronunciation: "/ˈefərtləs/",
    partOfSpeech: "adjective",
    definition: "requiring little or no effort",
    contextualMeaning: "fluency that feels natural after enough contextual exposure",
    contextSentence: "With the right tools, fluency can feel almost effortless.",
    source: "The_Economist_Article.pdf"
  }
];
