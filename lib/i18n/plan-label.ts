import type { Plan } from "@/lib/supabase/schema";

type Translate = (key: string) => string;

export function localizedPlanName(plan: Plan | string, t: Translate): string {
  switch (plan) {
    case "admin":
      return t("settings.planAdmin");
    case "pro_monthly":
      return t("settings.planProMonthly");
    case "pro_yearly":
      return t("settings.planProYearly");
    case "pro":
      return t("settings.planPro");
    case "free":
      return t("settings.planFree");
    default:
      return t("settings.planPersonal");
  }
}
