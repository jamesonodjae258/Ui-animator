import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/screens/review-form";
import type { ShotWithFrame } from "@/components/screens/review-form";
import type { ShotPlan } from "@/lib/shot-planner/types";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch project details
  let stylePreset = "clean_saas";
  let durationSeconds = 30;

  if (user) {
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (project) {
      stylePreset = project.style_preset ?? "clean_saas";
      durationSeconds = project.duration_seconds ?? 30;
    }
  }

  // Fetch frames for thumbnail & name mapping
  const frameMap = new Map<string, { name: string; storagePath: string | null }>();

  if (user) {
    const { data: frames } = await supabase
      .from("frames")
      .select("id, name, thumbnail_storage_path")
      .eq("project_id", projectId);

    if (frames) {
      for (const f of frames) {
        frameMap.set(f.id, {
          name: f.name,
          storagePath: f.thumbnail_storage_path,
        });
      }
    }
  }

  // Fetch scene graph
  let sceneGraphId: string | null = null;
  let status: "generating" | "ready" | "error" = "ready";
  let errorMessage: string | null = null;
  let shots: ShotWithFrame[] = [];

  if (user) {
    const { data: sg } = await supabase
      .from("scene_graphs")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

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
