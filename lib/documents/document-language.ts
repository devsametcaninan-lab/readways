import type { SupabaseClient } from "@/lib/supabase/types";
import {
  DEFAULT_DOCUMENT_LANGUAGE,
  normalizeDocumentLanguage,
  type DocumentLanguage
} from "@/lib/language/document-language";

export async function getDocumentLanguageForUser(params: {
  supabase: SupabaseClient;
  documentId: string;
  userId: string;
}): Promise<DocumentLanguage> {
  const { supabase, documentId, userId } = params;

  const { data, error } = await supabase
    .from("documents")
    .select("language")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_DOCUMENT_LANGUAGE;
  }

  return normalizeDocumentLanguage(data.language);
}
