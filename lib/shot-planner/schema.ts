/* ── Shot Planner Response Validation ──────────────────────── */

import { z } from "zod";

export const narrativeBeatSchema = z.enum([
  "hook",
  "problem",
  "reveal",
  "highlight",
  "payoff",
]);

export const cameraMoveSchema = z.enum([
  "zoom_in_center",
  "zoom_out",
  "pan_left_to_right",
  "ken_burns_subtle",
  "static_hold",
]);

export const transitionTypeSchema = z.enum(["fade", "cut"]);

export const shotSchema = z.object({
  shot_id: z.string(),
  frame_id: z.string(),
  narrative_beat: narrativeBeatSchema,
  camera_move: cameraMoveSchema,
  duration_ms: z.number().int().positive(),
  caption: z.string().optional(),
  transition_in: transitionTypeSchema,
});

export const sceneGraphOutputSchema = z.object({
  video_duration_target: z.number().int().positive(),
  style_preset: z.string(),
  shots: z.array(shotSchema).optional(),
  error: z.enum(["insufficient_brief", "insufficient_content"]).or(z.string()).optional(),
});

export type RawSceneGraphOutput = z.infer<typeof sceneGraphOutputSchema>;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: RawSceneGraphOutput;
}

/**
 * Validate scene graph response against strict cardinality, total duration,
 * and frame ID validity rules.
 */
export function validateSceneGraphResponse(
  data: unknown,
  validFrameIds: string[],
  targetDurationSeconds: number,
): ValidationResult {
  const parsed = sceneGraphOutputSchema.safeParse(data);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }

  const output = parsed.data;

  // Handle LLM error responses
  if (output.error) {
    return {
      valid: true,
      errors: [],
      data: output,
    };
  }

  const shots = output.shots ?? [];
  const errors: string[] = [];

  if (shots.length === 0) {
    errors.push("Response contains zero shots.");
    return { valid: false, errors };
  }

  // 1. Hook beat checks: exactly 1 hook, must be first
  const hookShots = shots.filter((s) => s.narrative_beat === "hook");
  if (hookShots.length !== 1) {
    errors.push(`Expected exactly 1 "hook" beat, found ${hookShots.length}.`);
  }
  if (shots[0]?.narrative_beat !== "hook") {
    errors.push('The first shot must have narrative_beat="hook".');
  }

  // 2. Payoff beat checks: exactly 1 payoff, must be last
  const payoffShots = shots.filter((s) => s.narrative_beat === "payoff");
  if (payoffShots.length !== 1) {
    errors.push(`Expected exactly 1 "payoff" beat, found ${payoffShots.length}.`);
  }
  if (shots[shots.length - 1]?.narrative_beat !== "payoff") {
    errors.push('The last shot must have narrative_beat="payoff".');
  }

  // 3. Frame ID validation: all frame_id values must exist in input frames
  const validSet = new Set(validFrameIds);
  for (const shot of shots) {
    if (!validSet.has(shot.frame_id)) {
      errors.push(`Shot ${shot.shot_id} references invalid frame_id "${shot.frame_id}".`);
    }
  }

  // 4. Duration tolerance check: sum of duration_ms within target_duration_seconds * 1000 ± 500ms
  const targetMs = targetDurationSeconds * 1000;
  const totalMs = shots.reduce((sum, s) => sum + s.duration_ms, 0);
  if (Math.abs(totalMs - targetMs) > 500) {
    errors.push(
      `Total shots duration (${totalMs}ms) deviates from target duration (${targetMs}ms) by more than 500ms.`,
    );
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], data: output };
}
