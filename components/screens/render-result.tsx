"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface RenderJobData {
  id: string;
  project_id: string;
  scene_graph_id: string;
  status: "queued" | "rendering" | "complete" | "failed";
  output_video_url: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface RenderResultProps {
  projectId: string;
  projectName: string;
  projectBrief: string;
  preset: string;
  duration: number;
  shotsCount: number;
  initialJob: RenderJobData | null;
  sceneGraphId: string | null;
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
      <div
        className="h-full bg-text-primary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function RenderResult({
  projectId,
  projectName,
  projectBrief,
  preset,
  duration,
  shotsCount,
  initialJob,
  sceneGraphId,
}: RenderResultProps) {
  const router = useRouter();
  const [job, setJob] = useState<RenderJobData | null>(initialJob);
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = job?.status ?? "queued";

  // Polling logic for queued/rendering jobs
  useEffect(() => {
    if (!job || status === "complete" || status === "failed") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/render/status/${job.id}`);
        if (res.ok) {
          const updatedJob: RenderJobData = await res.json();
          setJob(updatedJob);
        }
      } catch (err) {
        console.error("Polling status error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [job, status]);

  const handleRetry = useCallback(async () => {
    if (!sceneGraphId) return;

    try {
      setIsRetrying(true);
      const res = await fetch("/api/render/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, sceneGraphId }),
      });

      const data = await res.json();
      if (res.ok) {
        setJob({
          id: data.jobId,
          project_id: projectId,
          scene_graph_id: sceneGraphId,
          status: "queued",
          output_video_url: null,
          error_message: null,
          created_at: new Date().toISOString(),
          completed_at: null,
        });
      } else {
        alert(data.error ?? "Failed to retry render.");
      }
    } catch {
      alert("Network error retrying render.");
    } finally {
      setIsRetrying(false);
    }
  }, [projectId, sceneGraphId]);

  const handleCopyLink = useCallback(() => {
    if (!job?.output_video_url) return;
    navigator.clipboard.writeText(job.output_video_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [job?.output_video_url]);

  // 1. Rendering / Queued State
  if (status === "queued" || status === "rendering") {
    const progress = status === "queued" ? 25 : 65;
    const currentStep = status === "queued" ? "Preparing render queue" : "Compositing shots & rendering MP4";

    return (
      <div className="max-w-lg mx-auto text-center py-6">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-surface-2 border-t-text-primary animate-spin" />

        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Rendering your video
        </h2>
        <p className="text-sm text-text-muted mb-8">
          {projectName || "Project"} — {duration}s · {preset === "bold_launch" ? "Bold Launch" : "Clean SaaS"}
        </p>

        <div className="space-y-3">
          <ProgressBar percent={progress} />

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              {currentStep}
            </span>
            <span className="font-medium text-text-primary">{progress}%</span>
          </div>

          <p className="text-xs text-text-muted">
            {status === "queued" ? "Worker picking up job…" : "Rendering frames via Remotion worker…"}
          </p>
        </div>

        <div className="mt-10 space-y-0 text-left">
          {[
            { label: "Preparing frames & assets", done: true },
            { label: "Applying camera moves & captions", done: status === "rendering" },
            { label: "Encoding H.264 MP4 video", done: false, active: status === "rendering" },
            { label: "Uploading to storage", done: false },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-3 py-2">
              <div
                className={[
                  "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border",
                  step.done
                    ? "bg-text-primary border-text-primary"
                    : step.active
                      ? "border-text-primary bg-transparent"
                      : "border-border bg-transparent",
                ].join(" ")}
              >
                {step.done && (
                  <svg
                    className="w-3 h-3 text-surface-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {step.active && <div className="w-2 h-2 rounded-full bg-text-primary animate-ping" />}
              </div>
              <span
                className={[
                  "text-sm",
                  step.done
                    ? "text-text-secondary"
                    : step.active
                      ? "text-text-primary font-medium"
                      : "text-text-muted",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Failed State
  if (status === "failed") {
    return (
      <div className="max-w-lg mx-auto py-10 text-center space-y-6">
        <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-[var(--radius)] text-red-700 dark:text-red-300">
          <h2 className="text-base font-semibold mb-2">Video Render Failed</h2>
          <p className="text-sm">{job?.error_message ?? "An unexpected error occurred during video rendering."}</p>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push(`/projects/${projectId}/review`)}
          >
            ← Back to review
          </Button>
          <Button
            variant="primary"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? "Retrying…" : "Retry Render"}
          </Button>
        </div>
      </div>
    );
  }

  // 3. Complete State
  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Success indicator */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-text-primary flex items-center justify-center">
            <svg
              className="w-3 h-3 text-surface-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium text-text-primary">Ready</span>
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          {projectName || "Project Video"}
        </h2>
        {projectBrief && (
          <p className="text-sm text-text-muted mt-1 max-w-md mx-auto line-clamp-2">
            {projectBrief}
          </p>
        )}
      </div>

      {/* Real Video Player */}
      <div className="relative aspect-video bg-[#0a0a0a] rounded-[var(--radius)] overflow-hidden mb-6 border border-border shadow-xl">
        {job?.output_video_url ? (
          <video
            src={job.output_video_url}
            controls
            autoPlay
            loop
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            Video unavailable
          </div>
        )}
      </div>

      {/* Video metadata */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="subtle">
              {preset === "bold_launch" ? "Bold Launch" : "Clean SaaS"}
            </Badge>
            <span className="text-text-muted">·</span>
            <span className="text-text-secondary">{duration}s</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-secondary">{shotsCount} shots</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-secondary">1920 × 1080</span>
          </div>
          <Badge variant="default">MP4</Badge>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => {
              if (job?.output_video_url) {
                window.open(job.output_video_url, "_blank");
              }
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download MP4
          </Button>
          <Button variant="secondary" size="lg" onClick={handleCopyLink}>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}/review`)}
          >
            ← Back to shot review
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}/import`)}
          >
            Re-import project →
          </Button>
        </div>
      </div>
    </div>
  );
}
