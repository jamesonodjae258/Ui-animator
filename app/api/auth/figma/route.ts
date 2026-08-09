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

    const returnUrl = new URL(request.url).searchParams.get("returnUrl") ?? "/";
    const authUrl = generateAuthUrl(state);

    const response = NextResponse.redirect(authUrl);

    response.cookies.set("figma_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    response.cookies.set("figma_oauth_return", returnUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Figma OAuth initiation error:", error);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to initiate Figma connection", details },
      { status: 500 },
    );
  }
}
