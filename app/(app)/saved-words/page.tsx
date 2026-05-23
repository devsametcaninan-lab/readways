import AppCard from "@/components/app/AppCard";
import { appText } from "@/components/app/app-typography";
import { savedWords } from "@/lib/mock-data";

export default function SavedWordsPage() {
  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">Saved Words</h1>
        <p className={`mt-2 ${appText.body}`}>
          Vocabulary saved from your reading, with context and meanings.
        </p>
      </div>

      <AppCard className="divide-y divide-white/[0.1] p-0">
        {savedWords.map((word) => (
          <div key={word.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={appText.titleLg}>{word.word}</p>
              <p className={`mt-1 ${appText.meta}`}>{word.meaning}</p>
            </div>
            <p className={appText.metaSmall}>{word.source}</p>
          </div>
        ))}
      </AppCard>
    </div>
  );
}
