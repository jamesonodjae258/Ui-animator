"use client";

import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import type { FrameRow } from "@/lib/supabase/types";

interface FrameGridProps {
  initialFrames: Array<
    FrameRow & { thumbnail_url: string | null }
  >;
  supabaseUrl: string;
}

// MOCK DATA — Stage 2 mock frame thumbnails for static review
const MOCK_FRAMES: Array<FrameRow & { thumbnail_url: string | null; iconType?: string }> = [
  { id: "mock-1", project_id: "mock", figma_node_id: "1:1", name: "01 - Hero & Value Prop", order_in_flow: 0, thumbnail_storage_path: null, included: true, created_at: "", thumbnail_url: null, iconType: "layout" },
  { id: "mock-2", project_id: "mock", figma_node_id: "1:2", name: "02 - Friction / Current State", order_in_flow: 1, thumbnail_storage_path: null, included: true, created_at: "", thumbnail_url: null, iconType: "alert" },
  { id: "mock-3", project_id: "mock", figma_node_id: "1:3", name: "03 - Product Solution", order_in_flow: 2, thumbnail_storage_path: null, included: true, created_at: "", thumbnail_url: null, iconType: "sparkle" },
  { id: "mock-4", project_id: "mock", figma_node_id: "1:4", name: "04 - Feature Walkthrough", order_in_flow: 3, thumbnail_storage_path: null, included: true, created_at: "", thumbnail_url: null, iconType: "sliders" },
  { id: "mock-5", project_id: "mock", figma_node_id: "1:5", name: "05 - Deep Dive Action", order_in_flow: 4, thumbnail_storage_path: null, included: true, created_at: "", thumbnail_url: null, iconType: "chart" },
  { id: "mock-6", project_id: "mock", figma_node_id: "1:6", name: "06 - Advanced Settings", order_in_flow: 5, thumbnail_storage_path: null, included: false, created_at: "", thumbnail_url: null, iconType: "gear" },
  { id: "mock-7", project_id: "mock", figma_node_id: "1:7", name: "07 - Metric Improvements", order_in_flow: 6, thumbnail_storage_path: null, included: true, created_at: "", thumbnail_url: null, iconType: "trending" },
  { id: "mock-8", project_id: "mock", figma_node_id: "1:8", name: "08 - Final CTA / Payoff", order_in_flow: 7, thumbnail_storage_path: null, included: true, created_at: "", thumbnail_url: null, iconType: "check" },
];

function FramePlaceholderIcon({ iconType }: { iconType?: string }) {
  switch (iconType) {
    case "layout":
      return (
        <svg className="w-8 h-8 opacity-40 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    case "alert":
      return (
        <svg className="w-8 h-8 opacity-40 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "sparkle":
      return (
        <svg className="w-8 h-8 opacity-40 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
        </svg>
      );
    case "sliders":
      return (
        <svg className="w-8 h-8 opacity-40 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      );
    case "chart":
      return (
        <svg className="w-8 h-8 opacity-40 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "gear":
      return (
        <svg className="w-8 h-8 opacity-40 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "trending":
      return (
        <svg className="w-8 h-8 opacity-40 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-8 opacity-40 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
  }
}

/**
 * Frame grid with real thumbnails and include/exclude toggles.
 * When no frames are imported yet, displays 8 mock frames for static Stage 2 review.
 */
export function FrameGrid({ initialFrames, supabaseUrl }: FrameGridProps) {
  const [frames, setFrames] = useState(
    initialFrames && initialFrames.length > 0 ? initialFrames : MOCK_FRAMES
  );

  useEffect(() => {
    if (initialFrames && initialFrames.length > 0) {
      setFrames(initialFrames);
    }
  }, [initialFrames]);

  const toggleIncluded = useCallback(
    async (frameId: string) => {
      setFrames((prev) =>
        prev.map((f) =>
          f.id === frameId ? { ...f, included: !f.included } : f,
        ),
      );

      const frame = frames.find((f) => f.id === frameId);
      if (!frame || frame.id.startsWith("mock-")) return;

      try {
        const response = await fetch(`/api/figma/frames/${frameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ included: !frame.included }),
        });

        if (!response.ok) {
          setFrames((prev) =>
            prev.map((f) =>
              f.id === frameId ? { ...f, included: frame.included } : f,
            ),
          );
        }
      } catch {
        setFrames((prev) =>
          prev.map((f) =>
            f.id === frameId ? { ...f, included: frame.included } : f,
          ),
        );
      }
    },
    [frames],
  );

  const includedCount = frames.filter((f) => f.included).length;
  const shotNumber = (frameId: string): number | null => {
    const includedFrames = frames
      .filter((f) => f.included)
      .sort((a, b) => a.order_in_flow - b.order_in_flow);
    const index = includedFrames.findIndex((f) => f.id === frameId);
    return index >= 0 ? index + 1 : null;
  };

  const isMockData = frames.some((f) => f.id.startsWith("mock-"));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-text-primary">
            {isMockData ? "Prototype frames (Preview)" : "Imported frames"}
          </h2>
          {isMockData && <Badge variant="neutral">Mock data</Badge>}
          <span className="text-xs text-text-muted">
            · {includedCount} of {frames.length} frames selected
          </span>
        </div>
        <button
          className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded px-1.5 py-0.5"
          onClick={() => {
            const allIncluded = frames.every((f) => f.included);
            setFrames((prev) =>
              prev.map((f) => ({ ...f, included: !allIncluded })),
            );
          }}
        >
          {frames.every((f) => f.included) ? "Deselect all" : "Select all"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {frames
          .sort((a, b) => a.order_in_flow - b.order_in_flow)
          .map((frame) => {
            const isIncluded = frame.included;
            const shot = shotNumber(frame.id);
            const thumbnailUrl =
              frame.thumbnail_url ??
              (frame.thumbnail_storage_path
                ? `${supabaseUrl}/storage/v1/object/public/frame-thumbnails/${frame.thumbnail_storage_path}`
                : null);

            return (
              <div
                key={frame.id}
                onClick={() => toggleIncluded(frame.id)}
                className={[
                  "group relative rounded-xl border cursor-pointer select-none overflow-hidden",
                  "transition-all duration-150 ease-in-out transform hover:-translate-y-0.5",
                  isIncluded
                    ? "border-border-strong bg-surface-0 shadow-sm"
                    : "border-border bg-surface-1 opacity-50 hover:opacity-75",
                ].join(" ")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleIncluded(frame.id);
                  }
                }}
              >
                {/* Thumbnail / Placeholder */}
                <div className="relative aspect-video bg-surface-2 flex items-center justify-center overflow-hidden">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={frame.name}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-2 p-2">
                      <FramePlaceholderIcon
                        iconType={(frame as { iconType?: string }).iconType}
                      />
                    </div>
                  )}

                  {/* Include / exclude toggle */}
                  <button
                    className={[
                      "absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center",
                      "transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]",
                      isIncluded
                        ? "bg-fill-primary border-fill-primary text-on-primary"
                        : "bg-surface-0 border-border hover:border-border-strong",
                    ].join(" ")}
                    aria-label={isIncluded ? "Exclude frame" : "Include frame"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleIncluded(frame.id);
                    }}
                  >
                    {isIncluded && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Shot badge */}
                  {isIncluded && shot !== null && (
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="strong">Shot {shot}</Badge>
                    </div>
                  )}
                </div>

                {/* Frame name */}
                <div className="px-3 py-2.5 bg-surface-0 border-t border-border">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {frame.name}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
