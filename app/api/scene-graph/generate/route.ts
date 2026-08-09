/* ── Scene Graph Generation Route ──────────────────────────── */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateSceneGraph } from "@/lib/shot-planner/generator";

const generateSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
});

/**
 * POST /api/scene-graph/generate
 * Triggers LLM narrative scene graph generation for a project.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to generate a scene graph." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 },
      );
    }

    const { projectId } = parsed.data;

    // Verify project ownership
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

    // Run shot planner generation pipeline
    const result = await generateSceneGraph(projectId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Failed to generate scene graph.", sceneGraphId: result.sceneGraphId },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      sceneGraphId: result.sceneGraphId,
    });
  } catch (error) {
    console.error("Scene graph generation API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while generating the scene graph.",
      },
      { status: 500 },
    );
  }
}
