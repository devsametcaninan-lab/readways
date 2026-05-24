import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_PAGES = new Set(["/login", "/signup"]);

export async function proxy(request: NextRequest) {
  const updated = updateSession(request);
  if (updated instanceof NextResponse) {
    return updated;
  }

  const { supabase, response } = updated;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && !AUTH_PAGES.has(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && AUTH_PAGES.has(pathname)) {
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
