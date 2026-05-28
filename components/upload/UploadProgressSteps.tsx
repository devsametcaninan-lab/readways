"use client";

import {
  UPLOAD_WORKFLOW_STEP_IDS,
  workflowStepIndex,
  type UploadWorkflowStepId
} from "@/lib/upload/workflow-steps";
import { useI18n } from "@/lib/i18n/provider";

type UploadProgressStepsProps = {
  activeStep: UploadWorkflowStepId;
};

export default function UploadProgressSteps({ activeStep }: UploadProgressStepsProps) {
  const { t } = useI18n();
  const activeIndex = workflowStepIndex(activeStep);
  const stepLabels: Record<UploadWorkflowStepId, string> = {
    upload: t("app.uploadStepUpload"),
    extract: t("app.uploadStepExtract"),
    clean: t("app.uploadStepClean"),
    save: t("app.uploadStepSave"),
    ready: t("app.uploadStepReady")
  };

  return (
    <ol className="space-y-2.5" aria-label={t("app.uploadProgressAria")}>
      {UPLOAD_WORKFLOW_STEP_IDS.map((stepId, index) => {
        const isComplete = index < activeIndex || activeStep === "ready";
        const isActive = activeStep !== "ready" && index === activeIndex;

        return (
          <li
            key={stepId}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors duration-200 ${
              isActive
                ? "border-accent/25 bg-accent/[0.06]"
                : isComplete
                  ? "border-white/[0.08] bg-white/[0.02]"
                  : "border-transparent bg-transparent"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${
                isComplete
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300/90"
                  : isActive
                    ? "border-accent/40 bg-accent/15 text-[#c5cdff]"
                    : "border-white/[0.1] bg-white/[0.03] text-zinc-600"
              }`}
              aria-hidden
            >
              {isComplete ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <span
              className={`text-sm ${
                isActive ? "font-medium text-zinc-100" : isComplete ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              {stepLabels[stepId]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
