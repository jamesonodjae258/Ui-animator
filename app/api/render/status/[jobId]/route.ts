/* ── Render Job Status Route ────────────────────────────────── */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;

    const { data: job, error } = await supabase
      .from("render_jobs")
      .select("*")
      .eq("id", jobId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
