import type { Flashcard, SavedWord } from "@/lib/supabase/types";

export type SaveWordRequestBody = {
  documentId: string;
  wordExplanationId: string;
  word: string;
};

export type SaveWordResultStatus = "created" | "already_saved";

export type SaveWordResponse = {
  status: SaveWordResultStatus;
  savedWord: SavedWord;
  flashcard: Flashcard | null;
};
