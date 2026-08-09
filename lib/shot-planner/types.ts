/* ── Shot Planner Types ─────────────────────────────────────── */

export type NarrativeBeat = "hook" | "problem" | "reveal" | "highlight" | "payoff";

export type CameraMove =
  | "zoom_in_center"
  | "zoom_out"
  | "pan_left_to_right"
  | "ken_burns_subtle"
  | "static_hold";

export type TransitionType = "fade" | "cut";

export interface ShotPlan {
  shot_id: string;
  frame_id: string;
  narrative_beat: NarrativeBeat;
  camera_move: CameraMove;
  duration_ms: number;
  caption?: string;
  transition_in: TransitionType;
}

export interface SceneGraphData {
  video_duration_target: number;
  style_preset: string;
  shots: ShotPlan[];
  error?: "insufficient_brief" | "insufficient_content" | string;
}

export interface SceneGraphRow {
  id: string;
  project_id: string;
  video_duration_target: number;
  style_preset: string;
  status: "generating" | "ready" | "error";
  error_message: string | null;
  shots: ShotPlan[];
  created_at: string;
  updated_at: string;
}
