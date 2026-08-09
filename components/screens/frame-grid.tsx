"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import type { FrameRow } from "@/lib/supabase/types";

interface FrameGridProps {
  initialFrames: Array<
    FrameRow & { thumbnail_url: string | null }
  >;
  supabaseUrl: string;
}

/**
 * Frame grid with real thumbnails and include/exclude toggles.
 * Optimistic updates with smooth transitions and keyboard accessibility.
 */
export function FrameGrid({ initialFrames, supabaseUrl }: FrameGridProps) {
  const [frames, setFrames] = useState(initialFrames);

  const toggleIncluded = useCallback(
    async (frameId: string) => {
      setFrames((prev) =>
        prev.map((f) =>
          f.id === frameId ? { ...f, included: !f.included } : f,
        ),
      );

      const frame = frames.find((f) => f.id === frameId);
      if (!frame) return;

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

  if (frames.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-[var(--radius)]">
        <p className="text-sm text-text-muted">
          No frames imported yet. Paste a Figma link above and click "Import frames."
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Imported frames
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {includedCount} of {frames.length} frames selected
          </p>
        </div>
        <button
          className="text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent rounded px-1.5 py-0.5"
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
                  "group relative rounded-[var(--radius)] border cursor-pointer select-none",
                  "transition-all duration-200 ease-in-out transform hover:-translate-y-0.5",
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
                {/* Thumbnail */}
                <div className="relative aspect-video bg-surface-2 rounded-t-[calc(var(--radius)-1px)] overflow-hidden">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={frame.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-text-muted opacity-30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 16l5-5 4 4 4-6 5 7" />
                      </svg>
                    </div>
                  )}

                  {/* Include / exclude toggle */}
                  <button
                    className={[
                      "absolute top-2 right-2 w-5 h-5 rounded-[4px] border flex items-center justify-center",
                      "transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent",
                      isIncluded
                        ? "bg-text-primary border-text-primary text-surface-0"
                        : "bg-surface-0 border-border-strong hover:border-text-muted",
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
                <div className="px-3 py-2.5">
                  <p className="text-sm font-medium text-text-primary truncate">
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
