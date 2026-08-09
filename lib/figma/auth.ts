/* ── Figma OAuth helpers ───────────────────────────────────── */

import type { FigmaTokenResponse, FigmaUser } from "./types";
import { FigmaApiError } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value.startsWith("your-")) {
    throw new Error(`Missing or placeholder env var: ${name}`);
  }
  return value;
}

function getRedirectUri(): string {
  const explicit = process.env.FIGMA_REDIRECT_URI?.trim();
  if (explicit && !explicit.startsWith("your-")) {
    return explicit;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/figma/callback`;
  }
  return "http://localhost:3000/api/auth/figma/callback";
}

/**
 * Build the Figma OAuth authorization URL.
 * The `state` param should be a cryptographically random string stored
 * in a cookie for CSRF verification on callback.
 */
export function generateAuthUrl(state: string): string {
  const clientId = requireEnv("FIGMA_CLIENT_ID");
  const redirectUri = getRedirectUri();
  const scope = process.env.FIGMA_OAUTH_SCOPE?.trim() || "file_content:read,file_metadata:read,current_user:read";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope,
  });

  return `https://www.figma.com/oauth?${params.toString()}`;
}

/**
 * Exchange an authorization code for access + refresh tokens.
 */
export async function exchangeCodeForTokens(
  code: string,
): Promise<FigmaTokenResponse> {
  const clientId = requireEnv("FIGMA_CLIENT_ID");
  const clientSecret = requireEnv("FIGMA_CLIENT_SECRET");
  const redirectUri = getRedirectUri();

  const response = await fetch("https://www.figma.com/api/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new FigmaApiError(
      "Failed to exchange Figma authorization code for tokens",
      response.status,
      text,
    );
  }

  return response.json() as Promise<FigmaTokenResponse>;
}

/**
 * Use a refresh token to get a new access token.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<FigmaTokenResponse> {
  const clientId = requireEnv("FIGMA_CLIENT_ID");
  const clientSecret = requireEnv("FIGMA_CLIENT_SECRET");

  const response = await fetch("https://www.figma.com/api/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new FigmaApiError(
      "Failed to refresh Figma access token",
      response.status,
      text,
    );
  }

  return response.json() as Promise<FigmaTokenResponse>;
}

/**
 * Fetch the currently authenticated Figma user's profile.
 */
export async function fetchFigmaUser(
  accessToken: string,
): Promise<FigmaUser> {
  const response = await fetch("https://api.figma.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new FigmaApiError(
      "Failed to fetch Figma user profile",
      response.status,
    );
  }

  return response.json() as Promise<FigmaUser>;
}
