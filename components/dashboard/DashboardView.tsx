import Link from "next/link";
import AppCard from "@/components/app/AppCard";
import AppStateInline from "@/components/app/AppStateInline";
import WelcomeOnboarding from "@/components/onboarding/WelcomeOnboarding";
import { appText } from "@/components/app/app-typography";
import DashboardRecentDocuments from "@/components/dashboard/DashboardRecentDocuments";
import UploadPdfButton from "@/components/upload/UploadPdfButton";
import type { DashboardPageData } from "@/lib/dashboard/server";

type DashboardViewProps = {
  data: DashboardPageData;
};

export default function DashboardView({ data }: DashboardViewProps) {
  const { user, dashboard } = data;

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Welcome back</p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight text-white md:text-3xl">
            {user.name}
          </h1>
          <p className={`mt-2 max-w-lg ${appText.body}`}>
            {dashboard.isNewUser
              ? "Upload your first PDF to start building your vocabulary."
              : "Continue reading or upload a new document to grow your vocabulary."}
          </p>
        </div>
        <UploadPdfButton />
      </div>

      <WelcomeOnboarding />

      {dashboard.isNewUser ? (
        <div className="mb-8">
          <AppStateInline
            variant="default"
            title="Your progress starts here"
            description="Upload a PDF, tap words while you read, and save vocabulary. Your stats will appear as you go."
          />
        </div>
      ) : null}

      <section className="mb-8">
        <h2 className={`mb-4 ${appText.label}`}>Reading progress</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboard.progressStats.map((stat) => (
            <AppCard key={stat.label} className="p-4">
              <p className={appText.statLabel}>{stat.label}</p>
              <p className="mt-2 text-2xl font-medium text-white">{stat.value}</p>
              <p className={`mt-1 ${appText.statSub}`}>{stat.sub}</p>
            </AppCard>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className={appText.label}>Recent documents</h2>
          <Link href="/library" className={appText.link}>
            View library
          </Link>
        </div>
        <DashboardRecentDocuments />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className={appText.label}>Saved words</h2>
            <Link href="/saved-words" className={appText.link}>
              View all
            </Link>
          </div>
          <AppCard className="divide-y divide-white/[0.1] p-0">
            {dashboard.savedWordPreviews.length > 0 ? (
              dashboard.savedWordPreviews.map((word) => (
                <div
                  key={word.id}
                  className="px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <p className={appText.title}>{word.word}</p>
                  <p className={`mt-1 ${appText.meta}`}>{word.meaning}</p>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className={`${appText.meta}`}>No saved words yet</p>
                <p className={`mt-1 ${appText.metaSmall}`}>
                  Tap a word in the reader to save it here.
                </p>
              </div>
            )}
          </AppCard>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className={appText.label}>Flashcards due</h2>
            <Link href="/flashcards" className={appText.link}>
              Start review
            </Link>
          </div>
          <AppCard className="divide-y divide-white/[0.1] p-0">
            {dashboard.dueFlashcardPreviews.length > 0 ? (
              dashboard.dueFlashcardPreviews.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 pr-3">
                    <p className={appText.title}>{card.word}</p>
                    <p className={`mt-1 truncate ${appText.metaSmall}`}>{card.context}</p>
                  </div>
                  <span className={`shrink-0 ${appText.metaSmall}`}>Due {card.dueLabel}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className={appText.meta}>
                  {dashboard.stats.flashcardsDueCount === 0 &&
                  dashboard.stats.flashcardsCount > 0
                    ? "No cards due right now"
                    : "No flashcards yet"}
                </p>
                <p className={`mt-1 ${appText.metaSmall}`}>
                  {dashboard.stats.flashcardsCount > 0
                    ? "You're caught up — check back later."
                    : "Saved words become flashcards automatically."}
                </p>
              </div>
            )}
          </AppCard>
        </section>
      </div>
    </div>
  );
}
