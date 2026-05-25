import type { SupabaseClient } from "@/lib/supabase/types";
import type { ExplainWordPayload } from "./types";

export type CachedWordExplanationRow = {
  id: string;
  word: string;
  sentence: string;
  definition: string | null;
  contextual_meaning: string | null;
  pronunciation: string | null;
  language: string;
};

export async function findCachedWordExplanation(params: {
  supabase: SupabaseClient;
  userId: string;
  documentId: string;
  word: string;
  sentenceHash: string;
}): Promise<CachedWordExplanationRow | null> {
  const { supabase, userId, documentId, word, sentenceHash } = params;

  const { data, error } = await supabase
    .from("word_explanations")
    .select(
      "id, word, sentence, definition, contextual_meaning, pronunciation, language"
    )
    .eq("user_id", userId)
    .eq("document_id", documentId)
    .eq("word", word)
    .eq("sentence_hash", sentenceHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export function cachedExplanationToPayload(
  row: CachedWordExplanationRow
): ExplainWordPayload {
  return {
    source: "cache",
    wordExplanationId: row.id,
    word: row.word,
    pronunciation: row.pronunciation ?? "—",
    definition: row.definition ?? "—",
    contextual_meaning: row.contextual_meaning ?? "—",
    sentence: row.sentence,
    language: row.language
  };
}
