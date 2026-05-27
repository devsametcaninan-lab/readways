import { NextResponse } from "next/server";
import { sanitizeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileExists } from "@/lib/supabase/profiles";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfileExists(supabase, user);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
