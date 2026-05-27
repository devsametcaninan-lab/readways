"use client";

import { useState } from "react";
import FeedbackModal from "@/components/feedback/FeedbackModal";
import { useToast } from "@/components/feedback/ToastProvider";
import { FEEDBACK_CONTACT_EMAIL } from "@/lib/feedback/types";
import { useI18n } from "@/lib/i18n/provider";
import SettingsSection from "./SettingsSection";

export default function FeedbackSettingsSection() {
  const toast = useToast();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <SettingsSection
        title="Feedback"
        description="Share bugs, ideas, or general notes during the beta."
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-accent/25 bg-accent/10 px-4 py-2.5 text-sm font-medium text-[#c5cdff] transition hover:border-accent/35 hover:bg-accent/15 sm:w-auto"
        >
          {t("common.sendFeedback")}
        </button>
        <p className="text-[13px] leading-relaxed text-slate-500">
          Prefer email? Reach us at{" "}
          <a
            href={`mailto:${FEEDBACK_CONTACT_EMAIL}`}
            className="text-slate-400 underline-offset-2 hover:text-zinc-300 hover:underline"
          >
            {FEEDBACK_CONTACT_EMAIL}
          </a>
          .
        </p>
      </SettingsSection>

      <FeedbackModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => toast.success("Thanks — your feedback was sent")}
        onError={(message) => toast.error(message)}
      />
    </>
  );
}
