import { NextResponse, type NextRequest } from "next/server";
import {
  isAuthPagePath,
  isProtectedAppPath,
  sanitizeNextPath
} from "@/lib/auth/paths";
import { updateSession } from "@/lib/supabase/middleware";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!hasSupabaseEnv()) {
    if (isProtectedAppPath(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next({ request });
  }

  const updated = updateSession(request);
  if (updated instanceof NextResponse) {
    return updated;
  }

  const { supabase, response } = updated;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user && isProtectedAppPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", sanitizeNextPath(pathname));
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPagePath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/library/:path*",
    "/reader",
    "/reader/:path*",
    "/saved-words/:path*",
    "/flashcards/:path*",
    "/settings/:path*",
    "/login",
    "/signup"
  ]
};
