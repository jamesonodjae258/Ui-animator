/* ── Local Development / Offline Fallback Store ──────────────── */

import fs from "fs";
import path from "path";
import type { ProjectRow, FrameRow, SceneGraphRow, RenderJobRow } from "./supabase/types";

const STORE_PATH = path.join(process.cwd(), ".local-store.json");

interface LocalDatabase {
  projects: Record<string, ProjectRow>;
  frames: Record<string, FrameRow[]>; // project_id -> frames
  scene_graphs: Record<string, SceneGraphRow>; // project_id -> scene_graph
  render_jobs: Record<string, RenderJobRow>; // job_id -> job
}

function getInitialStore(): LocalDatabase {
  return {
    projects: {},
    frames: {},
    scene_graphs: {},
    render_jobs: {},
  };
}

function loadStore(): LocalDatabase {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const content = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Could not read local store, resetting:", err);
  }
  return getInitialStore();
}

function saveStore(store: LocalDatabase): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist local store:", err);
  }
}

export const localStore = {
  getProjects(userId: string): ProjectRow[] {
    const store = loadStore();
    return Object.values(store.projects).filter(
      (p) => !userId || p.user_id === userId || p.user_id === "00000000-0000-0000-0000-000000000001",
    );
  },

  getProject(id: string): ProjectRow | null {
    const store = loadStore();
    return store.projects[id] ?? null;
  },

  upsertProject(project: Partial<ProjectRow> & { id: string }): ProjectRow {
    const store = loadStore();
    const existing = store.projects[project.id] ?? {
      id: project.id,
      user_id: "00000000-0000-0000-0000-000000000001",
      name: "Acme Analytics — SaaS Demo",
      brief: "",
      figma_file_key: null,
      style_preset: "clean_saas",
      duration_seconds: 30,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated: ProjectRow = {
      ...existing,
      ...project,
      updated_at: new Date().toISOString(),
    };

    store.projects[project.id] = updated;
    saveStore(store);
    return updated;
  },

  getFrames(projectId: string): FrameRow[] {
    const store = loadStore();
    return store.frames[projectId] ?? [];
  },

  setFrames(projectId: string, frames: FrameRow[]): void {
    const store = loadStore();
    store.frames[projectId] = frames;
    saveStore(store);
  },

  getSceneGraph(projectId: string): SceneGraphRow | null {
    const store = loadStore();
    return store.scene_graphs[projectId] ?? null;
  },

  upsertSceneGraph(sg: Partial<SceneGraphRow> & { id: string; project_id: string }): SceneGraphRow {
    const store = loadStore();
    const existing = store.scene_graphs[sg.project_id] ?? {
      id: sg.id,
      project_id: sg.project_id,
      video_duration_target: 30,
      style_preset: "clean_saas",
      shots: [],
      status: "ready" as const,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated: SceneGraphRow = {
      ...existing,
      ...sg,
      updated_at: new Date().toISOString(),
    };

    store.scene_graphs[sg.project_id] = updated;
    saveStore(store);
    return updated;
  },

  getRenderJob(jobId: string): RenderJobRow | null {
    const store = loadStore();
    return store.render_jobs[jobId] ?? null;
  },

  upsertRenderJob(job: Partial<RenderJobRow> & { id: string; project_id: string }): RenderJobRow {
    const store = loadStore();
    const existing = store.render_jobs[job.id] ?? {
      id: job.id,
      project_id: job.project_id,
      scene_graph_id: job.scene_graph_id ?? "",
      status: "queued" as const,
      output_video_url: null,
      error_message: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated: RenderJobRow = {
      ...existing,
      ...job,
      updated_at: new Date().toISOString(),
    };

    store.render_jobs[job.id] = updated;
    saveStore(store);
    return updated;
  },
};
