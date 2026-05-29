import Link from "next/link";
import { isAdminUser } from "@/lib/auth/require-admin";
import { requireUser } from "@/lib/auth/require-user";
import { getServerT } from "@/lib/i18n/server";

export default async function AdminAiUsageLink() {
  const user = await requireUser();

  if (!(await isAdminUser(user.id))) {
    return null;
  }

  const t = getServerT();

  return (
    <p className="mt-6 text-center text-sm text-slate-500">
      <Link
        href="/admin/ai-usage"
        className="text-slate-400 underline-offset-2 hover:text-slate-300 hover:underline"
      >
        {t("settings.adminAiUsageLink")}
      </Link>
    </p>
  );
}
