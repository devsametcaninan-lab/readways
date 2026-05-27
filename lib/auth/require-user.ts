import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(nextPath?: string): Promise<User> {
  const user = await getSessionUser();

  if (!user) {
    const params = new URLSearchParams();

    if (nextPath) {
      params.set("next", nextPath);
    }

    const query = params.toString();
    redirect(query ? `/login?${query}` : "/login");
  }

  return user;
}
