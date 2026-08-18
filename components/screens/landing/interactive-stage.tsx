"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
  Code2,
  Sliders,
  CheckCircle2,
  Monitor,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface ShotState {
  id: string;
  beat: "hook" | "problem" | "reveal" | "highlight" | "payoff";
  title: string;
  cameraMove: string;
  zoom: number;
  panX: number;
  panY: number;
  durationMs: number;
  caption: string;
  focusElement: string;
}

const DEMO_SHOTS: ShotState[] = [
  {
    id: "s1",
    beat: "hook",
    title: "1. The high-stakes claim",
    cameraMove: "zoom_in_center",
    zoom: 1.45,
    panX: 0,
    panY: -15,
    durationMs: 4000,
    caption: "Stop losing deals to slow prototype feedback.",
    focusElement: "hero_metrics",
  },
  {
    id: "s2",
    beat: "problem",
    title: "2. The friction point",
    cameraMove: "pan_left_to_right",
    zoom: 1.6,
    panX: -45,
    panY: 30,
    durationMs: 3500,
    caption: "Static decks fail to communicate fluid interaction.",
    focusElement: "feedback_table",
  },
  {
    id: "s3",
    beat: "reveal",
    title: "3. The core mechanism",
    cameraMove: "ken_burns_subtle",
    zoom: 1.35,
    panX: 40,
    panY: -20,
    durationMs: 4500,
    caption: "One-click narrative timeline from Figma frames.",
    focusElement: "timeline_engine",
  },
  {
    id: "s4",
    beat: "highlight",
    title: "4. The key micro-moment",
    cameraMove: "zoom_out",
    zoom: 1.7,
    panX: 20,
    panY: 60,
    durationMs: 4000,
    caption: "Sub-pixel vector interpolation rendered at 60fps.",
    focusElement: "render_graph",
  },
  {
    id: "s5",
    beat: "payoff",
    title: "5. The closing resolution",
    cameraMove: "zoom_in_center",
    zoom: 1.15,
    panX: 0,
    panY: 0,
    durationMs: 4000,
    caption: "Motion graphics that sell the product vision.",
    focusElement: "export_card",
  },
];

export function InteractiveStage() {
  const [activeShotIndex, setActiveShotIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<"narrative" | "figma" | "remotion">("narrative");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");

  const stageRef = useRef<HTMLDivElement>(null);
  const cameraViewportRef = useRef<HTMLDivElement>(null);
  const playheadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentShot = DEMO_SHOTS[activeShotIndex];

  // GSAP Camera Move on shot change
  useGSAP(
    () => {
      if (!cameraViewportRef.current) return;

      gsap.to(cameraViewportRef.current, {
        scale: currentShot.zoom,
        x: currentShot.panX,
        y: currentShot.panY,
        duration: 1.2,
        ease: "power2.out",
      });

      // Animate caption entrance
      gsap.fromTo(
        ".live-caption-text",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power1.out" }
      );
    },
    { dependencies: [activeShotIndex], scope: stageRef }
  );

  // Auto-play loop across shots
  useEffect(() => {
    if (!isPlaying) {
      if (playheadIntervalRef.current) clearInterval(playheadIntervalRef.current);
      return;
    }

    playheadIntervalRef.current = setInterval(() => {
      setActiveShotIndex((prev) => (prev + 1) % DEMO_SHOTS.length);
    }, currentShot.durationMs);

    return () => {
      if (playheadIntervalRef.current) clearInterval(playheadIntervalRef.current);
    };
  }, [isPlaying, currentShot.durationMs]);

  const togglePlay = () => setIsPlaying((p) => !p);

  return (
    <section id="interactive-demo" ref={stageRef} className="py-12 md:py-20 px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <Badge variant="outline" className="mb-3 font-mono text-[11px]">
          Interactive Simulator
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
          See the narrative engine in action
        </h2>
        <p className="text-sm sm:text-base text-text-muted max-w-xl">
          Unlike ordinary screen recorders, UI Animator orchestrates camera choreography, visual focus,
          and precise pacing around your story.
        </p>
      </div>

      {/* Simulator Workspace Card */}
      <div className="rounded-xl border border-border bg-surface-1/80 backdrop-blur-sm overflow-hidden shadow-sm">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-0/60 text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-surface-2/60 border border-border">
            <button
              onClick={() => setActiveTab("narrative")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeTab === "narrative"
                  ? "bg-surface-0 text-text-primary shadow-xs font-medium"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Narrative scene graph</span>
            </button>
            <button
              onClick={() => setActiveTab("figma")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeTab === "figma"
                  ? "bg-surface-0 text-text-primary shadow-xs font-medium"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Figma frame parser</span>
            </button>
            <button
              onClick={() => setActiveTab("remotion")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeTab === "remotion"
                  ? "bg-surface-0 text-text-primary shadow-xs font-medium"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Remotion composition</span>
            </button>
          </div>

          {/* Right actions: Aspect ratio toggle & playhead */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] text-text-muted font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>60.0 FPS</span>
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-md bg-surface-2/60 border border-border">
              <button
                onClick={() => setAspectRatio("16:9")}
                className={`p-1 rounded ${
                  aspectRatio === "16:9"
                    ? "bg-surface-0 text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="Widescreen (16:9)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`p-1 rounded ${
                  aspectRatio === "9:16"
                    ? "bg-surface-0 text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
                title="Vertical Social (9:16)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
          {/* Left Column: Interactive Beats List or Tab Inspector */}
          <div className="lg:col-span-5 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between bg-surface-0/30">
            {activeTab === "narrative" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary uppercase tracking-wider text-[11px]">
                    Story narrative arc
                  </span>
                  <span className="text-[11px] font-mono text-text-muted">
                    {activeShotIndex + 1} of {DEMO_SHOTS.length} shots
                  </span>
                </div>

                <div className="space-y-2">
                  {DEMO_SHOTS.map((shot, idx) => {
                    const isSelected = activeShotIndex === idx;
                    return (
                      <button
                        key={shot.id}
                        onClick={() => {
                          setActiveShotIndex(idx);
                          setIsPlaying(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all duration-150 flex items-start justify-between gap-3 ${
                          isSelected
                            ? "bg-surface-0 border-accent/60 shadow-xs"
                            : "bg-surface-1/50 border-border hover:bg-surface-1 hover:border-border-strong"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded ${
                                shot.beat === "hook"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : shot.beat === "payoff"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-surface-2 text-text-secondary border border-border"
                              }`}
                            >
                              {shot.beat}
                            </span>
                            <span className="text-xs font-medium text-text-primary">
                              {shot.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted line-clamp-1">
                            &quot;{shot.caption}&quot;
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-text-muted">
                            {(shot.durationMs / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "figma" && (
              <div className="space-y-3 font-mono text-xs text-text-secondary">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-semibold text-text-primary">Parsed Figma Node Tree</span>
                  <span className="text-[10px] text-emerald-500">200 OK</span>
                </div>
                <div className="p-3 rounded-md bg-surface-0 border border-border space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-text-muted">Document:</span> &quot;SaaS Analytics v3.2&quot;
                  </div>
                  <div>
                    <span className="text-text-muted">Extracted frames:</span> 5 included
                  </div>
                  <div>
                    <span className="text-text-muted">Vector fidelity:</span> 2x retina SVGs
                  </div>
                  <div>
                    <span className="text-text-muted">Autolayout stacks:</span> Normalized
                  </div>
                </div>
                <div className="space-y-1 pt-2">
                  <div className="text-[11px] text-text-muted">Active frame coordinates:</div>
                  <pre className="p-3 rounded-md bg-surface-2/40 border border-border text-[10px] overflow-x-auto text-text-primary">
{`{
  "frame_id": "${currentShot.id}",
  "beat": "${currentShot.beat}",
  "camera": {
    "zoom": ${currentShot.zoom},
    "pan_x": ${currentShot.panX},
    "pan_y": ${currentShot.panY}
  },
  "easing": "easeInOutCubic"
}`}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === "remotion" && (
              <div className="space-y-3 font-mono text-xs text-text-secondary">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-semibold text-text-primary">Remotion Sequence Code</span>
                  <span className="text-[10px] text-text-muted">VideoComposition.tsx</span>
                </div>
                <pre className="p-3 rounded-md bg-surface-0 border border-border text-[10px] leading-relaxed text-text-primary overflow-x-auto">
{`<Sequence from={${activeShotIndex * 120}} durationInFrames={${(currentShot.durationMs / 1000) * 60}}>
  <CameraTransition
    zoom={interpolate(frame, [0, 60], [1.0, ${currentShot.zoom}])}
    panX={spring({ frame, fps: 60, config: { damping: 14 } })}
    caption="${currentShot.caption}"
    beat="${currentShot.beat}"
  />
</Sequence>`}
                </pre>
                <p className="text-[11px] text-text-muted">
                  Deterministic frame-by-frame rendering with zero frame drops or browser throttling.
                </p>
              </div>
            )}

            {/* Bottom active telemetry details */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
              <div className="flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-text-secondary" />
                <span className="font-mono">{currentShot.cameraMove}</span>
              </div>
              <div className="font-mono">
                Zoom: <span className="text-text-primary">{currentShot.zoom}x</span>
              </div>
              <div className="font-mono">
                Duration: <span className="text-text-primary">{currentShot.durationMs}ms</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Motion Graphic Viewport */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col items-center justify-center bg-surface-0/60 relative overflow-hidden">
            {/* Viewport Frame Container */}
            <div
              className={`relative border border-border-strong rounded-lg overflow-hidden bg-surface-0 shadow-lg transition-all duration-300 ${
                aspectRatio === "16:9"
                  ? "w-full aspect-[16/9] max-w-[500px]"
                  : "w-[240px] aspect-[9/16]"
              }`}
            >
              {/* Simulated UI Screen being animated */}
              <div
                ref={cameraViewportRef}
                className="w-full h-full p-4 sm:p-5 flex flex-col justify-between origin-center transition-transform"
              >
                {/* Mock UI App Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/80 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span className="font-bold text-text-primary">Acme Analytics</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-[9px]">
                    +34.2% MRR
                  </span>
                </div>

                {/* Mock UI Body Content */}
                <div className="grid grid-cols-2 gap-2 my-auto">
                  <div className="p-2.5 rounded bg-surface-1 border border-border space-y-1">
                    <span className="text-[9px] text-text-muted">Monthly active users</span>
                    <div className="text-sm font-bold text-text-primary">128,450</div>
                    <div className="w-full h-1 rounded bg-accent/20 overflow-hidden">
                      <div className="w-3/4 h-full bg-accent" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-surface-1 border border-border space-y-1">
                    <span className="text-[9px] text-text-muted">Conversion velocity</span>
                    <div className="text-sm font-bold text-text-primary">4.8s avg</div>
                    <div className="w-full h-1 rounded bg-emerald-500/20 overflow-hidden">
                      <div className="w-4/5 h-full bg-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Mock UI Activity Strip */}
                <div className="p-2 rounded bg-surface-2/40 border border-border flex items-center justify-between text-[9px] text-text-muted">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Figma live prototype connected</span>
                  </div>
                  <span className="font-mono">Node #429</span>
                </div>
              </div>

              {/* Dynamic Camera Focus Target Overlay */}
              <div className="absolute inset-0 pointer-events-none border border-accent/20 rounded-lg flex items-center justify-center">
                <div className="absolute top-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-0/80 backdrop-blur-xs text-text-muted border border-border">
                  REC ● 60FPS
                </div>

                {/* Live Subtitle / Narrative Caption Bar */}
                <div className="absolute bottom-3 inset-x-4 px-3 py-2 rounded-md bg-surface-0/95 backdrop-blur-sm border border-border shadow-sm text-center">
                  <span className="live-caption-text text-xs font-semibold text-text-primary block">
                    {currentShot.caption}
                  </span>
                </div>
              </div>
            </div>

            {/* Playback Controls & Scrubber */}
            <div className="w-full max-w-[500px] mt-4 flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-md bg-surface-2 hover:bg-surface-1 text-text-primary border border-border transition-colors cursor-pointer"
                title={isPlaying ? "Pause simulation" : "Play simulation"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setActiveShotIndex(0);
                  setIsPlaying(true);
                }}
                className="p-2 rounded-md bg-surface-2 hover:bg-surface-1 text-text-muted hover:text-text-primary border border-border transition-colors cursor-pointer"
                title="Restart playback"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Timeline Track */}
              <div className="flex-1 flex gap-1 h-2 rounded bg-surface-2 p-0.5 border border-border">
                {DEMO_SHOTS.map((shot, idx) => {
                  const isCurrent = activeShotIndex === idx;
                  const isPast = activeShotIndex > idx;
                  return (
                    <button
                      key={shot.id}
                      onClick={() => {
                        setActiveShotIndex(idx);
                        setIsPlaying(false);
                      }}
                      className={`h-full flex-1 rounded-xs transition-all ${
                        isCurrent
                          ? "bg-accent"
                          : isPast
                          ? "bg-accent/40"
                          : "bg-surface-0/40 hover:bg-surface-0"
                      }`}
                      title={`Jump to ${shot.beat}`}
                    />
                  );
                })}
              </div>

              <span className="text-[11px] font-mono text-text-muted shrink-0">
                00:0{activeShotIndex * 4} / 00:20
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
