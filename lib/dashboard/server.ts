import { createClient } from "@/lib/supabase/server";
import { DEFAULT_UI_LOCALE } from "@/lib/i18n/constants";
import { getServerT } from "@/lib/i18n/server";
import { fetchUserDisplay } from "@/lib/profile/display";
import { fetchDashboardData } from "./queries";
import { formatDueLabel } from "@/lib/flashcards/format-due";
import { buildDashboardProgressStats } from "./stats-display";
import type { DashboardData } from "./types";
import type { UserDisplay } from "@/lib/profile/display";

export type DashboardPageData = {
  user: UserDisplay;
  dashboard: DashboardData;
};

export async function getDashboardPageData(): Promise<DashboardPageData | null> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [userDisplay, dashboard] = await Promise.all([
    fetchUserDisplay(supabase),
    fetchDashboardData(supabase, user.id)
  ]);

  if (!userDisplay) {
    return null;
  }

  const t = getServerT();

  return {
    user: userDisplay,
    dashboard: {
      ...dashboard,
      progressStats: buildDashboardProgressStats(dashboard.stats, t),
      savedWordPreviews: dashboard.savedWordPreviews.map((word) => ({
        ...word,
        meaning:
          word.meaning === "No definition yet"
            ? t("app.dashboardNoDefinitionYet")
            : word.meaning
      })),
      dueFlashcardPreviews: dashboard.dueFlashcardPreviews.map((card) => ({
        ...card,
        dueLabel: formatDueLabel(card.nextReviewAt, t, DEFAULT_UI_LOCALE),
        context:
          card.context === "From your reading"
            ? t("app.dashboardFromYourReading")
            : card.context
      }))
    }
  };
}
