/* ── Sample Prototype Seeder API (with local fallback) ───────── */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { localStore } from "@/lib/local-store";
import type { FrameRow } from "@/lib/supabase/types";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

const sampleSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
});

const SAMPLE_FRAMES = [
  {
    name: "01_Hero_Landing",
    node_id: "1:100",
    order_in_flow: 0,
    width: 1440,
    height: 900,
    included: true,
  },
  {
    name: "02_Metrics_Dashboard",
    node_id: "1:101",
    order_in_flow: 1,
    width: 1440,
    height: 900,
    included: true,
  },
  {
    name: "03_Interactive_Timeline",
    node_id: "1:102",
    order_in_flow: 2,
    width: 1440,
    height: 900,
    included: true,
  },
  {
    name: "04_Vector_Interpolation",
    node_id: "1:103",
    order_in_flow: 3,
    width: 1440,
    height: 900,
    included: true,
  },
  {
    name: "05_Export_Modal",
    node_id: "1:104",
    order_in_flow: 4,
    width: 1440,
    height: 900,
    included: true,
  },
  {
    name: "06_Payoff_Success",
    node_id: "1:105",
    order_in_flow: 5,
    width: 1440,
    height: 900,
    included: true,
  },
];

const SAMPLE_BRIEF =
  "Acme Analytics is a real-time intelligence platform for high-growth software teams. It solves fragmented data silos by unifying customer conversion velocity into one live canvas, enabling leaders to make faster product decisions.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sampleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    const { projectId } = parsed.data;

    // Prepared mock/fallback data
    const localProject = localStore.upsertProject({
      id: projectId,
      user_id: DEMO_USER_ID,
      name: "Acme Analytics — SaaS Demo",
      brief: SAMPLE_BRIEF,
      figma_file_key: "sample-figma-file-key",
      style_preset: "clean_saas",
      duration_seconds: 30,
      status: "draft",
    });

    const mockFrames: FrameRow[] = SAMPLE_FRAMES.map((f, idx) => ({
      id: `sample-frame-${projectId.slice(0, 8)}-${idx + 1}`,
      project_id: projectId,
      name: f.name,
      figma_node_id: f.node_id,
      order_in_flow: f.order_in_flow,
      width: f.width,
      height: f.height,
      included: f.included,
      thumbnail_storage_path: null,
      created_at: new Date().toISOString(),
    }));

    localStore.setFrames(projectId, mockFrames);

    // Try syncing with Supabase if accessible
    try {
      const serviceClient = createServiceClient();
      await serviceClient
        .from("projects")
        .upsert(
          {
            id: projectId,
            user_id: DEMO_USER_ID,
            name: "Acme Analytics — SaaS Demo",
            brief: SAMPLE_BRIEF,
            figma_file_key: "sample-figma-file-key",
            style_preset: "clean_saas",
            duration_seconds: 30,
            status: "draft",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      await serviceClient.from("frames").delete().eq("project_id", projectId);
      await serviceClient.from("frames").insert(
        mockFrames.map((f) => ({
          ...f,
          id: undefined,
        })),
      );
    } catch {
      // Supabase offline/DNS error — localStore already has the data
    }

    return NextResponse.json({
      success: true,
      project: localProject,
      frames: mockFrames,
      frameCount: mockFrames.length,
      brief: SAMPLE_BRIEF,
    });
  } catch (error) {
    console.error("Sample seeder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load sample prototype." },
      { status: 500 },
    );
  }
}
