import { documentBelongsToUser } from "@/lib/ai-dictionary/document-ownership";
import { normalizeWord } from "@/lib/ai-dictionary/normalize-word";
import type { SupabaseClient } from "@/lib/supabase/types";
import type { Flashcard, SavedWord } from "@/lib/supabase/types";
import {
  buildFlashcardBack,
  INITIAL_FLASHCARD_DIFFICULTY
} from "./flashcard-back";
import type { SaveWordResponse } from "./types";
import { getWordExplanationForUser } from "./verify";

export async function findExistingSavedWord(params: {
  supabase: SupabaseClient;
  userId: string;
  documentId: string;
  word: string;
}): Promise<SavedWord | null> {
  const { supabase, userId, documentId, word } = params;

  const { data, error } = await supabase
    .from("saved_words")
    .select("*")
    .eq("user_id", userId)
    .eq("document_id", documentId)
    .eq("word", word)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function fetchFlashcardForSavedWord(
  supabase: SupabaseClient,
  userId: string,
  savedWordId: string
): Promise<Flashcard | null> {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", userId)
    .eq("saved_word_id", savedWordId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export type PersistSaveWordResult =
  | { ok: true; response: SaveWordResponse }
  | { ok: false; reason: "forbidden_document" | "forbidden_explanation" | "db_error" };

export async function persistSaveWord(params: {
  supabase: SupabaseClient;
  userId: string;
  documentId: string;
  wordExplanationId: string;
  word: string;
}): Promise<PersistSaveWordResult> {
  const { supabase, userId, documentId, wordExplanationId, word } = params;

  const ownsDocument = await documentBelongsToUser(supabase, documentId, userId);
  if (!ownsDocument) {
    return { ok: false, reason: "forbidden_document" };
  }

  const explanation = await getWordExplanationForUser({
    supabase,
    wordExplanationId,
    userId,
    documentId
  });

  if (!explanation) {
    return { ok: false, reason: "forbidden_explanation" };
  }

  const storedWord = normalizeWord(word) || explanation.word;

  const existing = await findExistingSavedWord({
    supabase,
    userId,
    documentId,
    word: storedWord
  });

  if (existing) {
    const flashcard = await fetchFlashcardForSavedWord(
      supabase,
      userId,
      existing.id
    );

    return {
      ok: true,
      response: {
        status: "already_saved",
        savedWord: existing,
        flashcard
      }
    };
  }

  const { data: savedWord, error: savedWordError } = await supabase
    .from("saved_words")
    .insert({
      user_id: userId,
      document_id: documentId,
      word_explanation_id: wordExplanationId,
      word: storedWord,
      status: "learning"
    })
    .select("*")
    .single();

  if (savedWordError || !savedWord) {
    return { ok: false, reason: "db_error" };
  }

  const definition = explanation.definition ?? "";
  const contextualMeaning = explanation.contextual_meaning ?? "";
  const back = buildFlashcardBack({
    definition,
    contextual_meaning: contextualMeaning,
    sentence: explanation.sentence
  });

  const { data: flashcard, error: flashcardError } = await supabase
    .from("flashcards")
    .insert({
      user_id: userId,
      saved_word_id: savedWord.id,
      front: word.trim() || storedWord,
      back,
      difficulty: INITIAL_FLASHCARD_DIFFICULTY,
      next_review_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (flashcardError || !flashcard) {
    await supabase.from("saved_words").delete().eq("id", savedWord.id);
    return { ok: false, reason: "db_error" };
  }

  const response: SaveWordResponse = {
    status: "created",
    savedWord,
    flashcard
  };

  return { ok: true, response };
}
