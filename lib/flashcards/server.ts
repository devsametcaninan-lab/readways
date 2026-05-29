import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import type { FlashcardReviewItem, SessionStats } from "./types";

type FlashcardRow = {
  id: string;
  front: string;
  back: string;
  saved_words: {
    word: string;
    status: string;
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
  } | null;
};

function mapFlashcardRow(
  row: FlashcardRow,
  t: (key: string) => string
): FlashcardReviewItem | null {
  const saved = row.saved_words;
  const explanation = saved?.word_explanations;

  if (!saved) {
    return null;
  }

  const definition = explanation?.definition ?? row.back.split("\n\n")[0] ?? "";
  const contextualMeaning =
    explanation?.contextual_meaning ?? row.back.split("\n\n")[1] ?? "";
  const contextSentence = explanation?.sentence ?? "";

  return {
    id: row.id,
    word: row.front || saved.word,
    pronunciation: explanation?.pronunciation ?? "—",
    partOfSpeech: "word",
    definition,
    contextualMeaning,
    contextSentence,
    source:
      saved.documents?.title ??
      saved.documents?.file_name ??
      t("app.savedWordsUnknownDocument")
  };
}

export async function getDueFlashcardsForUser(): Promise<{
  deck: FlashcardReviewItem[];
  stats: SessionStats;
}> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      deck: [],
      stats: { dueToday: 0, learning: 0, mastered: 0 }
    };
  }

  const now = new Date().toISOString();

  const { data: dueRows, error: dueError } = await supabase
    .from("flashcards")
    .select(
      `
      id,
      front,
      back,
      saved_words (
        word,
        status,
        word_explanations (
          pronunciation,
          definition,
          contextual_meaning,
          sentence
        ),
        documents (
          title,
          file_name
        )
      )
    `
    )
    .eq("user_id", user.id)
    .or(`next_review_at.is.null,next_review_at.lte.${now}`)
    .order("next_review_at", { ascending: true, nullsFirst: true });

  const { data: statusRows } = await supabase
    .from("saved_words")
    .select("status")
    .eq("user_id", user.id);

  const learning =
    statusRows?.filter((row) => row.status === "learning").length ?? 0;
  const mastered =
    statusRows?.filter((row) => row.status === "mastered").length ?? 0;

  if (dueError || !dueRows) {
    return {
      deck: [],
      stats: { dueToday: 0, learning, mastered }
    };
  }

  const t = getServerT();
  const deck = (dueRows as FlashcardRow[])
    .map((row) => mapFlashcardRow(row, t))
    .filter((card): card is FlashcardReviewItem => card !== null);

  return {
    deck,
    stats: {
      dueToday: deck.length,
      learning,
      mastered
    }
  };
}
