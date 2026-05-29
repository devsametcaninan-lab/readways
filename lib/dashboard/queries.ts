import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DashboardData,
  DashboardDueFlashcardPreview,
  DashboardSavedWordPreview,
  DashboardStats
} from "./types";
import { isDashboardNewUser } from "./stats-display";

type SavedWordPreviewRow = {
  id: string;
  word: string;
  word_explanations: {
    definition: string | null;
    contextual_meaning: string | null;
  } | null;
};

type DueFlashcardRow = {
  id: string;
  front: string;
  next_review_at: string | null;
  saved_words: {
    word_explanations: {
      sentence: string | null;
    } | null;
  } | null;
};

function countFromResponse(count: number | null, error: { message: string } | null): number {
  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function fetchDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  const now = new Date().toISOString();

  const [
    documentsRes,
    documentsReadyRes,
    savedWordsRes,
    flashcardsRes,
    flashcardsDueRes,
    reviewsRes,
    positiveReviewsRes,
    masteredWordsRes
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "ready"),
    supabase
      .from("saved_words")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .or(`next_review_at.is.null,next_review_at.lte.${now}`),
    supabase
      .from("review_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("review_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("rating", ["good", "easy"]),
    supabase
      .from("saved_words")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "mastered")
  ]);

  const documentsCount = countFromResponse(documentsRes.count, documentsRes.error);
  const documentsReadyCount = countFromResponse(
    documentsReadyRes.count,
    documentsReadyRes.error
  );
  const savedWordsCount = countFromResponse(savedWordsRes.count, savedWordsRes.error);
  const flashcardsCount = countFromResponse(flashcardsRes.count, flashcardsRes.error);
  const flashcardsDueCount = countFromResponse(
    flashcardsDueRes.count,
    flashcardsDueRes.error
  );
  const reviewsCount = countFromResponse(reviewsRes.count, reviewsRes.error);
  const positiveReviewsCount = countFromResponse(
    positiveReviewsRes.count,
    positiveReviewsRes.error
  );
  const masteredWordsCount = countFromResponse(
    masteredWordsRes.count,
    masteredWordsRes.error
  );

  return {
    documentsCount,
    documentsReadyCount,
    savedWordsCount,
    flashcardsCount,
    flashcardsDueCount,
    reviewsCount,
    positiveReviewsCount,
    masteredWordsCount
  };
}

function mapSavedWordPreview(row: SavedWordPreviewRow): DashboardSavedWordPreview {
  const explanation = row.word_explanations;
  const definition = explanation?.definition?.trim() ?? "";
  const contextual = explanation?.contextual_meaning?.trim() ?? "";
  const meaning = contextual || definition || "No definition yet";

  return {
    id: row.id,
    word: row.word,
    meaning
  };
}

function mapDueFlashcardPreview(row: DueFlashcardRow): DashboardDueFlashcardPreview {
  const sentence = row.saved_words?.word_explanations?.sentence?.trim() ?? "";
  const context =
    sentence.length > 72 ? `${sentence.slice(0, 69)}…` : sentence || "From your reading";

  return {
    id: row.id,
    word: row.front,
    context,
    dueLabel: "",
    nextReviewAt: row.next_review_at
  };
}

export async function fetchDashboardSavedWordPreviews(
  supabase: SupabaseClient,
  userId: string,
  limit = 4
): Promise<DashboardSavedWordPreview[]> {
  const { data, error } = await supabase
    .from("saved_words")
    .select(
      `
      id,
      word,
      word_explanations (
        definition,
        contextual_meaning
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as unknown as SavedWordPreviewRow[]).map(mapSavedWordPreview);
}

export async function fetchDashboardDueFlashcardPreviews(
  supabase: SupabaseClient,
  userId: string,
  limit = 3
): Promise<DashboardDueFlashcardPreview[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("flashcards")
    .select(
      `
      id,
      front,
      next_review_at,
      saved_words (
        word_explanations (
          sentence
        )
      )
    `
    )
    .eq("user_id", userId)
    .or(`next_review_at.is.null,next_review_at.lte.${now}`)
    .order("next_review_at", { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as unknown as DueFlashcardRow[]).map(mapDueFlashcardPreview);
}

export async function fetchDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  const [stats, savedWordPreviews, dueFlashcardPreviews] = await Promise.all([
    fetchDashboardStats(supabase, userId),
    fetchDashboardSavedWordPreviews(supabase, userId),
    fetchDashboardDueFlashcardPreviews(supabase, userId)
  ]);

  return {
    stats,
    progressStats: [],
    savedWordPreviews,
    dueFlashcardPreviews,
    isNewUser: isDashboardNewUser(stats)
  };
}
