/* ── Project update API ────────────────────────────────────── */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/projects/[projectId]
 * Update project metadata (brief, style preset, duration, etc.)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const { projectId } = await params;
    const body = await request.json();

    // Only allow updating safe fields
    const allowedFields: Record<string, unknown> = {};
    if (typeof body.brief === "string") {
      allowedFields.brief = body.brief;
    }
    if (typeof body.name === "string") {
      allowedFields.name = body.name;
    }
    if (typeof body.style_preset === "string") {
      allowedFields.style_preset = body.style_preset;
    }
    if (typeof body.duration_seconds === "number") {
      allowedFields.duration_seconds = body.duration_seconds;
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 },
      );
    }

    allowedFields.updated_at = new Date().toISOString();

    // RLS enforces that the user owns this project
    const { data, error } = await supabase
      .from("projects")
      .update(allowedFields)
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Project update error:", error);
    return NextResponse.json(
      { error: "Failed to update project." },
      { status: 500 },
    );
  }
}
