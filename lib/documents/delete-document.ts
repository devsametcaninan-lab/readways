import type { SupabaseClient } from "@/lib/supabase/types";
import {
  DOCUMENTS_STORAGE_BUCKET,
  removeDocumentFromStorage
} from "./storage";

export type DeleteDocumentResult =
  | { ok: true; storageWarning?: string }
  | { ok: false; reason: "not_found" | "db_error" };

async function deleteRowsForDocument(
  supabase: SupabaseClient,
  userId: string,
  documentId: string
): Promise<{ ok: true } | { ok: false }> {
  const { data: savedWords, error: savedWordsError } = await supabase
    .from("saved_words")
    .select("id")
    .eq("user_id", userId)
    .eq("document_id", documentId);

  if (savedWordsError) {
    return { ok: false };
  }

  const savedWordIds = (savedWords ?? []).map((row) => row.id);

  if (savedWordIds.length > 0) {
    const { data: flashcards, error: flashcardsError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("user_id", userId)
      .in("saved_word_id", savedWordIds);

    if (flashcardsError) {
      return { ok: false };
    }

    const flashcardIds = (flashcards ?? []).map((row) => row.id);

    if (flashcardIds.length > 0) {
      const { error: reviewLogsError } = await supabase
        .from("review_logs")
        .delete()
        .eq("user_id", userId)
        .in("flashcard_id", flashcardIds);

      if (reviewLogsError) {
        return { ok: false };
      }

      const { error: flashcardsDeleteError } = await supabase
        .from("flashcards")
        .delete()
        .eq("user_id", userId)
        .in("id", flashcardIds);

      if (flashcardsDeleteError) {
        return { ok: false };
      }
    }

    const { error: savedWordsDeleteError } = await supabase
      .from("saved_words")
      .delete()
      .eq("user_id", userId)
      .eq("document_id", documentId);

    if (savedWordsDeleteError) {
      return { ok: false };
    }
  }

  const { error: explanationsError } = await supabase
    .from("word_explanations")
    .delete()
    .eq("user_id", userId)
    .eq("document_id", documentId);

  if (explanationsError) {
    return { ok: false };
  }

  const { error: jobsError } = await supabase
    .from("document_jobs")
    .delete()
    .eq("user_id", userId)
    .eq("document_id", documentId);

  if (jobsError) {
    return { ok: false };
  }

  return { ok: true };
}

export async function deleteDocumentForUser(params: {
  supabase: SupabaseClient;
  userId: string;
  documentId: string;
}): Promise<DeleteDocumentResult> {
  const { supabase, userId, documentId } = params;

  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("id, storage_path")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, reason: "db_error" };
  }

  if (!document) {
    return { ok: false, reason: "not_found" };
  }

  const relatedDeleted = await deleteRowsForDocument(supabase, userId, documentId);

  if (!relatedDeleted.ok) {
    return { ok: false, reason: "db_error" };
  }

  let storageWarning: string | undefined;

  if (document.storage_path?.trim()) {
    const storageResult = await removeDocumentFromStorage(
      supabase,
      document.storage_path
    );

    if (!storageResult.ok) {
      storageWarning =
        "Document removed from your library. The PDF file could not be deleted from storage.";
    }
  }

  const { error: documentDeleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId);

  if (documentDeleteError) {
    return { ok: false, reason: "db_error" };
  }

  return { ok: true, storageWarning };
}
