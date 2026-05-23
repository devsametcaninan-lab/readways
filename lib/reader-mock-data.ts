export type TextSegment =
  | { type: "text"; value: string }
  | { type: "word"; id: string };

export type ReaderParagraph = {
  segments: TextSegment[];
};

export type VocabularyEntry = {
  id: string;
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  definition: string;
  contextMeaning: string;
  sentence: string;
};

export const readerDocument = {
  title: "Why deliberate reading beats passive study",
  source: "The_Economist_Article.pdf",
  page: 12,
  progress: 68,
  paragraphs: [
    {
      segments: [
        {
          type: "text",
          value:
            "Most learners treat vocabulary as a separate task—lists, drills, and apps that never connect to the texts they actually want to read. The result is a "
        },
        { type: "word", id: "framework" },
        {
          type: "text",
          value: " that feels useful in theory but weak in real comprehension."
        }
      ]
    },
    {
      segments: [
        { type: "text", value: "Great readers build " },
        { type: "word", id: "deliberate" },
        {
          type: "text",
          value: " habits. They choose material that challenges them without feeling overwhelming, and they return to the same passages until patterns become "
        },
        { type: "word", id: "coherent" },
        { type: "text", value: "." }
      ]
    },
    {
      segments: [
        {
          type: "text",
          value:
            "A strong reading system must also help knowledge "
        },
        { type: "word", id: "sustain" },
        {
          type: "text",
          value:
            " over time. Vocabulary should not disappear after a single session—it should remain accessible when you meet the same idea again in a new article."
        }
      ]
    },
    {
      segments: [
        { type: "text", value: "The most effective learners take a " },
        { type: "word", id: "reliable" },
        { type: "text", value: " " },
        { type: "word", id: "approach" },
        {
          type: "text",
          value:
            ": read first, clarify words in context, and review only what came from real sentences—not isolated lists copied from a dictionary."
        }
      ]
    }
  ] satisfies ReaderParagraph[]
};

export const vocabularyById: Record<string, VocabularyEntry> = {
  framework: {
    id: "framework",
    word: "framework",
    partOfSpeech: "noun",
    pronunciation: "/ˈfreɪmwɜːrk/",
    definition: "a basic structure underlying a system, concept, or text",
    contextMeaning:
      "The author suggests learners lack a connected structure linking study habits to real reading comprehension.",
    sentence:
      "The result is a framework that feels useful in theory but weak in real comprehension."
  },
  deliberate: {
    id: "deliberate",
    word: "deliberate",
    partOfSpeech: "adjective",
    pronunciation: "/dɪˈlɪbərət/",
    definition: "done consciously and intentionally",
    contextMeaning:
      "Describes reading habits chosen on purpose rather than by accident or passive routine.",
    sentence: "Great readers build deliberate habits."
  },
  coherent: {
    id: "coherent",
    word: "coherent",
    partOfSpeech: "adjective",
    pronunciation: "/koʊˈhɪrənt/",
    definition: "logical, consistent, and easy to understand",
    contextMeaning:
      "Patterns in language become clear and connected through repeated exposure to the same texts.",
    sentence:
      "They return to the same passages until patterns become coherent."
  },
  sustain: {
    id: "sustain",
    word: "sustain",
    partOfSpeech: "verb",
    pronunciation: "/səˈsteɪn/",
    definition: "to maintain or keep going over time",
    contextMeaning:
      "Knowledge and vocabulary should remain available across reading sessions, not fade after one pass.",
    sentence: "A strong reading system must also help knowledge sustain over time."
  },
  reliable: {
    id: "reliable",
    word: "reliable",
    partOfSpeech: "adjective",
    pronunciation: "/rɪˈlaɪəbəl/",
    definition: "consistently good and dependable",
    contextMeaning:
      "Emphasizes a study method that works repeatedly, not only in ideal conditions.",
    sentence: "The most effective learners take a reliable approach."
  },
  approach: {
    id: "approach",
    word: "approach",
    partOfSpeech: "noun",
    pronunciation: "/əˈproʊtʃ/",
    definition: "a way of dealing with something; a method",
    contextMeaning:
      "Refers to the read-first workflow: understand words in context, then review from real sentences.",
    sentence: "The most effective learners take a reliable approach."
  }
};

export const highlightWordIds = Object.keys(vocabularyById);
