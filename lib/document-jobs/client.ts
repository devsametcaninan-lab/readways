"use client";

import { createClient } from "@/lib/supabase/client";
import {
  createDocumentJob,
  markDocumentJobCompleted,
  markDocumentJobFailed,
  updateDocumentJobStatus
} from "./jobs";
import type {
  CreateDocumentJobParams,
  DocumentJobRecord,
  MarkDocumentJobCompletedParams,
  MarkDocumentJobFailedParams,
  UpdateDocumentJobStatusParams
} from "./types";

async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage document jobs.");
  }

  return user.id;
}

export async function createDocumentJobClient(
  params: Omit<CreateDocumentJobParams, "userId">
): Promise<DocumentJobRecord> {
  const supabase = createClient();
  const userId = await requireUserId();

  return createDocumentJob(supabase, {
    ...params,
    userId
  });
}

export async function updateDocumentJobStatusClient(
  params: UpdateDocumentJobStatusParams
): Promise<DocumentJobRecord> {
  const supabase = createClient();
  return updateDocumentJobStatus(supabase, params);
}

export async function markDocumentJobCompletedClient(
  params: MarkDocumentJobCompletedParams
): Promise<DocumentJobRecord> {
  const supabase = createClient();
  return markDocumentJobCompleted(supabase, params);
}

export async function markDocumentJobFailedClient(
  params: MarkDocumentJobFailedParams
): Promise<DocumentJobRecord> {
  const supabase = createClient();
  return markDocumentJobFailed(supabase, params);
}
