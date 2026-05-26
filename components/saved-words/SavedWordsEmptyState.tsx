type SavedWordsEmptyStateProps = {
  variant: "vault" | "no-results";
};

export default function SavedWordsEmptyState({ variant }: SavedWordsEmptyStateProps) {
  if (variant === "no-results") {
    return (
      <div className="rounded-2xl border border-white/[0.1] bg-[#12141d] px-6 py-14 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <p className="text-base font-medium text-zinc-200">No matches in your vault</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
          Try a different search term or filter. Your saved words are still here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-[#12141d] px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-base font-medium text-zinc-200">Your vocabulary vault is empty</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
        Read a document and save words or phrases as flashcards. They will appear here,
        grouped by source.
      </p>
    </div>
  );
}
