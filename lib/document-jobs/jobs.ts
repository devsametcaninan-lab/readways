import type { Json } from "@/lib/supabase/database.types";
import type { DocumentJobStatus } from "@/lib/supabase/schema";
import type { SupabaseClient } from "@/lib/supabase/types";
import type {
  CreateDocumentJobParams,
  DocumentJobRecord,
  MarkDocumentJobCompletedParams,
  MarkDocumentJobFailedParams,
  UpdateDocumentJobStatusParams
} from "./types";

export const MAX_DOCUMENT_JOB_ATTEMPTS = 5;

const ERROR_MESSAGE_MAX_LENGTH = 500;

function truncateErrorMessage(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length <= ERROR_MESSAGE_MAX_LENGTH) {
    return trimmed;
  }

  return trimmed.slice(0, ERROR_MESSAGE_MAX_LENGTH);
}

function metadataToJson(metadata?: Record<string, unknown>): Json {
  return (metadata ?? {}) as Json;
}

function parseMetadata(value: Json | null | undefined): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function mergeMetadata(
  existing: Record<string, unknown>,
  patch?: Record<string, unknown>
): Json {
  if (!patch) {
    return metadataToJson(existing);
  }

  return metadataToJson({ ...existing, ...patch });
}

export function isDocumentJobRetryable(attempts: number): boolean {
  return attempts < MAX_DOCUMENT_JOB_ATTEMPTS;
}

function mapJobRow(row: {
  id: string;
  user_id: string;
  document_id: string;
  job_type: DocumentJobRecord["job_type"];
  status: DocumentJobStatus;
  attempts: number;
  error_message: string | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}): DocumentJobRecord {
  return {
    id: row.id,
    user_id: row.user_id,
    document_id: row.document_id,
    job_type: row.job_type,
    status: row.status,
    attempts: row.attempts,
    error_message: row.error_message,
    metadata: parseMetadata(row.metadata),
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at
  };
}

export async function createDocumentJob(
  supabase: SupabaseClient,
  params: CreateDocumentJobParams
): Promise<DocumentJobRecord> {
  const { data, error } = await supabase
    .from("document_jobs")
    .insert({
      user_id: params.userId,
      document_id: params.documentId,
      job_type: params.jobType,
      status: params.status ?? "pending",
      metadata: metadataToJson(params.metadata)
    })
    .select(
      "id, user_id, document_id, job_type, status, attempts, error_message, metadata, created_at, updated_at, completed_at"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create document job.");
  }

  return mapJobRow(data);
}

export async function updateDocumentJobStatus(
  supabase: SupabaseClient,
  params: UpdateDocumentJobStatusParams
): Promise<DocumentJobRecord> {
  const updatePayload: {
    status: DocumentJobStatus;
    attempts?: number;
    metadata?: Json;
  } = {
    status: params.status
  };

  if (params.incrementAttempts || params.metadataPatch) {
    const { data: existing, error: readError } = await supabase
      .from("document_jobs")
      .select("attempts, metadata")
      .eq("id", params.jobId)
      .single();

    if (readError || !existing) {
      throw new Error(readError?.message ?? "Document job not found.");
    }

    if (params.incrementAttempts) {
      updatePayload.attempts = existing.attempts + 1;
    }

    if (params.metadataPatch) {
      updatePayload.metadata = mergeMetadata(
        parseMetadata(existing.metadata),
        params.metadataPatch
      );
    }
  }

  const { data, error } = await supabase
    .from("document_jobs")
    .update(updatePayload)
    .eq("id", params.jobId)
    .select(
      "id, user_id, document_id, job_type, status, attempts, error_message, metadata, created_at, updated_at, completed_at"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update document job.");
  }

  return mapJobRow(data);
}

export async function markDocumentJobCompleted(
  supabase: SupabaseClient,
  params: MarkDocumentJobCompletedParams
): Promise<DocumentJobRecord> {
  const completedAt = new Date().toISOString();

  let metadata: Json | undefined;

  if (params.metadata) {
    const { data: existing, error: readError } = await supabase
      .from("document_jobs")
      .select("metadata")
      .eq("id", params.jobId)
      .single();

    if (readError || !existing) {
      throw new Error(readError?.message ?? "Document job not found.");
    }

    metadata = mergeMetadata(parseMetadata(existing.metadata), params.metadata);
  }

  const { data, error } = await supabase
    .from("document_jobs")
    .update({
      status: "completed",
      completed_at: completedAt,
      error_message: null,
      ...(metadata ? { metadata } : {})
    })
    .eq("id", params.jobId)
    .select(
      "id, user_id, document_id, job_type, status, attempts, error_message, metadata, created_at, updated_at, completed_at"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not complete document job.");
  }

  return mapJobRow(data);
}

export async function markDocumentJobFailed(
  supabase: SupabaseClient,
  params: MarkDocumentJobFailedParams
): Promise<DocumentJobRecord> {
  const completedAt = new Date().toISOString();
  const errorMessage = truncateErrorMessage(params.errorMessage);

  const { data: existing, error: readError } = await supabase
    .from("document_jobs")
    .select("attempts, metadata")
    .eq("id", params.jobId)
    .single();

  if (readError || !existing) {
    throw new Error(readError?.message ?? "Document job not found.");
  }

  const metadata = mergeMetadata(parseMetadata(existing.metadata), {
    ...params.metadata,
    retryable: isDocumentJobRetryable(existing.attempts)
  });

  const { data, error } = await supabase
    .from("document_jobs")
    .update({
      status: "failed",
      error_message: errorMessage,
      completed_at: completedAt,
      metadata
    })
    .eq("id", params.jobId)
    .select(
      "id, user_id, document_id, job_type, status, attempts, error_message, metadata, created_at, updated_at, completed_at"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not mark document job as failed.");
  }

  return mapJobRow(data);
}
