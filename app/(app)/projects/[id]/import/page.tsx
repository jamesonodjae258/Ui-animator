import { createClient } from "@/lib/supabase/server";
import { getFigmaConnection } from "@/lib/figma/connection";
import { ImportForm } from "@/components/screens/import-form";
import type { FrameRow } from "@/lib/supabase/types";

interface ImportPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Import page — server component that fetches:
 * 1. Figma connection status
 * 2. Project data
 * 3. Existing frames (if any, from a previous import)
 *
 * Passes everything to the interactive ImportForm client component.
 */
export default async function ImportPage({ params }: ImportPageProps) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check Figma connection
  let isConnected = false;
  let figmaUserName: string | null = null;

  const userId = user?.id ?? "00000000-0000-0000-0000-000000000000";

  try {
    const connection = await getFigmaConnection(userId);
    if (connection) {
      isConnected = true;
      figmaUserName = connection.figmaUserName;
    }
  } catch {
    // Connection may be invalid — treat as not connected
  }

  // Fetch project data (if it exists)
  let brief = "";
  let stylePreset = "clean_saas";
  let duration = 30;

  if (user) {
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (project) {
      brief = project.brief ?? "";
      stylePreset = project.style_preset ?? "clean_saas";
      duration = project.duration_seconds ?? 30;
    }
  }

  // Fetch existing frames
  let frames: Array<FrameRow & { thumbnail_url: string | null }> = [];

  if (user) {
    const { data: frameRows } = await supabase
      .from("frames")
      .select("*")
      .eq("project_id", projectId)
      .order("order_in_flow", { ascending: true });

    if (frameRows) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      frames = frameRows.map((frame: FrameRow) => ({
        ...frame,
        thumbnail_url: frame.thumbnail_storage_path
          ? `${supabaseUrl}/storage/v1/object/public/frame-thumbnails/${frame.thumbnail_storage_path}`
          : null,
      }));
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text-primary">New project</h1>
        <p className="mt-1 text-sm text-text-muted">
          Import your Figma prototype and describe what makes it matter.
        </p>
      </div>

      <ImportForm
        projectId={projectId}
        isConnected={isConnected}
        figmaUserName={figmaUserName}
        initialFrames={frames}
        initialBrief={brief}
        initialStylePreset={stylePreset}
        initialDuration={duration}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}
      />
    </div>
  );
}
