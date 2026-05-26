import type {
  DocumentJobStatus,
  DocumentJobType
} from "@/lib/supabase/schema";

export type { DocumentJobStatus, DocumentJobType };

export type DocumentJobRecord = {
  id: string;
  user_id: string;
  document_id: string;
  job_type: DocumentJobType;
  status: DocumentJobStatus;
  attempts: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type CreateDocumentJobParams = {
  userId: string;
  documentId: string;
  jobType: DocumentJobType;
  metadata?: Record<string, unknown>;
  status?: DocumentJobStatus;
};

export type UpdateDocumentJobStatusParams = {
  jobId: string;
  status: DocumentJobStatus;
  metadataPatch?: Record<string, unknown>;
  incrementAttempts?: boolean;
};

export type MarkDocumentJobCompletedParams = {
  jobId: string;
  metadata?: Record<string, unknown>;
};

export type MarkDocumentJobFailedParams = {
  jobId: string;
  errorMessage: string;
  metadata?: Record<string, unknown>;
};
