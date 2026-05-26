import type { ExtractProgress } from "@/lib/pdf/extract-pdf-text";

export const UPLOAD_WORKFLOW_STEPS = [
  { id: "upload", label: "Uploading PDF" },
  { id: "extract", label: "Extracting text" },
  { id: "clean", label: "Cleaning document" },
  { id: "save", label: "Saving to library" },
  { id: "ready", label: "Ready to read" }
] as const;

export type UploadWorkflowStepId = (typeof UPLOAD_WORKFLOW_STEPS)[number]["id"];

export function workflowStepFromExtractProgress(
  progress: ExtractProgress
): UploadWorkflowStepId {
  if (progress.phase === "cleaning") {
    return "clean";
  }

  return "extract";
}

export function workflowStepIndex(step: UploadWorkflowStepId): number {
  return UPLOAD_WORKFLOW_STEPS.findIndex((item) => item.id === step);
}
