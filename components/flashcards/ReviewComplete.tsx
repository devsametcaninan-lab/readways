import Link from "next/link";

type ReviewCompleteProps = {
  reviewedCount: number;
  onReviewAgain: () => void;
};

export default function ReviewComplete({ reviewedCount, onReviewAgain }: ReviewCompleteProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-white/[0.12] bg-[#12141d] px-8 py-12 text-center shadow-[0_12px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">Session</p>
      <h2 className="mt-3 text-2xl font-medium tracking-tight text-white md:text-3xl">
        Review complete
      </h2>
      <p className="mt-3 text-sm text-zinc-400">
        <span className="font-medium text-zinc-200">{reviewedCount}</span> words reviewed this
        session
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReviewAgain}
          className="flex-1 rounded-lg border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
        >
          Review again
        </button>
        <Link
          href="/saved-words"
          className="flex-1 rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-center text-sm text-zinc-300 transition hover:border-white/[0.16] hover:bg-white/[0.06]"
        >
          Back to saved words
        </Link>
      </div>
    </div>
  );
}
