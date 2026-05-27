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
  reviewProgress: number | null;
  contextSentence: string;
  flashcardId: string | null;
  difficulty: number | null;
};

export const statusLabels: Record<SavedWordStatus, string> = {
  learning: "Learning",
  reviewing: "Reviewing",
  mastered: "Mastered"
};

export function computeReviewProgress(params: {
  status: SavedWordStatus;
  reviewCount: number | null;
  difficulty: number | null;
}): number | null {
  const { status, reviewCount, difficulty } = params;

  if (reviewCount == null) {
    return null;
  }

  if (status === "mastered") {
    return 100;
  }

  if (reviewCount === 0) {
    return 0;
  }

  if (status === "learning") {
    return Math.min(40, 8 + reviewCount * 8);
  }

  const difficultyBonus =
    typeof difficulty === "number" ? Math.max(0, Math.min(12, Math.round(difficulty * 2))) : 0;

  return Math.min(90, 45 + reviewCount * 7 + difficultyBonus);
}

export function isPhraseWord(word: string): boolean {
  return /\s/.test(word.trim());
}
