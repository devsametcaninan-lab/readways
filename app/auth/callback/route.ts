import * as Sentry from "@sentry/nextjs";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPostAuthRedirectOrigin } from "@/lib/auth/oauth";
import { sanitizeNextPath } from "@/lib/auth/paths";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import { ensureProfileExists } from "@/lib/supabase/profiles";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const origin = getPostAuthRedirectOrigin(requestUrl.origin);

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const redirectUrl = new URL(next, origin);
  const response = NextResponse.redirect(redirectUrl);

  const { url, anonKey } = requireSupabaseEnv();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    Sentry.captureMessage("Auth callback exchange failed", {
      level: "warning",
      tags: { area: "auth", endpoint: "auth-callback" }
    });

    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "auth_callback_failed");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfileExists(supabase, user);
  }

  return response;
}
