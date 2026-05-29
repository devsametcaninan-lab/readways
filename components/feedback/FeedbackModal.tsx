"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SettingsOptionGroup from "@/components/settings/SettingsOptionGroup";
import { submitFeedback } from "@/lib/feedback/client";
import { FEEDBACK_CONTACT_EMAIL, type FeedbackType } from "@/lib/feedback/types";
import { localizeUserMessage } from "@/lib/i18n/localize-user-message";
import { useI18n } from "@/lib/i18n/provider";

type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function FeedbackModal({
  open,
  onClose,
  onSuccess,
  onError
}: FeedbackModalProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const formId = useId();
  const feedbackTypeOptions = useMemo(
    () =>
      [
        {
          value: "bug" as const,
          label: t("feedback.typeBug"),
          description: t("feedback.typeBugDesc")
        },
        {
          value: "feature_request" as const,
          label: t("feedback.typeFeature"),
          description: t("feedback.typeFeatureDesc")
        },
        {
          value: "general" as const,
          label: t("feedback.typeGeneral"),
          description: t("feedback.typeGeneralDesc")
        }
      ],
    [t]
  );
  const [type, setType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (!open) {
      setType("general");
      setMessage("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await submitFeedback({
        type,
        message,
        route: pathname ?? ""
      });
      onSuccess();
      onClose();
    } catch (error) {
      onError(
        localizeUserMessage(
          error instanceof Error ? error.message : t("toast.feedbackSendFailed"),
          t
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
    >
      <button
        type="button"
        aria-label={t("feedback.close")}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
        disabled={submitting}
      />

      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-[#12141d] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8"
        >
          <h2
            id={`${formId}-title`}
            className="text-lg font-medium tracking-tight text-white sm:text-xl"
          >
            {t("feedback.modalTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {t("feedback.modalDescription")}
          </p>

          <div className="mt-6 space-y-5">
            <SettingsOptionGroup<FeedbackType>
              name="feedback-type"
              label={t("feedback.typeLabel")}
              value={type}
              onChange={setType}
              options={feedbackTypeOptions}
            />

            <div>
              <label htmlFor={`${formId}-message`} className="block text-sm font-medium text-zinc-200">
                {t("feedback.messageLabel")}
              </label>
              <p className="mt-1 text-[13px] text-slate-500">
                {t("feedback.messagePrivacy")}
              </p>
              <textarea
                id={`${formId}-message`}
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={submitting}
                placeholder={t("feedback.messagePlaceholder")}
                className="mt-3 w-full resize-y rounded-lg border border-white/[0.10] bg-white/[0.03] px-3.5 py-3 text-sm text-zinc-100 placeholder:text-slate-600 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-60"
              />
            </div>

            <p className="text-[13px] leading-relaxed text-slate-500">
              {t("feedback.emailReachUs")}{" "}
              <a
                href={`mailto:${FEEDBACK_CONTACT_EMAIL}`}
                className="text-slate-400 underline-offset-2 hover:text-zinc-300 hover:underline"
              >
                {FEEDBACK_CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="min-h-[44px] rounded-lg border border-white/[0.12] bg-white/[0.03] px-5 py-2.5 text-sm text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || message.trim().length < 10}
              className="min-h-[44px] rounded-lg border border-accent/30 bg-accent/15 px-5 py-2.5 text-sm font-medium text-[#d4dcff] transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("feedback.sending") : t("common.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
