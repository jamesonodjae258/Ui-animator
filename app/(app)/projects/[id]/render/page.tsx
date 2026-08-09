import { createClient } from "@/lib/supabase/server";
import { RenderResult } from "@/components/screens/render-result";
import type { RenderJobData } from "@/components/screens/render-result";

interface RenderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jobId?: string }>;
}

export default async function RenderPage({ params, searchParams }: RenderPageProps) {
  const { id: projectId } = await params;
  const { jobId: queryJobId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projectName = "";
  let projectBrief = "";
  let preset = "clean_saas";
  let duration = 30;

  if (user) {
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (project) {
      projectName = project.name;
      projectBrief = project.brief;
      preset = project.style_preset ?? "clean_saas";
      duration = project.duration_seconds ?? 30;
    }
  }

  let sceneGraphId: string | null = null;
  let shotsCount = 0;

  if (user) {
    const { data: sg } = await supabase
      .from("scene_graphs")
      .select("id, shots")
      .eq("project_id", projectId)
      .maybeSingle();

    if (sg) {
      sceneGraphId = sg.id;
      shotsCount = Array.isArray(sg.shots) ? sg.shots.length : 0;
    }
  }

  let initialJob: RenderJobData | null = null;

  if (user) {
    if (queryJobId) {
      const { data: job } = await supabase
        .from("render_jobs")
        .select("*")
        .eq("id", queryJobId)
        .eq("project_id", projectId)
        .maybeSingle();

      if (job) {
        initialJob = job as RenderJobData;
      }
    }

    if (!initialJob) {
      const { data: latestJob } = await supabase
        .from("render_jobs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestJob) {
        initialJob = latestJob as RenderJobData;
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <RenderResult
        projectId={projectId}
        projectName={projectName}
        projectBrief={projectBrief}
        preset={preset}
        duration={duration}
        shotsCount={shotsCount}
        initialJob={initialJob}
        sceneGraphId={sceneGraphId}
      />
    </div>
  );
}
