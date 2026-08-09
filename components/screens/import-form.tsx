"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FigmaConnectionCard } from "./figma-connection-card";
import { FrameGrid } from "./frame-grid";
import type { FrameRow } from "@/lib/supabase/types";

interface ImportFormProps {
  projectId: string;
  isConnected: boolean;
  figmaUserName: string | null;
  initialFrames: Array<FrameRow & { thumbnail_url: string | null }>;
  initialBrief: string;
  initialStylePreset: string;
  initialDuration: number;
  supabaseUrl: string;
}

type ImportState =
  | { status: "idle" }
  | { status: "importing" }
  | { status: "success"; frameCount: number }
  | { status: "error"; message: string };

type GenerateState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "error"; message: string };

const GENERATION_STEPS = [
  "Analyzing frames & visual hierarchy…",
  "Structuring hook, reveal, and payoff beats…",
  "Writing captions & setting camera motion…",
  "Finalizing shot list & validation…",
];

export function ImportForm({
  projectId,
  isConnected,
  figmaUserName,
  initialFrames,
  initialBrief,
  initialStylePreset,
  initialDuration,
  supabaseUrl,
}: ImportFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [figmaUrl, setFigmaUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [importState, setImportState] = useState<ImportState>({
    status: "idle",
  });

  const [frames, setFrames] = useState(initialFrames);
  const [brief, setBrief] = useState(initialBrief);
  const [briefError, setBriefError] = useState<string | null>(null);

  const [stylePreset, setStylePreset] = useState(initialStylePreset);
  const [duration, setDuration] = useState(String(initialDuration));

  const [generateState, setGenerateState] = useState<GenerateState>({
    status: "idle",
  });
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // OAuth callback feedback
  const [oauthFeedback, setOauthFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const returnUrl = `/projects/${projectId}/import`;

  // Read OAuth result from URL params on mount
  useEffect(() => {
    const connected = searchParams.get("figma_connected");
    const error = searchParams.get("figma_error");

    if (connected === "true") {
      setOauthFeedback({
        type: "success",
        message: "Figma account connected successfully!",
      });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        access_denied: "You declined the Figma connection request.",
        missing_params: "OAuth callback was missing required parameters.",
        invalid_state: "Security validation failed — please try connecting again.",
        not_authenticated: "You must be logged in to connect Figma.",
        token_exchange_failed: "Failed to complete Figma authorization.",
      };
      const details = searchParams.get("details");
      const baseMsg = errorMessages[error] ?? `Figma connection failed: ${error}`;
      setOauthFeedback({
        type: "error",
        message: details ? `${baseMsg}: ${decodeURIComponent(details)}` : baseMsg,
      });
    }

    // Clean OAuth params from URL without a full reload
    if (connected || error) {
      const url = new URL(window.location.href);
      url.searchParams.delete("figma_connected");
      url.searchParams.delete("figma_error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  // Auto-dismiss success feedback after 5 seconds
  useEffect(() => {
    if (oauthFeedback?.type !== "success") return;
    const timer = setTimeout(() => setOauthFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [oauthFeedback]);

  // Cycle loading steps during generation
  useEffect(() => {
    if (generateState.status !== "generating") return;

    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % GENERATION_STEPS.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [generateState.status]);

  const handleImport = useCallback(async () => {
    if (!figmaUrl.trim()) {
      setUrlError("Please paste a Figma link");
      return;
    }

    const figmaUrlPattern =
      /^https?:\/\/(?:www\.)?figma\.com\/(?:design|file)\/[a-zA-Z0-9]+/;
    if (!figmaUrlPattern.test(figmaUrl)) {
      setUrlError(
        "Please paste a valid Figma file or design URL (e.g. figma.com/design/...)",
      );
      return;
    }

    setUrlError(null);
    setImportState({ status: "importing" });

    try {
      if (brief.trim()) {
        await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief }),
        });
      }

      const response = await fetch("/api/figma/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figmaUrl, projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setImportState({
          status: "error",
          message: data.error ?? "Import failed",
        });
        return;
      }

      setFrames(data.frames);
      setImportState({
        status: "success",
        frameCount: data.frameCount,
      });
    } catch {
      setImportState({
        status: "error",
        message: "Network error — please check your connection and try again.",
      });
    }
  }, [figmaUrl, projectId, brief]);

  const handleGenerateSceneGraph = useCallback(async () => {
    const trimmedBrief = brief.trim();
    const wordCount = trimmedBrief ? trimmedBrief.split(/\s+/).filter(Boolean).length : 0;

    if (!trimmedBrief) {
      setBriefError("Project brief is required to generate a scene graph.");
      return;
    }

    if (wordCount < 10) {
      setBriefError(
        `Project brief is too short (${wordCount} words). Please write at least 10 words describing what your product does and why it matters.`,
      );
      return;
    }

    setBriefError(null);
    setLoadingStepIndex(0);
    setGenerateState({ status: "generating" });

    try {
      const patchRes = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: trimmedBrief,
          style_preset: stylePreset,
          duration_seconds: parseInt(duration, 10),
        }),
      });

      if (!patchRes.ok) {
        const patchData = await patchRes.json();
        setGenerateState({
          status: "error",
          message: patchData.error ?? "Failed to save project settings.",
        });
        return;
      }

      const genRes = await fetch("/api/scene-graph/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const genData = await genRes.json();

      if (!genRes.ok) {
        setGenerateState({
          status: "error",
          message: genData.error ?? "Scene graph generation failed.",
        });
        return;
      }

      router.push(`/projects/${projectId}/review`);
    } catch (err) {
      setGenerateState({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "An error occurred while generating the scene graph.",
      });
    }
  }, [brief, stylePreset, duration, projectId, router]);

  const includedCount = frames.filter((f) => f.included).length;

  return (
    <div className="space-y-8">
      {/* OAuth feedback banner */}
      {oauthFeedback && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-[var(--radius)] text-sm transition-all ${
            oauthFeedback.type === "success"
              ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {oauthFeedback.type === "success" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            <span>{oauthFeedback.message}</span>
          </div>
          <button
            onClick={() => setOauthFeedback(null)}
            className="ml-4 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Figma connection */}
      <FigmaConnectionCard
        isConnected={isConnected}
        figmaUserName={figmaUserName}
        returnUrl={returnUrl}
      />

      {/* Figma link input */}
      <Card>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Figma prototype link"
              placeholder="https://www.figma.com/design/…"
              type="url"
              value={figmaUrl}
              onChange={(e) => {
                setFigmaUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
              onBlur={() => {
                if (
                  figmaUrl.trim() &&
                  !/^https?:\/\/(?:www\.)?figma\.com\/(?:design|file)\/[a-zA-Z0-9]+/.test(
                    figmaUrl,
                  )
                ) {
                  setUrlError("Please paste a valid Figma file or design URL");
                }
              }}
              error={urlError ?? undefined}
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleImport}
            disabled={importState.status === "importing"}
          >
            {importState.status === "importing" ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Importing…
              </>
            ) : (
              "Import frames"
            )}
          </Button>
        </div>

        {importState.status === "error" && (
          <div className="mt-3 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-[var(--radius)] text-sm text-red-700 dark:text-red-400">
            {importState.message}
          </div>
        )}
        {importState.status === "success" && (
          <div className="mt-3 px-3 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-[var(--radius)] text-sm text-green-700 dark:text-green-400">
            Imported {importState.frameCount} frames successfully
          </div>
        )}
      </Card>

      {/* Project brief */}
      <Card className="border-border-strong">
        <div className="flex items-start gap-2 mb-1">
          <h2 className="text-sm font-semibold text-text-primary">
            Project brief
          </h2>
          <Badge variant="outline">Required</Badge>
        </div>
        <Textarea
          hint="This is what turns your video from a screen tour into a story. Without it, the AI only knows what your screens look like — not why they matter."
          placeholder="What is this product? Who's it for? What's the one thing that makes it worth someone's attention?"
          rows={4}
          required
          value={brief}
          onChange={(e) => {
            setBrief(e.target.value);
            if (briefError) setBriefError(null);
          }}
          error={briefError ?? undefined}
        />
      </Card>

      {/* Frame grid */}
      <FrameGrid initialFrames={frames} supabaseUrl={supabaseUrl} />

      {/* Video settings */}
      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-4">
          Video settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Style preset"
            options={[
              { value: "clean_saas", label: "Clean SaaS" },
              { value: "bold_launch", label: "Bold product launch" },
            ]}
            value={stylePreset}
            onChange={(e) => setStylePreset(e.target.value)}
          />
          <Select
            label="Duration"
            options={[
              { value: "15", label: "15 seconds" },
              { value: "30", label: "30 seconds" },
              { value: "60", label: "60 seconds" },
            ]}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </Card>

      {/* Scene Generation Error Display */}
      {generateState.status === "error" && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-[var(--radius)] text-sm text-red-700 dark:text-red-300">
          <p className="font-semibold mb-1">Scene Graph Generation Failed</p>
          <p>{generateState.message}</p>
        </div>
      )}

      {/* CTA Section */}
      <div className="flex flex-col items-end pt-2 space-y-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerateSceneGraph}
          disabled={
            includedCount < 3 ||
            !brief.trim() ||
            generateState.status === "generating"
          }
        >
          {generateState.status === "generating" ? (
            <>
              <svg
                className="w-4 h-4 animate-spin mr-1"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {GENERATION_STEPS[loadingStepIndex]}
            </>
          ) : (
            "Generate scene graph"
          )}
        </Button>

        {includedCount < 3 && (
          <p className="text-xs text-text-muted">
            {includedCount === 0
              ? "Select at least 3 frames above to generate a scene graph"
              : `Only ${includedCount} frame${includedCount === 1 ? "" : "s"} selected. Select at least 3 frames`}
          </p>
        )}
      </div>
    </div>
  );
}
