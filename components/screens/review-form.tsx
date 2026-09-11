"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";
import type { ShotPlan, NarrativeBeat } from "@/lib/shot-planner/types";

export interface ShotWithFrame extends ShotPlan {
  frameName: string;
  thumbnailUrl: string | null;
}

interface ReviewFormProps {
  projectId: string;
  sceneGraphId: string | null;
  stylePreset: string;
  durationSeconds: number;
  initialShots: ShotWithFrame[];
  status: "generating" | "ready" | "error";
  errorMessage: string | null;
}

const BEAT_CONFIG: Record<NarrativeBeat, { label: string; variant: BadgeVariant }> = {
  hook: { label: "Hook", variant: "strong" },
  problem: { label: "Problem", variant: "outline" },
  reveal: { label: "Reveal", variant: "default" },
  highlight: { label: "Highlight", variant: "subtle" },
  payoff: { label: "Payoff", variant: "strong" },
};

const CAMERA_LABELS: Record<string, string> = {
  zoom_in_center: "Zoom in (center)",
  zoom_out: "Zoom out",
  pan_left_to_right: "Pan left → right",
  ken_burns_subtle: "Ken Burns (subtle)",
  static_hold: "Static hold",
};

// MOCK DATA — Stage 2 mock review shots for static review
const MOCK_REVIEW_SHOTS: ShotWithFrame[] = [
  {
    shot_id: "mock-shot-1",
    frame_id: "frame-1",
    frameName: "Hero Landing",
    thumbnailUrl: null,
    narrative_beat: "hook",
    camera_move: "zoom_in_center",
    duration_ms: 4500,
    caption: "Stop wrestling with complex dashboards.",
    transition_in: "fade",
    order_index: 0,
  },
  {
    shot_id: "mock-shot-2",
    frame_id: "frame-2",
    frameName: "Legacy Analytics",
    thumbnailUrl: null,
    narrative_beat: "problem",
    camera_move: "pan_left_to_right",
    duration_ms: 5000,
    caption: "Teams lose hours every week digging through fragmented metrics.",
    transition_in: "cut",
    order_index: 1,
  },
  {
    shot_id: "mock-shot-3",
    frame_id: "frame-3",
    frameName: "Automated Insights",
    thumbnailUrl: null,
    narrative_beat: "reveal",
    camera_move: "zoom_out",
    duration_ms: 6000,
    caption: "Meet UI Animator: automated clarity in real-time.",
    transition_in: "fade",
    order_index: 2,
  },
  {
    shot_id: "mock-shot-4",
    frame_id: "frame-4",
    frameName: "Interactive Flow",
    thumbnailUrl: null,
    narrative_beat: "highlight",
    camera_move: "ken_burns_subtle",
    duration_ms: 5500,
    caption: "Filter, isolate, and act on insights in one click.",
    transition_in: "cut",
    order_index: 3,
  },
  {
    shot_id: "mock-shot-5",
    frame_id: "frame-5",
    frameName: "Team Collaboration",
    thumbnailUrl: null,
    narrative_beat: "highlight",
    camera_move: "static_hold",
    duration_ms: 4000,
    caption: "Share live video stories directly to Slack and Linear.",
    transition_in: "cut",
    order_index: 4,
  },
  {
    shot_id: "mock-shot-6",
    frame_id: "frame-6",
    frameName: "Payoff Summary",
    thumbnailUrl: null,
    narrative_beat: "payoff",
    camera_move: "zoom_in_center",
    duration_ms: 5000,
    caption: "Start turning your Figma prototypes into narrative videos today.",
    transition_in: "fade",
    order_index: 5,
  },
];

export function ReviewForm({
  projectId,
  sceneGraphId,
  stylePreset,
  durationSeconds,
  initialShots,
  status,
  errorMessage,
}: ReviewFormProps) {
  const router = useRouter();
  const [shots, setShots] = useState<ShotWithFrame[]>(
    initialShots && initialShots.length > 0 ? initialShots : MOCK_REVIEW_SHOTS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isQueueingRender, setIsQueueingRender] = useState(false);

  const handleCaptionChange = useCallback(
    async (shotId: string, newCaption: string) => {
      const updated = shots.map((s) =>
        s.shot_id === shotId ? { ...s, caption: newCaption } : s,
      );
      setShots(updated);

      try {
        setIsSaving(true);
        const cleanShots: ShotPlan[] = updated.map(
          ({ frameName, thumbnailUrl, ...rest }) => rest,
        );

        await fetch(`/api/scene-graph/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shots: cleanShots }),
        });
      } catch (err) {
        console.error("Failed to save updated shot caption:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [shots, projectId],
  );

  const handleRenderVideo = useCallback(async () => {
    if (!sceneGraphId) return;

    try {
      setIsQueueingRender(true);
      const res = await fetch("/api/render/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, sceneGraphId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Failed to queue video render.");
        return;
      }

      router.push(`/projects/${projectId}/render?jobId=${data.jobId}`);
    } catch (err) {
      console.error("Render trigger failed:", err);
      alert("Network error while queueing video render.");
    } finally {
      setIsQueueingRender(false);
    }
  }, [projectId, sceneGraphId, router]);

  const totalDurationMs = shots.reduce((sum, s) => sum + s.duration_ms, 0);

  if (status === "error" || (status === "ready" && shots.length === 0)) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-[var(--radius)] text-red-700 dark:text-red-300">
          <h2 className="text-base font-semibold mb-2">Could Not Build Scene Graph</h2>
          <p className="text-sm">{errorMessage ?? "No shots were generated for this project."}</p>
        </div>
        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push(`/projects/${projectId}/import`)}
          >
            ← Back to import screen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-semibold text-text-primary">Shot review</h1>
        <p className="mt-1 text-sm text-text-muted">
          Your narrative arc — review the story, adjust captions, refine camera moves.
        </p>
      </div>

      {/* Summary bar */}
      <Card className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">
              <span className="font-medium text-text-primary">{shots.length}</span> shots
            </span>
            <span className="text-text-muted">·</span>
            <span className="text-text-secondary">
              <span className="font-medium text-text-primary">
                {(totalDurationMs / 1000).toFixed(1)}s
              </span>{" "}
              total
            </span>
            <span className="text-text-muted">·</span>
            <Badge variant="subtle">
              {stylePreset === "bold_launch" ? "Bold Launch" : "Clean SaaS"}
            </Badge>
          </div>
          {isSaving && (
            <span className="text-xs text-text-muted animate-pulse">Saving changes…</span>
          )}
        </div>
      </Card>

      {/* Arc label: beginning */}
      <div className="flex items-center gap-2 mb-2 ml-8 pl-4">
        <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
        <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
          Story begins
        </span>
      </div>

      {/* Shot list */}
      <div className="relative">
        {shots.map((shot, index) => {
          const beat = BEAT_CONFIG[shot.narrative_beat] ?? BEAT_CONFIG.reveal;
          const isAnchor =
            shot.narrative_beat === "hook" || shot.narrative_beat === "payoff";
          const isFirst = index === 0;
          const isLast = index === shots.length - 1;

          return (
            <div key={shot.shot_id} className="relative flex items-start gap-0">
              {/* Timeline connector */}
              <div className="flex flex-col items-center flex-shrink-0 w-8 pt-6">
                {!isFirst && <div className="w-px flex-1 bg-border min-h-[12px]" />}
                <div
                  className={[
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    isAnchor ? "bg-text-primary" : "bg-border-strong",
                  ].join(" ")}
                />
                {!isLast && <div className="w-px flex-1 bg-border min-h-[12px]" />}
              </div>

              {/* Shot Card */}
              <Card
                padding="none"
                className={[
                  "flex-1 mb-3 transition-colors duration-150",
                  isAnchor
                    ? "border-border-strong border-l-2 border-l-text-primary"
                    : "",
                ].join(" ")}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-3.5 sm:p-4">
                  <div className="flex items-center gap-3">
                    {/* Drag Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary sm:pt-6 shrink-0 select-none"
                      title="Drag to reorder shot"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5" />
                        <circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" />
                        <circle cx="15" cy="18" r="1.5" />
                      </svg>
                    </div>
                    {/* Frame Thumbnail */}
                    <div className="w-24 h-[60px] sm:w-28 sm:h-[70px] flex-shrink-0 bg-surface-2 rounded-[calc(var(--radius)*0.5)] overflow-hidden border border-border">
                    {shot.thumbnailUrl ? (
                      <img
                        src={shot.thumbnailUrl}
                        alt={shot.frameName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <svg
                          className="w-6 h-6 opacity-40"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      </div>
                    )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-2.5 w-full">
                    {/* Top row: beat + frame name + meta */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={beat.variant}>{beat.label}</Badge>
                      <span className="text-sm font-medium text-text-primary truncate">
                        {shot.frameName}
                      </span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">
                        {(shot.duration_ms / 1000).toFixed(1)}s
                      </span>
                    </div>

                    {/* Caption field */}
                    <Input
                      value={shot.caption ?? ""}
                      onChange={(e) => handleCaptionChange(shot.shot_id, e.target.value)}
                      placeholder="Add shot caption…"
                      className="text-sm"
                      aria-label={`Caption for shot ${index + 1}`}
                    />

                    {/* Bottom meta */}
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <rect x="2" y="2" width="20" height="20" rx="3" />
                          <path d="M2 8h20" />
                        </svg>
                        {CAMERA_LABELS[shot.camera_move] ?? shot.camera_move}
                      </span>
                      <span>·</span>
                      <span>{shot.transition_in === "fade" ? "Fade in" : "Cut"}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Arc label: end */}
      <div className="flex items-center gap-2 mt-1 mb-8 ml-8 pl-4">
        <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
        <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
          Story ends
        </span>
      </div>

      {/* CTA */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full sm:w-auto justify-center"
          onClick={() => router.push(`/projects/${projectId}/import`)}
        >
          ← Back to import
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto justify-center"
          onClick={handleRenderVideo}
          disabled={isQueueingRender || !sceneGraphId || shots.length === 0}
        >
          {isQueueingRender ? "Queueing render…" : "Render video"}
        </Button>
      </div>
    </div>
  );
}
