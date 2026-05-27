import type { DocumentStatus } from "@/lib/supabase/schema";
import type { DocumentLanguage } from "@/lib/language/document-language";

/** Document row fields used across list and reader views */
export type DocumentRecord = {
  id: string;
  title: string;
  file_name: string;
  file_size: number;
  page_count: number;
  extracted_text: string | null;
  storage_path: string | null;
  original_file_name: string | null;
  language: string;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
};

export type DocumentListItem = {
  id: string;
  title: string;
  fileName: string;
  source: string;
  progress: number | null;
  updatedAtLabel: string;
  savedWordsCount: number;
  status: DocumentStatus;
  pageCount: number;
  failureMessage: string | null;
};

/** Shape consumed by ReaderView for uploaded documents */
export type ReaderDocument = {
  id: string;
  title: string;
  source: string;
  pageCount: number;
  progress: number | null;
  paragraphs: string[];
  language: DocumentLanguage;
};
