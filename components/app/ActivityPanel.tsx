import Link from "next/link";
import { flashcardsDue, savedWords } from "@/lib/mock-data";
import { appText } from "./app-typography";

export default function ActivityPanel() {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-l border-white/[0.1] bg-[#0e0f14] xl:flex">
      <div className="border-b border-white/[0.1] px-4 py-3">
        <p className={appText.label}>Activity</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className={appText.metaSmall}>Saved words</p>
            <Link href="/saved-words" className={appText.link}>
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {savedWords.slice(0, 4).map((word) => (
              <div
                key={word.id}
                className="rounded-lg border border-white/[0.1] bg-[#12141d] px-3 py-2.5 transition-colors hover:border-white/[0.14] hover:bg-[#141820]"
              >
                <p className={appText.title}>{word.word}</p>
                <p className={`mt-0.5 truncate ${appText.metaSmall}`}>{word.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className={appText.metaSmall}>Flashcards due</p>
            <Link href="/flashcards" className={appText.link}>
              Review
            </Link>
          </div>
          <div className="space-y-2">
            {flashcardsDue.map((card) => (
              <div
                key={card.id}
                className="rounded-lg border border-white/[0.1] bg-[#12141d] px-3 py-2.5 transition-colors hover:border-white/[0.14] hover:bg-[#141820]"
              >
                <div className="flex items-center justify-between">
                  <p className={appText.title}>{card.word}</p>
                  <span className={appText.metaSmall}>Due {card.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.12] bg-[#12141d] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className={appText.metaSmall}>Today&apos;s goal</p>
          <p className="mt-1.5 text-sm font-medium text-zinc-100">18 / 30 words</p>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.1]">
            <div className="h-full w-[60%] rounded-full bg-accent/70" />
          </div>
        </div>
      </div>
    </aside>
  );
}
