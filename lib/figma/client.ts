/* ── Figma REST API client ─────────────────────────────────── */

import type { FigmaFrame } from "./types";
import { FigmaApiError } from "./types";

const FIGMA_API_BASE = "https://api.figma.com/v1";
const THUMBNAIL_BATCH_SIZE = 50;

/* ── Helpers ─────────────────────────────────────────────── */

async function figmaGet<T>(
  accessToken: string,
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${FIGMA_API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 403) {
    throw new FigmaApiError(
      "You don't have access to this Figma file. Make sure the file is shared with your connected Figma account.",
      403,
    );
  }

  if (response.status === 404) {
    throw new FigmaApiError(
      "Figma file not found. Please check the link and try again.",
      404,
    );
  }

  if (response.status === 429) {
    throw new FigmaApiError(
      "Figma API rate limit reached. Please wait a moment and try again.",
      429,
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new FigmaApiError(
      `Figma API error (${response.status})`,
      response.status,
      text,
    );
  }

  return response.json() as Promise<T>;
}

/* ── Figma file node types (partial, what we need) ───────── */

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // Prototype transition data (if present)
  transitionNodeID?: string;
  reactions?: Array<{
    action?: {
      type: string;
      destinationId?: string;
      navigation?: string;
    };
  }>;
}

interface FigmaFileResponse {
  document: FigmaNode;
  name: string;
}

interface FigmaImagesResponse {
  err: string | null;
  images: Record<string, string | null>;
}

/* ── Public API ──────────────────────────────────────────── */

/**
 * Fetch top-level frames from a Figma file.
 * Uses depth=2 to get the canvas children (frames) without deep nesting.
 * Orders by prototype flow connections, falling back to x-position.
 */
export async function fetchFileStructure(
  accessToken: string,
  fileKey: string,
  nodeId?: string,
): Promise<{ frames: FigmaFrame[]; fileName: string }> {
  const file = await figmaGet<FigmaFileResponse>(
    accessToken,
    `/files/${fileKey}`,
    { depth: "2" },
  );

  // Find the first page/canvas
  const pages = file.document.children ?? [];
  if (pages.length === 0) {
    throw new FigmaApiError("This Figma file has no pages.", 422);
  }

  // Use the first page by default
  const page = pages[0];
  const allChildren = page.children ?? [];

  // Filter to only FRAME type nodes (skip components, groups, icons, etc.)
  let frameNodes = allChildren.filter((node) => node.type === "FRAME");

  // If a specific nodeId was provided, try to scope to that frame's flow
  if (nodeId) {
    const targetFrame = frameNodes.find((f) => f.id === nodeId);
    if (targetFrame) {
      // Start from this frame and follow prototype connections
      const flowOrder = buildPrototypeFlow(targetFrame, frameNodes);
      if (flowOrder.length > 0) {
        frameNodes = flowOrder;
      } else {
        // No flow connections — just use the target frame and siblings sorted by position
        frameNodes = [targetFrame, ...frameNodes.filter((f) => f.id !== nodeId)];
      }
    }
  }

  if (frameNodes.length === 0) {
    throw new FigmaApiError(
      "No usable frames found in this file. The file needs at least one top-level frame.",
      422,
    );
  }

  // Try to order by prototype flow, fall back to x-position
  const ordered = orderFrames(frameNodes);

  const frames: FigmaFrame[] = ordered.map((node, index) => ({
    nodeId: node.id,
    name: node.name,
    orderInFlow: index,
  }));

  return { frames, fileName: file.name };
}

/**
 * Fetch thumbnail URLs for a set of frame node IDs.
 * Batches in groups of 50 to stay within Figma rate limits.
 */
export async function fetchFrameThumbnails(
  accessToken: string,
  fileKey: string,
  nodeIds: string[],
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Process in batches
  for (let i = 0; i < nodeIds.length; i += THUMBNAIL_BATCH_SIZE) {
    const batch = nodeIds.slice(i, i + THUMBNAIL_BATCH_SIZE);
    const ids = batch.join(",");

    const data = await figmaGet<FigmaImagesResponse>(
      accessToken,
      `/images/${fileKey}`,
      { ids, format: "png", scale: "2" },
    );

    if (data.err) {
      throw new FigmaApiError(
        `Failed to generate thumbnails: ${data.err}`,
        500,
        data.err,
      );
    }

    for (const [nodeId, url] of Object.entries(data.images)) {
      if (url) {
        result[nodeId] = url;
      }
    }
  }

  return result;
}

/* ── Prototype flow ordering ─────────────────────────────── */

/**
 * Build a prototype flow starting from a given frame by following
 * transition/reaction connections.
 */
function buildPrototypeFlow(
  startFrame: FigmaNode,
  allFrames: FigmaNode[],
): FigmaNode[] {
  const frameMap = new Map(allFrames.map((f) => [f.id, f]));
  const visited = new Set<string>();
  const flow: FigmaNode[] = [];

  let current: FigmaNode | undefined = startFrame;

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    flow.push(current);

    // Look for a prototype transition to another frame
    const nextId = getTransitionTarget(current);
    current = nextId ? frameMap.get(nextId) : undefined;
  }

  return flow;
}

/**
 * Extract the transition target node ID from a frame's reactions.
 */
function getTransitionTarget(node: FigmaNode): string | null {
  if (node.transitionNodeID) {
    return node.transitionNodeID;
  }

  if (node.reactions) {
    for (const reaction of node.reactions) {
      if (reaction.action?.destinationId) {
        return reaction.action.destinationId;
      }
    }
  }

  return null;
}

/**
 * Order frames by prototype flow graph. If no prototype flow exists
 * (no transitions found), fall back to canvas x-position (left to right).
 */
function orderFrames(frames: FigmaNode[]): FigmaNode[] {
  // Build adjacency: which frame leads to which
  const hasTransitions = frames.some((f) => getTransitionTarget(f) !== null);

  if (!hasTransitions) {
    // No prototype flow — sort by x-position (left to right)
    return [...frames].sort((a, b) => {
      const ax = a.absoluteBoundingBox?.x ?? 0;
      const bx = b.absoluteBoundingBox?.x ?? 0;
      return ax - bx;
    });
  }

  // Build the flow graph and find a starting node (one with no inbound edges)
  const targetIds = new Set<string>();
  for (const frame of frames) {
    const target = getTransitionTarget(frame);
    if (target) targetIds.add(target);
  }

  // Start from a frame that isn't a transition target (i.e., has no inbound edge)
  const startFrame =
    frames.find((f) => !targetIds.has(f.id)) ?? frames[0];

  const flow = buildPrototypeFlow(startFrame, frames);

  // Add any frames not reached by the flow (orphans), sorted by x-position
  const flowIds = new Set(flow.map((f) => f.id));
  const orphans = frames
    .filter((f) => !flowIds.has(f.id))
    .sort((a, b) => {
      const ax = a.absoluteBoundingBox?.x ?? 0;
      const bx = b.absoluteBoundingBox?.x ?? 0;
      return ax - bx;
    });

  return [...flow, ...orphans];
}
