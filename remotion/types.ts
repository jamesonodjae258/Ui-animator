/* ── Remotion Composition Types ─────────────────────────────── */

import type { NarrativeBeat, CameraMove, TransitionType } from "@/lib/shot-planner/types";

export interface RemotionShot {
  shotId: string;
  frameId: string;
  frameName: string;
  imageUrl: string;
  narrativeBeat: NarrativeBeat;
  cameraMove: CameraMove;
  durationInFrames: number;
  caption?: string;
  transitionIn: TransitionType;
}

export interface RemotionCompositionProps extends Record<string, unknown> {
  shots: RemotionShot[];
  stylePreset: string;
  fps: number;
  totalDurationInFrames: number;
}
