/* ── Figma frame import pipeline ───────────────────────────── */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/figma/connection";
import { fetchFileStructure, fetchFrameThumbnails } from "@/lib/figma/client";
import { parseFigmaUrl, figmaUrlSchema } from "@/lib/figma/url-parser";
import { FigmaApiError } from "@/lib/figma/types";
import type { FrameInsert } from "@/lib/supabase/types";

const importSchema = z.object({
  figmaUrl: figmaUrlSchema,
  projectId: z.string().uuid("Invalid project ID"),
});

/**
 * POST /api/figma/import
 * Full import pipeline: parse URL → fetch frames → fetch thumbnails →
 * download & re-upload to Supabase Storage → persist frame rows.
 */
export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get user or fallback ID
    const userId = user?.id ?? "00000000-0000-0000-0000-000000000000";

    // Validate request body
    const body = await request.json();
    const parsed = importSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const { figmaUrl, projectId } = parsed.data;

    // Verify project belongs to user (if user is authenticated)
    if (user) {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (projectError || !project) {
        return NextResponse.json(
          { error: "Project not found or access denied." },
          { status: 404 },
        );
      }
    }

    // Parse the Figma URL
    const parsedUrl = parseFigmaUrl(figmaUrl);
    if (!parsedUrl) {
      return NextResponse.json(
        { error: "Invalid Figma URL format." },
        { status: 400 },
      );
    }

    // Get a valid Figma access token (auto-refreshes if needed)
    const accessToken = await getValidAccessToken(userId);

    // Step 1: Fetch file structure
    const { frames, fileName } = await fetchFileStructure(
      accessToken,
      parsedUrl.fileKey,
      parsedUrl.nodeId,
    );

    if (frames.length < 3) {
      return NextResponse.json(
        {
          error: `This file only has ${frames.length} usable frame${frames.length === 1 ? "" : "s"}. You need at least 3 frames to create a meaningful video.`,
        },
        { status: 422 },
      );
    }

    // Update project with file key and name
    await supabase
      .from("projects")
      .update({
        figma_file_key: parsedUrl.fileKey,
        name: fileName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    // Step 2: Fetch thumbnails (temporary S3 URLs)
    const nodeIds = frames.map((f) => f.nodeId);
    const thumbnailUrls = await fetchFrameThumbnails(
      accessToken,
      parsedUrl.fileKey,
      nodeIds,
    );

    // Step 3: Download thumbnails and re-upload to Supabase Storage
    const serviceClient = createServiceClient();
    const storagePaths: Record<string, string> = {};

    const downloadResults = await Promise.allSettled(
      Object.entries(thumbnailUrls).map(async ([nodeId, url]) => {
        const response = await fetch(url);
        if (!response.ok) return;

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const storagePath = `${projectId}/${nodeId.replace(":", "-")}.png`;

        const { error: uploadError } = await serviceClient.storage
          .from("frame-thumbnails")
          .upload(storagePath, buffer, {
            contentType: "image/png",
            upsert: true,
          });

        if (!uploadError) {
          storagePaths[nodeId] = storagePath;
        }
      }),
    );

    // Log any failed downloads (non-critical)
    const failures = downloadResults.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.warn(`${failures.length} thumbnail downloads failed`);
    }

    // Step 4: Delete existing frames for this project (re-import)
    await supabase.from("frames").delete().eq("project_id", projectId);

    // Step 5: Insert frame rows
    const frameInserts: FrameInsert[] = frames.map((frame) => ({
      project_id: projectId,
      figma_node_id: frame.nodeId,
      name: frame.name,
      order_in_flow: frame.orderInFlow,
      thumbnail_storage_path: storagePaths[frame.nodeId] ?? null,
      included: true,
    }));

    const { data: insertedFrames, error: insertError } = await supabase
      .from("frames")
      .insert(frameInserts)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to save frames: ${insertError.message}` },
        { status: 500 },
      );
    }

    // Build public URLs for thumbnails
    const framesWithUrls = (insertedFrames ?? []).map((frame: FrameInsert & { id: string; created_at: string }) => ({
      ...frame,
      thumbnail_url: frame.thumbnail_storage_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/frame-thumbnails/${frame.thumbnail_storage_path}`
        : null,
    }));

    return NextResponse.json({
      frames: framesWithUrls,
      fileName,
      frameCount: frames.length,
    });
  } catch (error) {
    if (error instanceof FigmaApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Import pipeline error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during import.",
      },
      { status: 500 },
    );
  }
}
