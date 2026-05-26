import { documentBelongsToUser } from "@/lib/ai-dictionary/document-ownership";
import type { SupabaseClient } from "@/lib/supabase/types";
import type { Flashcard, SavedWord } from "@/lib/supabase/types";
import type { WordExplanationRecord } from "./verify";
import { isUniqueViolation } from "@/lib/supabase/postgres-errors";
import {
  buildFlashcardBack,
  INITIAL_FLASHCARD_DIFFICULTY
} from "./flashcard-back";
import { normalizeStoredWord } from "./normalize-stored-word";
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

async function insertFlashcardForSavedWord(params: {
  supabase: SupabaseClient;
  userId: string;
  savedWord: SavedWord;
  explanation: WordExplanationRecord;
  displayWord: string;
}): Promise<Flashcard | null> {
  const { supabase, userId, savedWord, explanation, displayWord } = params;
  const storedWord = savedWord.word;

  const definition = explanation.definition ?? "";
  const contextualMeaning = explanation.contextual_meaning ?? "";
  const back = buildFlashcardBack({
    definition,
    contextual_meaning: contextualMeaning,
    sentence: explanation.sentence
  });

  const { data: flashcard, error } = await supabase
    .from("flashcards")
    .insert({
      user_id: userId,
      saved_word_id: savedWord.id,
      front: displayWord.trim() || storedWord,
      back,
      difficulty: INITIAL_FLASHCARD_DIFFICULTY,
      next_review_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (error) {
    if (isUniqueViolation(error)) {
      return fetchFlashcardForSavedWord(supabase, userId, savedWord.id);
    }
    return null;
  }

  return flashcard;
}

function alreadySavedResponse(
  savedWord: SavedWord,
  flashcard: Flashcard | null
): PersistSaveWordResult {
  return {
    ok: true,
    response: {
      status: "already_saved",
      savedWord,
      flashcard
    }
  };
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

  const storedWord = normalizeStoredWord(word, explanation.word);
  if (!storedWord) {
    return { ok: false, reason: "db_error" };
  }

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

    return alreadySavedResponse(existing, flashcard);
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
    if (isUniqueViolation(savedWordError)) {
      const raced = await findExistingSavedWord({
        supabase,
        userId,
        documentId,
        word: storedWord
      });

      if (raced) {
        const flashcard = await fetchFlashcardForSavedWord(supabase, userId, raced.id);
        return alreadySavedResponse(raced, flashcard);
      }
    }

    return { ok: false, reason: "db_error" };
  }

  const flashcard = await insertFlashcardForSavedWord({
    supabase,
    userId,
    savedWord,
    explanation,
    displayWord: word
  });

  if (!flashcard) {
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
