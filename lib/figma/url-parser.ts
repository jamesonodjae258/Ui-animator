/* ── Figma URL parser ──────────────────────────────────────── */

import { z } from "zod";

/**
 * Result of parsing a Figma URL.
 */
export interface ParsedFigmaUrl {
  fileKey: string;
  nodeId: string | undefined;
}

/**
 * Regex that matches both modern (figma.com/design/) and legacy (figma.com/file/) URLs.
 *
 * Examples:
 *   https://www.figma.com/design/AbCdEfGhIjKlMn/My-File?node-id=12-34
 *   https://www.figma.com/file/AbCdEfGhIjKlMn/My-File
 *   https://figma.com/design/AbCdEfGhIjKlMn
 */
const FIGMA_URL_REGEX =
  /^https?:\/\/(?:www\.)?figma\.com\/(?:design|file)\/([a-zA-Z0-9]+)(?:\/[^?]*)?(?:\?.*)?$/;

const NODE_ID_REGEX = /[?&]node-id=([^&]+)/;

/**
 * Zod schema for validating that a string is a Figma URL.
 */
export const figmaUrlSchema = z
  .string()
  .min(1, "Please paste a Figma link")
  .url("That doesn't look like a valid URL")
  .refine(
    (url) => FIGMA_URL_REGEX.test(url),
    "Please paste a valid Figma file or design URL (e.g. figma.com/design/...)",
  );

/**
 * Parse a Figma URL and extract the file key + optional node ID.
 * Returns null for malformed URLs — use `figmaUrlSchema` for validation with error messages.
 */
export function parseFigmaUrl(url: string): ParsedFigmaUrl | null {
  const match = url.match(FIGMA_URL_REGEX);
  if (!match) return null;

  const fileKey = match[1];

  // Extract node-id query param if present
  let nodeId: string | undefined;
  const nodeMatch = url.match(NODE_ID_REGEX);
  if (nodeMatch) {
    // Figma URL-encodes the colon as %3A or uses a dash; normalize to colon
    nodeId = decodeURIComponent(nodeMatch[1]).replace("-", ":");
  }

  return { fileKey, nodeId };
}
