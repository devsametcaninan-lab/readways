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

export async function insertWordExplanation(
  params: SaveWordExplanationParams
): Promise<boolean> {
  const { supabase, ...row } = params;

  const { error } = await supabase.from("word_explanations").insert({
    user_id: row.userId,
    document_id: row.documentId,
    word: row.word,
    sentence: row.sentence,
    sentence_hash: row.sentenceHash,
    definition: row.definition,
    contextual_meaning: row.contextual_meaning,
    pronunciation: row.pronunciation,
    language: row.language
  });

  return !error;
}
