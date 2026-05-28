type Rating = "hard" | "good" | "easy";

type RatingButtonsProps = {
  onRate: (rating: Rating) => void;
  disabled?: boolean;
};

import { useI18n } from "@/lib/i18n/provider";

export default function RatingButtons({ onRate, disabled = false }: RatingButtonsProps) {
  const { t } = useI18n();
  const ratings: { value: Rating; label: string; hint: string }[] = [
    { value: "hard", label: t("app.flashcardsHard"), hint: t("app.flashcardsSoon") },
    { value: "good", label: t("app.flashcardsGood"), hint: t("app.flashcardsStandard") },
    { value: "easy", label: t("app.flashcardsEasy"), hint: t("app.flashcardsLater") }
  ];

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      {ratings.map((rating) => (
        <button
          key={rating.value}
          type="button"
          disabled={disabled}
          onClick={() => onRate(rating.value)}
              className="group flex min-w-[7.5rem] items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-[#12141d] px-5 py-3 text-center transition hover:border-white/[0.18] hover:bg-[#141820] hover:shadow-[0_0_24px_rgba(124,140,255,0.12)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/[0.12] disabled:hover:bg-[#12141d] disabled:hover:shadow-none"
        >
          <span className="block text-sm font-medium text-zinc-100">{rating.label}</span>
          <span className="mt-0.5 block text-[11px] text-zinc-500 transition group-hover:text-zinc-400">
            {rating.hint}
          </span>
        </button>
      ))}
    </div>
  );
}
