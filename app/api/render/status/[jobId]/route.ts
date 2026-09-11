/* ── Render Job Status Route ────────────────────────────────── */

import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { localStore } from "@/lib/local-store";

/**
 * GET /api/render/status/[jobId]
 * Fetches current render job status, output URL, or error.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { jobId } = await params;

    let job = null;
    try {
      const clientToUse = user ? supabase : createServiceClient();
      const { data, error } = await clientToUse
        .from("render_jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();

      if (!error && data) {
        job = data;
      }
    } catch {}

    if (!job) {
      job = localStore.getRenderJob(jobId);
    }

    if (!job) {
      return NextResponse.json({ error: "Render job not found." }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Render status API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch render job status." },
      { status: 500 },
    );
  }
}
