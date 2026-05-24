import type { DocumentStatus } from "@/lib/supabase/schema";

/** Document row fields used across list and reader views */
export type DocumentRecord = {
  id: string;
  title: string;
  file_name: string;
  file_size: number;
  page_count: number;
  extracted_text: string | null;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
};

export type DocumentListItem = {
  id: string;
  title: string;
  fileName: string;
  source: string;
  progress: number;
  updatedAtLabel: string;
  savedWordsCount: number;
  status: DocumentStatus;
  pageCount: number;
};

/** Shape consumed by ReaderView for uploaded documents */
export type ReaderDocument = {
  id: string;
  title: string;
  source: string;
  pageCount: number;
  progress: number;
  paragraphs: string[];
};
