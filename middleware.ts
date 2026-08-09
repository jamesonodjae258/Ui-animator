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

  try {
    const supabaseUrl = getValidSupabaseUrl();
    const supabaseAnonKey = getValidSupabaseKey();

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      },
    );

    // Refresh session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      !user &&
      request.nextUrl.pathname.startsWith("/(app)") &&
      process.env.NODE_ENV === "production"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  } catch {
    // Return standard response if auth check fails in dev mode
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
