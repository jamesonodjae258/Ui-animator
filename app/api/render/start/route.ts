/* ── Render Job Start Route ─────────────────────────────────── */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const startRenderSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  sceneGraphId: z.string().uuid("Invalid scene graph ID"),
});

/**
 * POST /api/render/start
 * Queues a new video render job in the render_jobs table.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to render a video." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = startRenderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload." },
        { status: 400 },
      );
    }

    const { projectId, sceneGraphId } = parsed.data;

    // Verify project ownership
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (projError || !project) {
      return NextResponse.json(
        { error: "Project not found or access denied." },
        { status: 404 },
      );
    }

    // Insert new queued job into render_jobs
    const { data: job, error: insertError } = await supabase
      .from("render_jobs")
      .insert({
        project_id: projectId,
        scene_graph_id: sceneGraphId,
        status: "queued",
        output_video_url: null,
        error_message: null,
      })
      .select()
      .single();

    if (insertError || !job) {
      return NextResponse.json(
        { error: `Failed to queue render job: ${insertError?.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
    });
  } catch (error) {
    console.error("Start render API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while queueing render job.",
      },
      { status: 500 },
    );
  }
}
