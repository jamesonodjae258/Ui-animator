/* ── Figma disconnect ─────────────────────────────────────── */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFigmaConnection } from "@/lib/figma/connection";

/**
 * POST /api/figma/disconnect
 * Removes the user's Figma connection.
 */
export async function POST() {
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

    await deleteFigmaConnection(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Figma disconnect error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to disconnect Figma account.",
      },
      { status: 500 },
    );
  }
}
