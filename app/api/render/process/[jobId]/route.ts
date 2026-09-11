/* ── Manual / Dev Process Render Route ────────────────────────── */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { localStore } from "@/lib/local-store";

/**
 * POST /api/render/process/[jobId]
 * Allows processing a queued render job immediately (especially useful in dev
 * or testing environments when the background CLI worker isn't running).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const serviceClient = createServiceClient();

    // 1. Fetch job
    let job = null;
    try {
      const { data, error: jobError } = await serviceClient
        .from("render_jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (!jobError && data) {
        job = data;
      }
    } catch {}

    if (!job) {
      job = localStore.getRenderJob(jobId);
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // 2. Mark as complete with simulated / rendered output
    const demoVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    const nowIso = new Date().toISOString();

    try {
      await serviceClient
        .from("render_jobs")
        .update({
          status: "complete",
          output_video_url: demoVideoUrl,
          error_message: null,
          completed_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", jobId);
    } catch {}

    localStore.upsertRenderJob({
      id: jobId,
      project_id: job.project_id,
      scene_graph_id: job.scene_graph_id,
      status: "complete",
      output_video_url: demoVideoUrl,
      error_message: null,
      completed_at: nowIso,
    });

    return NextResponse.json({ success: true, jobId, status: "complete", output_video_url: demoVideoUrl });
  } catch (err) {
    console.error("Process render error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process render job" },
      { status: 500 },
    );
  }
}
