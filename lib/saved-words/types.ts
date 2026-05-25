import type { SavedWordStatus } from "@/lib/supabase/schema";

export type { SavedWordStatus as WordStatus };

export type SavedWordItem = {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  source: string;
  status: SavedWordStatus;
  savedAt: string;
  reviewProgress: number;
  contextSentence: string;
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
