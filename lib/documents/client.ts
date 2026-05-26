"use client";

import { createClient } from "@/lib/supabase/client";
import type { DocumentStatus } from "@/lib/supabase/schema";
import { toDocumentListItem } from "./mappers";
import type { DocumentListItem, DocumentRecord } from "./types";
import type { DocumentLanguage } from "@/lib/language/document-language";
import { encodeDocumentFailureReason } from "./failure-reason";
import type { PdfErrorCode } from "@/lib/pdf/errors";
import { paragraphsToExtractedText } from "./text";
import { sanitizeOriginalFileName } from "./storage";

const LIST_COLUMNS =
  "id, title, file_name, file_size, page_count, extracted_text, language, status, created_at, updated_at";

async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage documents.");
  }

  return user.id;
}

export async function createProcessingDocument(file: File): Promise<string> {
  const supabase = createClient();
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title: file.name,
      file_name: file.name,
      original_file_name: sanitizeOriginalFileName(file.name),
      file_size: file.size,
      page_count: 0,
      status: "processing"
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create document.");
  }

  return data.id;
}

export async function markDocumentReady(
  documentId: string,
  payload: {
    pageCount: number;
    paragraphs: string[];
    language: DocumentLanguage;
    storagePath: string;
    originalFileName: string;
  }
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("documents")
    .update({
      page_count: payload.pageCount,
      extracted_text: paragraphsToExtractedText(payload.paragraphs),
      language: payload.language,
      storage_path: payload.storagePath,
      original_file_name: payload.originalFileName,
      status: "ready"
    })
    .eq("id", documentId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markDocumentFailed(
  documentId: string,
  errorCode?: PdfErrorCode
): Promise<void> {
  const supabase = createClient();

  await supabase
    .from("documents")
    .update({
      status: "failed",
      extracted_text: errorCode ? encodeDocumentFailureReason(errorCode) : null
    })
    .eq("id", documentId);
}

export async function listUserDocuments(limit?: number): Promise<DocumentListItem[]> {
  const supabase = createClient();

  let query = supabase
    .from("documents")
    .select(LIST_COLUMNS)
    .order("updated_at", { ascending: false });

  if (limit != null) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as DocumentRecord[]).map(toDocumentListItem);
}

export async function getDocumentStatus(
  documentId: string
): Promise<DocumentStatus | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("status")
    .eq("id", documentId)
    .maybeSingle();

  if (error || !data) return null;
  return data.status as DocumentStatus;
}
