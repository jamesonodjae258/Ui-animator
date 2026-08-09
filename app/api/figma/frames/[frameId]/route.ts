/* ── Frame update API ─────────────────────────────────────── */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/figma/frames/[frameId]
 * Update a single frame (toggle included, update order, etc.)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ frameId: string }> },
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

    const { frameId } = await params;
    const body = await request.json();

    // Only allow updating safe fields
    const allowedFields: Record<string, unknown> = {};
    if (typeof body.included === "boolean") {
      allowedFields.included = body.included;
    }
    if (typeof body.order_in_flow === "number") {
      allowedFields.order_in_flow = body.order_in_flow;
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 },
      );
    }

    // RLS will enforce that the user owns the project this frame belongs to
    const { data, error } = await supabase
      .from("frames")
      .update(allowedFields)
      .eq("id", frameId)
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
    console.error("Frame update error:", error);
    return NextResponse.json(
      { error: "Failed to update frame." },
      { status: 500 },
    );
  }
}
