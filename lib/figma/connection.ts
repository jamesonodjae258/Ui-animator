/* ── Figma connection CRUD + auto-refresh ──────────────────── */

import { createClient as createServerClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "./encryption";
import { refreshAccessToken } from "./auth";
import type { FigmaConnection } from "./types";
import { FigmaApiError } from "./types";

/** Margin before expiry to trigger a refresh (5 minutes). */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

/**
 * Save (upsert) a Figma connection for a user.
 * Tokens are encrypted before storage.
 */
export async function saveFigmaConnection(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  figmaUserName: string | null,
  figmaUserEmail: string | null,
): Promise<void> {
  const supabase = await createServerClient();

  const encAccess = encrypt(accessToken);
  const encRefresh = encrypt(refreshToken);
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { error } = await supabase.from("figma_connections").upsert(
    {
      user_id: userId,
      encrypted_access_token: encAccess.ciphertext,
      token_iv: encAccess.iv,
      encrypted_refresh_token: encRefresh.ciphertext,
      refresh_iv: encRefresh.iv,
      expires_at: expiresAt,
      figma_user_name: figmaUserName,
      figma_user_email: figmaUserEmail,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(`Failed to save Figma connection: ${error.message}`);
  }
}

/**
 * Get the user's Figma connection, decrypting tokens.
 * Returns null if no connection exists.
 */
export async function getFigmaConnection(
  userId: string,
): Promise<FigmaConnection | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("figma_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read Figma connection: ${error.message}`);
  }

  if (!data) return null;

  return {
    userId: data.user_id,
    accessToken: decrypt(data.encrypted_access_token, data.token_iv),
    refreshToken: decrypt(data.encrypted_refresh_token, data.refresh_iv),
    expiresAt: new Date(data.expires_at),
    figmaUserName: data.figma_user_name,
    figmaUserEmail: data.figma_user_email,
  };
}

/**
 * Delete a user's Figma connection.
 */
export async function deleteFigmaConnection(
  userId: string,
): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("figma_connections")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete Figma connection: ${error.message}`);
  }
}

/**
 * Get a valid (non-expired) access token for the user.
 * Automatically refreshes if the token is expired or about to expire.
 * Throws if no connection exists or refresh fails.
 */
export async function getValidAccessToken(
  userId: string,
): Promise<string> {
  const connection = await getFigmaConnection(userId);

  if (!connection) {
    const pat = process.env.FIGMA_PAT || process.env.FIGMA_PERSONAL_ACCESS_TOKEN;
    if (pat && !pat.startsWith("your-")) {
      return pat.trim();
    }
    throw new FigmaApiError(
      "No Figma account connected. Please connect your Figma account first.",
      401,
    );
  }

  const now = Date.now();
  const expiresAt = connection.expiresAt.getTime();

  // Token is still valid — return as-is
  if (expiresAt - now > REFRESH_MARGIN_MS) {
    return connection.accessToken;
  }

  // Token expired or about to expire — refresh it
  try {
    const newTokens = await refreshAccessToken(connection.refreshToken);

    await saveFigmaConnection(
      userId,
      newTokens.access_token,
      newTokens.refresh_token,
      newTokens.expires_in,
      connection.figmaUserName,
      connection.figmaUserEmail,
    );

    return newTokens.access_token;
  } catch (err) {
    // Refresh failed — connection is stale, user needs to reconnect
    await deleteFigmaConnection(userId);
    throw new FigmaApiError(
      "Your Figma connection has expired. Please reconnect your Figma account.",
      401,
      err instanceof Error ? err.message : String(err),
    );
  }
}
