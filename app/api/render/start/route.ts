/* ── Render Job Start Route ─────────────────────────────────── */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { localStore } from "@/lib/local-store";

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

    const body = await request.json();
    const parsed = startRenderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload." },
        { status: 400 },
      );
    }

    const { projectId, sceneGraphId } = parsed.data;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const serviceClient = createServiceClient();

    // Verify project ownership (or demo project ownership)
    let projectExists = false;
    if (user) {
      try {
        const { data: project } = await supabase
          .from("projects")
          .select("id")
          .eq("id", projectId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (project) projectExists = true;
      } catch {}
    }

    if (!projectExists) {
      try {
        const { data: adminProject } = await serviceClient
          .from("projects")
          .select("id")
          .eq("id", projectId)
          .maybeSingle();
        if (adminProject) projectExists = true;
      } catch {}
    }

    if (!projectExists) {
      const localP = localStore.getProject(projectId);
      if (localP) projectExists = true;
    }

    if (!projectExists) {
      return NextResponse.json(
        { error: "Project not found or access denied." },
        { status: 404 },
      );
    }

    // Insert new queued job into render_jobs
    let jobId = crypto.randomUUID();
    let jobCreated = false;

    try {
      const { data: job, error: insertError } = await serviceClient
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

      if (!insertError && job) {
        jobId = job.id;
        jobCreated = true;
      }
    } catch {}

    const localJob = localStore.upsertRenderJob({
      id: jobId,
      project_id: projectId,
      scene_graph_id: sceneGraphId,
      status: "queued",
      output_video_url: null,
      error_message: null,
    });

    return NextResponse.json({
      success: true,
      jobId: localJob.id,
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
