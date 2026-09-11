import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/screens/review-form";
import type { ShotWithFrame } from "@/components/screens/review-form";
import type { ShotPlan } from "@/lib/shot-planner/types";
import { localStore } from "@/lib/local-store";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const serviceClient = createServiceClient();
  const clientToUse = user ? supabase : serviceClient;

  // Fetch project details
  let stylePreset = "clean_saas";
  let durationSeconds = 30;

  let project = null;
  try {
    const { data: p } = await clientToUse
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();
    if (p) project = p;
  } catch {}

  if (!project) {
    project = localStore.getProject(projectId);
  }

  if (project) {
    stylePreset = project.style_preset ?? "clean_saas";
    durationSeconds = project.duration_seconds ?? 30;
  }

  // Fetch frames for thumbnail & name mapping
  const frameMap = new Map<string, { name: string; storagePath: string | null }>();

  let framesList: Array<{ id: string; name: string; thumbnail_storage_path: string | null }> = [];
  try {
    const { data: frames } = await clientToUse
      .from("frames")
      .select("id, name, thumbnail_storage_path")
      .eq("project_id", projectId);
    if (frames && frames.length > 0) {
      framesList = frames;
    }
  } catch {}

  if (framesList.length === 0) {
    framesList = localStore.getFrames(projectId).map((f) => ({
      id: f.id,
      name: f.name,
      thumbnail_storage_path: f.thumbnail_storage_path,
    }));
  }

  for (const f of framesList) {
    frameMap.set(f.id, {
      name: f.name,
      storagePath: f.thumbnail_storage_path,
    });
  }

  // Fetch scene graph
  let sceneGraphId: string | null = null;
  let status: "generating" | "ready" | "error" = "ready";
  let errorMessage: string | null = null;
  let shots: ShotWithFrame[] = [];

  let sg = null;
  try {
    const { data: dbSg } = await clientToUse
      .from("scene_graphs")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();
    if (dbSg) sg = dbSg;
  } catch {}

  if (!sg) {
    sg = localStore.getSceneGraph(projectId);
  }

  if (sg) {
    sceneGraphId = sg.id;
    status = sg.status;
    errorMessage = sg.error_message;

    const rawShots = (sg.shots ?? []) as ShotPlan[];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

    shots = rawShots.map((shot) => {
      const fInfo = frameMap.get(shot.frame_id);
      const frameName = fInfo?.name ?? "Unknown frame";
      const thumbnailUrl = fInfo?.storagePath
        ? `${supabaseUrl}/storage/v1/object/public/frame-thumbnails/${fInfo.storagePath}`
        : null;

      return {
        ...shot,
        frameName,
        thumbnailUrl,
      };
    });
  }

  return (
    <ReviewForm
      projectId={projectId}
      sceneGraphId={sceneGraphId}
      stylePreset={stylePreset}
      durationSeconds={durationSeconds}
      initialShots={shots}
      status={status}
      errorMessage={errorMessage}
    />
  );
}
