type Rating = "hard" | "good" | "easy";

type RatingButtonsProps = {
  onRate: (rating: Rating) => void;
};

const ratings: { value: Rating; label: string; hint: string }[] = [
  { value: "hard", label: "Hard", hint: "Soon" },
  { value: "good", label: "Good", hint: "Standard" },
  { value: "easy", label: "Easy", hint: "Later" }
];

export default function RatingButtons({ onRate }: RatingButtonsProps) {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      {ratings.map((rating) => (
        <button
          key={rating.value}
          type="button"
          onClick={() => onRate(rating.value)}
          className="group min-w-[7.5rem] rounded-lg border border-white/[0.12] bg-[#12141d] px-5 py-3 text-center transition hover:border-white/[0.18] hover:bg-[#141820] hover:shadow-[0_0_24px_rgba(124,140,255,0.12)]"
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
