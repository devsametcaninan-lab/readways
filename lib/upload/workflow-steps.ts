import type { ExtractProgress } from "@/lib/pdf/extract-pdf-text";

export const UPLOAD_WORKFLOW_STEP_IDS = [
  "upload",
  "extract",
  "clean",
  "save",
  "ready"
] as const;

export type UploadWorkflowStepId = (typeof UPLOAD_WORKFLOW_STEP_IDS)[number];

export function workflowStepFromExtractProgress(
  progress: ExtractProgress
): UploadWorkflowStepId {
  if (progress.phase === "cleaning") {
    return "clean";
  }

  return "extract";
}

export function workflowStepIndex(step: UploadWorkflowStepId): number {
  return UPLOAD_WORKFLOW_STEP_IDS.findIndex((item) => item === step);
}
