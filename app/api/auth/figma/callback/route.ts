/* ── Figma OAuth callback ─────────────────────────────────── */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, fetchFigmaUser } from "@/lib/figma/auth";
import { saveFigmaConnection } from "@/lib/figma/connection";

/**
 * GET /api/auth/figma/callback
 * Figma redirects here after the user authorizes (or denies) access.
 * Verifies CSRF state, exchanges the code for tokens, fetches user info,
 * and stores the encrypted connection in the database.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("figma_oauth_state")?.value;
  const returnUrl = cookieStore.get("figma_oauth_return")?.value ?? "/";

  // Clean up OAuth cookies
  cookieStore.delete("figma_oauth_state");
  cookieStore.delete("figma_oauth_return");

  // Handle user denial
  if (error) {
    const errorUrl = new URL(returnUrl, url.origin);
    errorUrl.searchParams.set("figma_error", "access_denied");
    return NextResponse.redirect(errorUrl);
  }

  // Validate required params
  if (!code || !state) {
    const errorUrl = new URL(returnUrl, url.origin);
    errorUrl.searchParams.set("figma_error", "missing_params");
    return NextResponse.redirect(errorUrl);
  }

  // CSRF verification
  if (state !== storedState) {
    const errorUrl = new URL(returnUrl, url.origin);
    errorUrl.searchParams.set("figma_error", "invalid_state");
    return NextResponse.redirect(errorUrl);
  }

  try {
    // Get current Supabase user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Use logged in user ID, or fallback dev user ID if unauthenticated in local dev
    const userId = user?.id ?? "00000000-0000-0000-0000-000000000000";

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Fetch Figma user profile
    const figmaUser = await fetchFigmaUser(tokens.access_token);

    // Save encrypted connection to DB using service client
    await saveFigmaConnection(
      userId,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in,
      figmaUser.handle,
      figmaUser.email,
    );

    // Redirect back to the import page with success indicator
    const successUrl = new URL(returnUrl, url.origin);
    successUrl.searchParams.set("figma_connected", "true");
    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error("Figma OAuth callback error:", err);
    const details = err instanceof Error ? err.message : String(err);
    const errorUrl = new URL(returnUrl, url.origin);
    errorUrl.searchParams.set("figma_error", "token_exchange_failed");
    errorUrl.searchParams.set("details", encodeURIComponent(details));
    return NextResponse.redirect(errorUrl);
  }
}
