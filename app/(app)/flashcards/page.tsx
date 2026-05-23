import AppCard from "@/components/app/AppCard";
import { appText } from "@/components/app/app-typography";
import { flashcardsDue } from "@/lib/mock-data";

export default function FlashcardsPage() {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">Flashcards</h1>
          <p className={`mt-2 ${appText.body}`}>
            Review words from your reading with spaced repetition.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6D7EFF]"
        >
          Start review
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flashcardsDue.map((card) => (
          <AppCard key={card.id} className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-lg font-medium text-white">{card.word}</p>
              <span className={`rounded-full border border-white/[0.12] px-2 py-0.5 ${appText.metaSmall}`}>
                Due {card.due}
              </span>
            </div>
            <p className={`mt-4 text-[13px] italic leading-relaxed ${appText.meta}`}>{card.context}</p>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
