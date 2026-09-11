/* ── Scene Graph Data Route ─────────────────────────────────── */

import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { localStore } from "@/lib/local-store";

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

    const { projectId } = await params;

    if (!user) {
      const serviceClient = createServiceClient();
      const { data: demoUser } = await serviceClient.auth.admin
        .getUserById("00000000-0000-0000-0000-000000000001")
        .catch(() => ({ data: null }));

      if (!demoUser?.user) {
        const localP = localStore.getProject(projectId);
        if (!localP) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    }

    let sceneGraph = null;
    try {
      const clientToUse = user ? supabase : createServiceClient();
      const { data: sg, error } = await clientToUse
        .from("scene_graphs")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (!error && sg) {
        sceneGraph = sg;
      }
    } catch {}

    if (!sceneGraph) {
      sceneGraph = localStore.getSceneGraph(projectId);
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

    const { projectId } = await params;

    if (!user) {
      const serviceClient = createServiceClient();
      const { data: demoUser } = await serviceClient.auth.admin
        .getUserById("00000000-0000-0000-0000-000000000001")
        .catch(() => ({ data: null }));

      if (!demoUser?.user) {
        const localP = localStore.getProject(projectId);
        if (!localP) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    }

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

    let updated = null;
    try {
      const clientToUse = user ? supabase : createServiceClient();
      const { data, error } = await clientToUse
        .from("scene_graphs")
        .update(allowedFields)
        .eq("project_id", projectId)
        .select()
        .single();

      if (!error && data) {
        updated = data;
      }
    } catch {}

    const localExisting = localStore.getSceneGraph(projectId);
    const localUpdated = localStore.upsertSceneGraph({
      id: updated?.id ?? localExisting?.id ?? crypto.randomUUID(),
      project_id: projectId,
      ...allowedFields,
    });

    return NextResponse.json(updated ?? localUpdated);
  } catch (error) {
    console.error("Update scene graph error:", error);
    return NextResponse.json(
      { error: "Failed to update scene graph." },
      { status: 500 },
    );
  }
}
