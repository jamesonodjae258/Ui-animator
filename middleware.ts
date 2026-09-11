/* ── Supabase Auth middleware ──────────────────────────────── */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getValidSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.startsWith("your-") || !url.startsWith("http")) {
    return "https://placeholder.supabase.co";
  }
  return url;
}

function getValidSupabaseKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || key.startsWith("your-")) {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
  }
  return key;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const isProtectedPath =
    pathname.startsWith("/projects") ||
    pathname.startsWith("/settings");

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  try {
    const supabaseUrl = getValidSupabaseUrl();
    const supabaseAnonKey = getValidSupabaseKey();
    const isMockSupabase =
      supabaseUrl.includes("placeholder.supabase.co") ||
      supabaseAnonKey.includes("placeholder");

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh session via getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // In local dev fallback mode without live Supabase configured, bypass redirect
    if (isMockSupabase && process.env.NODE_ENV !== "production") {
      return supabaseResponse;
    }

    // Redirect unauthenticated users visiting protected routes to /login
    if (isProtectedPath && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set(
        "redirect",
        pathname + request.nextUrl.search
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect already authenticated users away from /login or /signup
    if (isAuthPage && user) {
      const redirectUrl = request.nextUrl.clone();
      const destination =
        request.nextUrl.searchParams.get("redirect") || "/projects";
      redirectUrl.pathname = destination;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  } catch (err) {
    console.warn("Middleware auth error:", err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
