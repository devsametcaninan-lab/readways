import type { SupabaseClient } from "@/lib/supabase/types";

export type WordExplanationRecord = {
  id: string;
  user_id: string;
  document_id: string;
  word: string;
  sentence: string;
  definition: string | null;
  contextual_meaning: string | null;
  pronunciation: string | null;
};

export async function getWordExplanationForUser(params: {
  supabase: SupabaseClient;
  wordExplanationId: string;
  userId: string;
  documentId: string;
}): Promise<WordExplanationRecord | null> {
  const { supabase, wordExplanationId, userId, documentId } = params;

  const { data, error } = await supabase
    .from("word_explanations")
    .select(
      "id, user_id, document_id, word, sentence, definition, contextual_meaning, pronunciation"
    )
    .eq("id", wordExplanationId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (data.user_id !== userId || data.document_id !== documentId) {
    return null;
  }

  return data;
}
