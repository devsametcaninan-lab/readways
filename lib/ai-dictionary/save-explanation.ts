import type { SupabaseClient } from "@/lib/supabase/types";

export type SaveWordExplanationParams = {
  supabase: SupabaseClient;
  userId: string;
  documentId: string;
  word: string;
  sentence: string;
  sentenceHash: string;
  definition: string;
  contextual_meaning: string;
  pronunciation: string;
  language: string;
};

function isValidPersistRow(row: Omit<SaveWordExplanationParams, "supabase">): boolean {
  return Boolean(
    row.word.trim() &&
      row.sentence.trim() &&
      row.definition.trim() &&
      row.contextual_meaning.trim()
  );
}

export async function insertWordExplanation(
  params: SaveWordExplanationParams
): Promise<string | null> {
  const { supabase, ...row } = params;

  if (!isValidPersistRow(row)) {
    return null;
  }

  const { data, error } = await supabase
    .from("word_explanations")
    .insert({
      user_id: row.userId,
      document_id: row.documentId,
      word: row.word,
      sentence: row.sentence,
      sentence_hash: row.sentenceHash,
      definition: row.definition,
      contextual_meaning: row.contextual_meaning,
      pronunciation: row.pronunciation,
      language: row.language
    })
    .select("id")
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}
