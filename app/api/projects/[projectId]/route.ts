/* ── Project update API (with upsert support) ─────────────────── */

import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const effectiveUserId = user.id;
    const clientToUse = supabase;

    const { projectId } = await params;
    const body = await request.json();

    // Only allow updating safe fields
    const allowedFields: Record<string, unknown> = {};
    if (typeof body.brief === "string") {
      allowedFields.brief = body.brief;
    }
    if (typeof body.project_brief === "string") {
      allowedFields.brief = body.project_brief;
      allowedFields.project_brief = body.project_brief;
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

    allowedFields.updated_at = new Date().toISOString();

    // Check if project exists
    const { data: existingProject } = await clientToUse
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .maybeSingle();

    let data;
    let error;

    if (!existingProject) {
      // Upsert / Insert new project row so subsequent steps never 404
      const insertResult = await clientToUse
        .from("projects")
        .insert({
          id: projectId,
          user_id: effectiveUserId,
          name: typeof allowedFields.name === "string" ? allowedFields.name : "Untitled project",
          brief: typeof allowedFields.brief === "string" ? allowedFields.brief : "",
          style_preset: typeof allowedFields.style_preset === "string" ? allowedFields.style_preset : "clean_saas",
          duration_seconds: typeof allowedFields.duration_seconds === "number" ? allowedFields.duration_seconds : 30,
          status: "draft",
        })
        .select()
        .single();

      data = insertResult.data;
      error = insertResult.error;
    } else {
      // Update existing project
      const updateResult = await clientToUse
        .from("projects")
        .update(allowedFields)
        .eq("id", projectId)
        .select()
        .single();

      data = updateResult.data;
      error = updateResult.error;
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
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
