/* ── Remotion Background Render Worker ──────────────────────── */

import fs from "fs";
import path from "path";
import os from "os";
import dotenv from "dotenv";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { ShotPlan } from "@/lib/shot-planner/types";
import type { RemotionShot, RemotionCompositionProps } from "@/remotion/types";

// Load .env.local if present
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || SUPABASE_URL.startsWith("your-")) {
  console.error("❌ Worker Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const FPS = 30;
const POLL_INTERVAL_MS = 3000;
const STALE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

let cachedBundleLocation: string | null = null;

async function getBundleLocation(): Promise<string> {
  if (cachedBundleLocation && fs.existsSync(cachedBundleLocation)) {
    return cachedBundleLocation;
  }

  console.log("🔨 Bundling Remotion project entry point...");
  const entryPoint = path.join(process.cwd(), "remotion", "Root.tsx");
  
  if (!fs.existsSync(entryPoint)) {
    throw new Error(`Remotion entry point not found at ${entryPoint}`);
  }

  cachedBundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  console.log(`✅ Bundled successfully: ${cachedBundleLocation}`);
  return cachedBundleLocation;
}

async function processNextJob() {
  try {
    // 1. Clean up stale jobs stuck in 'rendering' for > 10 mins
    const tenMinsAgo = new Date(Date.now() - STALE_TIMEOUT_MS).toISOString();
    await supabase
      .from("render_jobs")
      .update({
        status: "failed",
        error_message: "Render job timed out (worker lost contact or exceeded limit).",
        updated_at: new Date().toISOString(),
      })
      .eq("status", "rendering")
      .lt("updated_at", tenMinsAgo);

    // 2. Poll for queued job
    const { data: job, error: pollError } = await supabase
      .from("render_jobs")
      .select("*")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (pollError) {
      console.error("Error polling render_jobs:", pollError.message);
      return;
    }

    if (!job) {
      return; // No queued jobs
    }

    console.log(`\n🎬 Found queued render job: ${job.id} (Project: ${job.project_id})`);

    // 3. Mark job as rendering
    await supabase
      .from("render_jobs")
      .update({
        status: "rendering",
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    // 4. Fetch scene graph data
    const { data: sceneGraph, error: sgError } = await supabase
      .from("scene_graphs")
      .select("*")
      .eq("id", job.scene_graph_id)
      .single();

    if (sgError || !sceneGraph) {
      throw new Error(`Scene graph not found: ${sgError?.message}`);
    }

    // 5. Fetch project data
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", job.project_id)
      .single();

    const stylePreset = project?.style_preset ?? sceneGraph.style_preset ?? "clean_saas";

    // 6. Fetch frames data to resolve names and thumbnails
    const { data: frames } = await supabase
      .from("frames")
      .select("*")
      .eq("project_id", job.project_id);

    const frameMap = new Map(frames?.map((f) => [f.id, f]) ?? []);

    // 7. Resolve thumbnails to Base64 data URLs for Remotion rendering
    const rawShots = (sceneGraph.shots ?? []) as ShotPlan[];
    const remotionShots: RemotionShot[] = [];

    for (let idx = 0; idx < rawShots.length; idx++) {
      const shot = rawShots[idx];
      const frame = frameMap.get(shot.frame_id);
      const frameName = frame?.name ?? `Shot ${idx + 1}`;
      let imageUrl = "https://placehold.co/1920x1080/141414/f5f5f5?text=Frame";

      if (frame?.thumbnail_storage_path) {
        try {
          const { data: fileBlob, error: dlErr } = await supabase.storage
            .from("frame-thumbnails")
            .download(frame.thumbnail_storage_path);

          if (!dlErr && fileBlob) {
            const buf = Buffer.from(await fileBlob.arrayBuffer());
            imageUrl = `data:image/png;base64,${buf.toString("base64")}`;
          }
        } catch (err) {
          console.warn(`Could not load thumbnail for frame ${shot.frame_id}:`, err);
        }
      }

      const durationInFrames = Math.max(1, Math.round((shot.duration_ms / 1000) * FPS));

      remotionShots.push({
        shotId: shot.shot_id || `s${idx + 1}`,
        frameId: shot.frame_id,
        frameName,
        imageUrl,
        narrativeBeat: shot.narrative_beat,
        cameraMove: shot.camera_move,
        durationInFrames,
        caption: shot.caption,
        transitionIn: shot.transition_in,
      });
    }

    const totalDurationInFrames = remotionShots.reduce(
      (sum, s) => sum + s.durationInFrames,
      0,
    );

    const inputProps: RemotionCompositionProps = {
      shots: remotionShots,
      stylePreset,
      fps: FPS,
      totalDurationInFrames,
    };

    // 8. Bundle & Render Video using Remotion
    const serveUrl = await getBundleLocation();

    console.log(`🎥 Selecting composition "UIAnimatorVideo"...`);
    const composition = await selectComposition({
      serveUrl,
      id: "UIAnimatorVideo",
      inputProps,
    });

    const tempDir = os.tmpdir();
    const tempOutputPath = path.join(tempDir, `uianimator-render-${job.id}.mp4`);

    console.log(`🚀 Rendering ${remotionShots.length} shots (${(totalDurationInFrames / FPS).toFixed(1)}s) to MP4...`);
    const startTime = Date.now();

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: tempOutputPath,
      inputProps,
    });

    const renderTimeMs = Date.now() - startTime;
    console.log(`✨ Render complete in ${(renderTimeMs / 1000).toFixed(1)}s!`);

    // 9. Upload output MP4 to Supabase Storage
    const videoBuffer = fs.readFileSync(tempOutputPath);
    const storagePath = `${job.project_id}/${job.id}.mp4`;

    console.log(`☁️ Uploading rendered MP4 to Supabase Storage bucket "rendered-videos"...`);
    const { error: uploadError } = await supabase.storage
      .from("rendered-videos")
      .upload(storagePath, videoBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload rendered video to storage: ${uploadError.message}`);
    }

    // Clean up temporary local file
    try {
      fs.unlinkSync(tempOutputPath);
    } catch {
      // Ignore
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/rendered-videos/${storagePath}`;

    // 10. Update job status to complete
    await supabase
      .from("render_jobs")
      .update({
        status: "complete",
        output_video_url: publicUrl,
        error_message: null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    console.log(`🎉 Job ${job.id} COMPLETED successfully! Output URL: ${publicUrl}\n`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Render job execution failed:", errorMsg);
  }
}

async function startWorker() {
  console.log("==================================================");
  console.log("  UI Animator Remotion Render Worker Started");
  console.log(`  Supabase URL: ${SUPABASE_URL}`);
  console.log("  Polling for queued jobs every 3 seconds...");
  console.log("==================================================\n");

  while (true) {
    await processNextJob();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

startWorker().catch((err) => {
  console.error("Worker fatal crash:", err);
  process.exit(1);
});
