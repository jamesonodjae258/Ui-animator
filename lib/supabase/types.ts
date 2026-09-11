/* ── Database type definitions ─────────────────────────────── */

/** Row type for the `projects` table. */
export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  brief: string;
  figma_file_key: string | null;
  style_preset: string;
  duration_seconds: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Insert type for the `projects` table. */
export interface ProjectInsert {
  user_id: string;
  name?: string;
  brief?: string;
  figma_file_key?: string;
  style_preset?: string;
  duration_seconds?: number;
  status?: string;
}

/** Row type for the `figma_connections` table. */
export interface FigmaConnectionRow {
  id: string;
  user_id: string;
  encrypted_access_token: string;
  encrypted_refresh_token: string;
  token_iv: string;
  refresh_iv: string;
  expires_at: string;
  figma_user_name: string | null;
  figma_user_email: string | null;
  created_at: string;
  updated_at: string;
}

/** Row type for the `frames` table. */
export interface FrameRow {
  id: string;
  project_id: string;
  figma_node_id: string;
  name: string;
  order_in_flow: number;
  thumbnail_storage_path: string | null;
  included: boolean;
  created_at: string;
}

/** Insert type for the `frames` table. */
export interface FrameInsert {
  project_id: string;
  figma_node_id: string;
  name: string;
  order_in_flow: number;
  thumbnail_storage_path?: string;
  included?: boolean;
}

/** Row type for the `scene_graphs` table. */
export interface SceneGraphRow {
  id: string;
  project_id: string;
  video_duration_target: number;
  style_preset: string;
  shots: unknown[];
  status: "generating" | "ready" | "error";
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/** Row type for the `render_jobs` table. */
export interface RenderJobRow {
  id: string;
  project_id: string;
  scene_graph_id: string;
  status: "queued" | "rendering" | "complete" | "error";
  output_video_url: string | null;
  error_message: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
