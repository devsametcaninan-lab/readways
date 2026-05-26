import type { SavedWordStatus } from "@/lib/supabase/schema";

export type { SavedWordStatus as WordStatus };

export type SavedWordItem = {
  id: string;
  word: string;
  pronunciation: string | null;
  partOfSpeech: "word" | "phrase";
  definition: string;
  contextualMeaning: string;
  meaning: string;
  source: string;
  documentId: string | null;
  status: SavedWordStatus;
  savedAt: string;
  savedAtIso: string;
  reviewProgress: number;
  contextSentence: string;
  flashcardId: string | null;
  difficulty: number | null;
};

export const statusLabels: Record<SavedWordStatus, string> = {
  learning: "Learning",
  reviewing: "Reviewing",
  mastered: "Mastered"
};

export function reviewProgressForStatus(status: SavedWordStatus): number {
  switch (status) {
    case "mastered":
      return 100;
    case "reviewing":
      return 68;
    default:
      return 35;
  }
}

export function isPhraseWord(word: string): boolean {
  return /\s/.test(word.trim());
}
