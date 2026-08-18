"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function LandingStoryVsTour() {
  const [activeView, setActiveView] = useState<"story" | "tour">("story");

  return (
    <section id="how-it-works" className="py-24 px-6 bg-surface-1 border-b border-border/40">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Badge variant="outline" className="border-border px-3 py-1 text-xs font-mono text-text-secondary">
            Philosophy
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
            The difference between a demo and a pitch.
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-[55ch] mx-auto leading-relaxed">
            Strangers on social feeds do not care how your buttons are wired. They care what problem you solve.
          </p>

          {/* Interactive Toggle */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1 rounded-xl bg-surface-0 border border-border">
              <button
                onClick={() => setActiveView("story")}
                className={`px-5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeView === "story"
                    ? "bg-accent text-white shadow-sm font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                UI Animator (Narrative Arc)
              </button>
              <button
                onClick={() => setActiveView("tour")}
                className={`px-5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeView === "tour"
                    ? "bg-surface-2 text-text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Generic Screen Tour
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column High Contrast Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Traditional Screen Tour */}
          <div
            className={`rounded-2xl p-8 border transition-all duration-300 ${
              activeView === "tour"
                ? "bg-surface-0 border-border/80 shadow-xl opacity-100 scale-[1.01]"
                : "bg-surface-0/50 border-border/40 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-6">
              <span className="text-sm font-mono text-text-muted">The Typical Approach</span>
              <span className="text-xs text-red-400 font-mono">Low Retention</span>
            </div>

            <h3 className="text-xl font-semibold text-text-primary mb-4">
              A chronological click-through
            </h3>

            <ul className="space-y-4 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-mono mt-0.5">✕</span>
                <span>Shows screen 1, then screen 2, then screen 3 with zero storytelling context.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-mono mt-0.5">✕</span>
                <span>Captions read like manual instructions: &ldquo;Click here to open dashboard&rdquo;.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-mono mt-0.5">✕</span>
                <span>Viewers drop off in the first 4 seconds because there is no hook.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-mono mt-0.5">✕</span>
                <span>Requires hours in After Effects or Premiere to manually keyframe.</span>
              </li>
            </ul>
          </div>

          {/* Column 2: UI Animator Story Engine */}
          <div
            className={`rounded-2xl p-8 border transition-all duration-300 ${
              activeView === "story"
                ? "bg-surface-0 border-accent/60 shadow-2xl ring-1 ring-accent/20 opacity-100 scale-[1.01]"
                : "bg-surface-0/50 border-border/40 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-6">
              <span className="text-sm font-mono text-accent font-medium">UI Animator Engine</span>
              <span className="text-xs text-emerald-400 font-mono">High Conversion</span>
            </div>

            <h3 className="text-xl font-semibold text-text-primary mb-4">
              A 5-beat social video pitch
            </h3>

            <ul className="space-y-4 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-mono mt-0.5">✓</span>
                <span>Starts with a high-tension Hook that commands attention in feed algorithms.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-mono mt-0.5">✓</span>
                <span>AI director extracts the project brief to write persuasive, benefit-first copy.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-mono mt-0.5">✓</span>
                <span>Camera moves (Ken Burns, dynamic zooms) match the emotional intensity of each beat.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-mono mt-0.5">✓</span>
                <span>Renders broadcast-ready 1080p MP4 via Remotion in seconds.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
