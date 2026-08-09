/* ── Scene Graph Data Route ─────────────────────────────────── */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/scene-graph/[projectId]
 * Fetches the latest scene graph for a project.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    const { data: sceneGraph, error } = await supabase
      .from("scene_graphs")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!sceneGraph) {
      return NextResponse.json(
        { error: "No scene graph found for this project." },
        { status: 404 },
      );
    }

    return NextResponse.json(sceneGraph);
  } catch (error) {
    console.error("Fetch scene graph error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scene graph." },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/scene-graph/[projectId]
 * Updates scene graph shots (e.g. caption edits, shot reordering).
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();

    const allowedFields: Record<string, unknown> = {};
    if (Array.isArray(body.shots)) {
      allowedFields.shots = body.shots;
    }
    if (typeof body.status === "string") {
      allowedFields.status = body.status;
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update." },
        { status: 400 },
      );
    }

    allowedFields.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("scene_graphs")
      .update(allowedFields)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update scene graph error:", error);
    return NextResponse.json(
      { error: "Failed to update scene graph." },
      { status: 500 },
    );
  }
}
