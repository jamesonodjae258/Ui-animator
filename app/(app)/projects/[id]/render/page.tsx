import { createClient, createServiceClient } from "@/lib/supabase/server";
import { RenderResult } from "@/components/screens/render-result";
import type { RenderJobData } from "@/components/screens/render-result";
import { localStore } from "@/lib/local-store";

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

  const serviceClient = createServiceClient();
  const clientToUse = user ? supabase : serviceClient;

  let projectName = "";
  let projectBrief = "";
  let preset = "clean_saas";
  let duration = 30;

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
    projectName = project.name;
    projectBrief = project.brief;
    preset = project.style_preset ?? "clean_saas";
    duration = project.duration_seconds ?? 30;
  }

  let sceneGraphId: string | null = null;
  let shotsCount = 0;

  let sg = null;
  try {
    const { data: dbSg } = await clientToUse
      .from("scene_graphs")
      .select("id, shots")
      .eq("project_id", projectId)
      .maybeSingle();
    if (dbSg) sg = dbSg;
  } catch {}

  if (!sg) {
    sg = localStore.getSceneGraph(projectId);
  }

  if (sg) {
    sceneGraphId = sg.id;
    shotsCount = Array.isArray(sg.shots) ? sg.shots.length : 0;
  }

  let initialJob: RenderJobData | null = null;

  if (queryJobId) {
    try {
      const { data: job } = await clientToUse
        .from("render_jobs")
        .select("*")
        .eq("id", queryJobId)
        .eq("project_id", projectId)
        .maybeSingle();

      if (job) {
        initialJob = job as RenderJobData;
      }
    } catch {}

    if (!initialJob) {
      const localJ = localStore.getRenderJob(queryJobId);
      if (localJ && localJ.project_id === projectId) {
        initialJob = localJ as RenderJobData;
      }
    }
  }

  if (!initialJob) {
    try {
      const { data: latestJob } = await clientToUse
        .from("render_jobs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestJob) {
        initialJob = latestJob as RenderJobData;
      }
    } catch {}
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
