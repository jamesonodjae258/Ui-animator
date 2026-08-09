/* ── Shared Figma types ─────────────────────────────────────── */

/** Raw token response from Figma's OAuth token endpoint. */
export interface FigmaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/** A decrypted, ready-to-use Figma connection. */
export interface FigmaConnection {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  figmaUserName: string | null;
  figmaUserEmail: string | null;
}

/** A top-level frame extracted from a Figma file. */
export interface FigmaFrame {
  nodeId: string;
  name: string;
  orderInFlow: number;
}

/** Figma user info from GET /v1/me. */
export interface FigmaUser {
  id: string;
  handle: string;
  email: string;
  img_url: string;
}

/** Typed error for Figma API failures. */
export class FigmaApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly figmaError?: string,
  ) {
    super(message);
    this.name = "FigmaApiError";
  }
}

/** Typed error for Figma URL parsing failures. */
export class FigmaUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FigmaUrlError";
  }
}
