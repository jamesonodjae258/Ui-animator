"use client";

import { useState } from "react";
import { Check, X, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingComparisonSection() {
  const [selectedView, setSelectedView] = useState<"narrative" | "generic">("narrative");

  return (
    <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <Badge variant="outline" className="mb-3 font-mono text-[11px]">
          The UI Animator difference
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
          Why traditional screen tours fall flat
        </h2>
        <p className="text-sm sm:text-base text-text-muted max-w-xl">
          Screen recordings show where buttons are located. UI Animator tells why your product matters.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Generic Screen Recording */}
        <div className="p-6 sm:p-8 rounded-xl border border-border bg-surface-1/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-text-muted">
              <X className="w-4 h-4 text-red-500" />
              <span>Standard screen recording</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-3">
              Aimless clicking & wandering cursors
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
              Shows raw UI screens in literal chronological order without narrative pacing. Viewers lose
              interest in the first 5 seconds before reaching the core value prop.
            </p>

            <ul className="space-y-2.5 text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>No storytelling hook — opens on a boring login screen</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Chaotic mouse jitter and distracting misclicks</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Browser video encoding compression and dropped frames</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Weak or missing closing resolution</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 p-3 rounded-lg bg-surface-0 border border-border/80 text-[11px] font-mono text-text-muted">
            Average retention: &lt; 6 seconds
          </div>
        </div>

        {/* Card: UI Animator Narrative Graphic */}
        <div className="p-6 sm:p-8 rounded-xl border border-border-strong bg-surface-1/90 flex flex-col justify-between relative shadow-sm">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Recommended</span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-emerald-500">
              <Check className="w-4 h-4" />
              <span>UI Animator narrative graphic</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-3">
              Cinematic storytelling with intentional beats
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
              Frames are choreographed around an emotional arc: hook claim, problem tension, core workflow
              reveal, and decisive payoff with crisp captions.
            </p>

            <ul className="space-y-2.5 text-xs text-text-primary">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Instant scroll-stopping hook on the strongest visual</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Camera zooms directly to relevant UI interaction hotspots</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Crisp 60fps deterministic Remotion video export</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Confident closing payoff that converts viewers</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 p-3 rounded-lg bg-surface-0 border border-border flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              High social engagement
            </span>
            <span className="text-text-muted">1080p60 MP4</span>
          </div>
        </div>
      </div>
    </section>
  );
}
