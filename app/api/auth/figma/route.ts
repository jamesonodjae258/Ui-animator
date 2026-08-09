/* ── Figma OAuth initiation ────────────────────────────────── */

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateAuthUrl } from "@/lib/figma/auth";

/**
 * GET /api/auth/figma
 * Generates a CSRF state token, stores it in an HTTP-only cookie,
 * and redirects the user to Figma's OAuth consent page.
 */
export async function GET(request: Request) {
  try {
    // Generate cryptographically random state for CSRF protection
    const state = randomBytes(32).toString("hex");

    // Store the state in a short-lived HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("figma_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    // Also store the return URL so we can redirect back after callback
    const returnUrl = new URL(request.url).searchParams.get("returnUrl") ?? "/";
    cookieStore.set("figma_oauth_return", returnUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    const authUrl = generateAuthUrl(state);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Figma OAuth initiation error:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to initiate Figma connection", details },
      { status: 500 },
    );
  }
}
