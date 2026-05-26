"use client";

type DeleteDocumentModalProps = {
  open: boolean;
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteDocumentModal({
  open,
  title,
  deleting,
  onCancel,
  onConfirm
}: DeleteDocumentModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-document-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={deleting ? undefined : onCancel}
        disabled={deleting}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#12141d] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)] sm:p-8">
        <h2
          id="delete-document-title"
          className="text-lg font-medium tracking-tight text-white sm:text-xl"
        >
          Delete this document?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          This will remove the document, saved words, and flashcards connected to it.
        </p>
        <p className="mt-2 truncate text-sm text-zinc-500">{title}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="min-h-[44px] rounded-lg border border-white/[0.12] bg-white/[0.03] px-5 py-2.5 text-sm text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="min-h-[44px] rounded-lg border border-red-500/30 bg-red-500/15 px-5 py-2.5 text-sm font-medium text-red-100 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete document"}
          </button>
        </div>
      </div>
    </div>
  );
}
