export type WordStatus = "learning" | "reviewing" | "mastered";

export type SavedWordItem = {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  source: string;
  status: WordStatus;
  savedAt: string;
  reviewProgress: number;
  contextSentence: string;
};

export const statusLabels: Record<WordStatus, string> = {
  learning: "Learning",
  reviewing: "Reviewing",
  mastered: "Mastered"
};

export const savedWordsCatalog: SavedWordItem[] = [
  {
    id: "1",
    word: "framework",
    pronunciation: "/ˈfreɪmwɜːrk/",
    partOfSpeech: "noun",
    meaning: "a basic structure underlying a system or concept",
    source: "The_Economist_Article.pdf",
    status: "learning",
    savedAt: "May 18, 2026",
    reviewProgress: 35,
    contextSentence:
      "The result is a framework that feels useful in theory but weak in real comprehension."
  },
  {
    id: "2",
    word: "deliberate",
    pronunciation: "/dɪˈlɪbərət/",
    partOfSpeech: "adjective",
    meaning: "done consciously and intentionally",
    source: "The_Economist_Article.pdf",
    status: "reviewing",
    savedAt: "May 17, 2026",
    reviewProgress: 68,
    contextSentence: "Great readers build deliberate habits."
  },
  {
    id: "3",
    word: "sustain",
    pronunciation: "/səˈsteɪn/",
    partOfSpeech: "verb",
    meaning: "to maintain or keep going over time",
    source: "Neuroscience_Review.pdf",
    status: "learning",
    savedAt: "May 16, 2026",
    reviewProgress: 22,
    contextSentence: "A strong reading system must also help knowledge sustain over time."
  },
  {
    id: "4",
    word: "coherent",
    pronunciation: "/koʊˈhɪrənt/",
    partOfSpeech: "adjective",
    meaning: "logical, consistent, and easy to understand",
    source: "The_Economist_Article.pdf",
    status: "mastered",
    savedAt: "May 14, 2026",
    reviewProgress: 100,
    contextSentence: "They return to the same passages until patterns become coherent."
  },
  {
    id: "5",
    word: "reliable",
    pronunciation: "/rɪˈlaɪəbəl/",
    partOfSpeech: "adjective",
    meaning: "consistently good and dependable",
    source: "Product_Strategy_Essay.pdf",
    status: "reviewing",
    savedAt: "May 12, 2026",
    reviewProgress: 74,
    contextSentence: "The most effective learners take a reliable approach."
  },
  {
    id: "6",
    word: "effortless",
    pronunciation: "/ˈefərtləs/",
    partOfSpeech: "adjective",
    meaning: "requiring little or no effort",
    source: "The_Economist_Article.pdf",
    status: "mastered",
    savedAt: "May 10, 2026",
    reviewProgress: 100,
    contextSentence: "With the right tools, fluency can feel almost effortless."
  }
];
