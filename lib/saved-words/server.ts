import { createClient } from "@/lib/supabase/server";
import { DEFAULT_UI_LOCALE } from "@/lib/i18n/constants";
import { getServerT } from "@/lib/i18n/server";
import { formatSavedDate } from "./format";
import {
  computeReviewProgress,
  isPhraseWord,
  type SavedWordItem
} from "./types";

type FlashcardEmbed = {
  id: string;
  difficulty: number | null;
  review_count: number;
};

type SavedWordRow = {
  id: string;
  word: string;
  status: SavedWordItem["status"];
  created_at: string;
  document_id: string | null;
  word_explanations: {
    pronunciation: string | null;
    definition: string | null;
    contextual_meaning: string | null;
    sentence: string;
  } | null;
  documents: {
    title: string;
    file_name: string;
  } | null;
  flashcards: FlashcardEmbed | FlashcardEmbed[] | null;
};

function pickFlashcard(
  embed: FlashcardEmbed | FlashcardEmbed[] | null
): FlashcardEmbed | null {
  if (!embed) {
    return null;
  }

  if (Array.isArray(embed)) {
    return embed[0] ?? null;
  }

  return embed;
}

function mapSavedWordRow(row: SavedWordRow, t: (key: string) => string): SavedWordItem {
  const explanation = row.word_explanations;
  const document = row.documents;
  const flashcard = pickFlashcard(row.flashcards);

  const definition = explanation?.definition?.trim() ?? "";
  const contextualMeaning = explanation?.contextual_meaning?.trim() ?? "";
  const meaning = contextualMeaning || definition || t("app.savedWordsNoDefinition");
  const pronunciation = explanation?.pronunciation?.trim() || null;
  const source = document?.title ?? document?.file_name ?? t("app.savedWordsUnknownDocument");

  return {
    id: row.id,
    word: row.word,
    pronunciation,
    partOfSpeech: isPhraseWord(row.word) ? "phrase" : "word",
    definition: definition || meaning,
    contextualMeaning: contextualMeaning || definition,
    meaning,
    source,
    documentId: row.document_id,
    status: row.status,
    savedAt: formatSavedDate(row.created_at, DEFAULT_UI_LOCALE),
    savedAtIso: row.created_at,
    reviewProgress: computeReviewProgress({
      status: row.status,
      reviewCount: flashcard?.review_count ?? null,
      difficulty: flashcard?.difficulty ?? null
    }),
    contextSentence: explanation?.sentence ?? "",
    flashcardId: flashcard?.id ?? null,
    difficulty: flashcard?.difficulty ?? null
  };
}

export async function getSavedWordsForUser(): Promise<SavedWordItem[]> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("saved_words")
    .select(
      `
      id,
      word,
      status,
      created_at,
      document_id,
      word_explanations (
        pronunciation,
        definition,
        contextual_meaning,
        sentence
      ),
      documents (
        title,
        file_name
      ),
      flashcards (
        id,
        difficulty,
        review_count
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const t = getServerT();
  return (data as SavedWordRow[]).map((row) => mapSavedWordRow(row, t));
}
