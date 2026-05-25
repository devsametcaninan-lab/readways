import { createClient } from "@/lib/supabase/server";
import {
  reviewProgressForStatus,
  type SavedWordItem
} from "./types";

type SavedWordRow = {
  id: string;
  word: string;
  status: SavedWordItem["status"];
  created_at: string;
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
};

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
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as SavedWordRow[]).map((row) => {
    const explanation = row.word_explanations;
    const document = row.documents;
    const meaning =
      explanation?.contextual_meaning ??
      explanation?.definition ??
      "No definition available.";

    return {
      id: row.id,
      word: row.word,
      pronunciation: explanation?.pronunciation ?? "—",
      partOfSpeech: "word",
      meaning,
      source: document?.title ?? document?.file_name ?? "Unknown document",
      status: row.status,
      savedAt: new Date(row.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      reviewProgress: reviewProgressForStatus(row.status),
      contextSentence: explanation?.sentence ?? ""
    };
  });
}
