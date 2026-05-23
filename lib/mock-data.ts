export type Document = {
  id: string;
  title: string;
  source: string;
  progress: number;
  updatedAt: string;
};

export type SavedWord = {
  id: string;
  word: string;
  meaning: string;
  source: string;
};

export type Flashcard = {
  id: string;
  word: string;
  due: string;
  context: string;
};

export type ProgressStat = {
  label: string;
  value: string;
  sub: string;
};

export const mockUser = {
  name: "Samet",
  plan: "Personal Reader"
};

export const recentDocuments: Document[] = [
  {
    id: "1",
    title: "The_Economist_Article.pdf",
    source: "The Economist",
    progress: 68,
    updatedAt: "2 hours ago"
  },
  {
    id: "2",
    title: "Neuroscience_Review.pdf",
    source: "Academic",
    progress: 34,
    updatedAt: "Yesterday"
  },
  {
    id: "3",
    title: "Product_Strategy_Essay.pdf",
    source: "Essay",
    progress: 12,
    updatedAt: "3 days ago"
  }
];

export const readingProgressStats: ProgressStat[] = [
  { label: "Words saved", value: "142", sub: "+18 this week" },
  { label: "Reading time", value: "6.5h", sub: "Last 7 days" },
  { label: "Cards reviewed", value: "89", sub: "92% accuracy" },
  { label: "Documents", value: "7", sub: "2 in progress" }
];

export const savedWords: SavedWord[] = [
  { id: "1", word: "deliberate", meaning: "done consciously and intentionally", source: "The Economist" },
  { id: "2", word: "framework", meaning: "basic structure underlying a system", source: "Product Essay" },
  { id: "3", word: "sustain", meaning: "maintain over time", source: "Neuroscience Review" },
  { id: "4", word: "coherent", meaning: "logically connected and clear", source: "The Economist" },
  { id: "5", word: "articulate", meaning: "express clearly and effectively", source: "Product Essay" }
];

export const flashcardsDue: Flashcard[] = [
  { id: "1", word: "effortless", due: "Now", context: "…can feel almost effortless." },
  { id: "2", word: "deliberate", due: "2h", context: "…a deliberate approach to…" },
  { id: "3", word: "reliable", due: "Tomorrow", context: "…a reliable reading habit." }
];

export const libraryDocuments: Document[] = [
  ...recentDocuments,
  {
    id: "4",
    title: "Climate_Policy_Brief.pdf",
    source: "Research",
    progress: 0,
    updatedAt: "1 week ago"
  },
  {
    id: "5",
    title: "UX_Writing_Guide.pdf",
    source: "Documentation",
    progress: 91,
    updatedAt: "2 weeks ago"
  }
];
