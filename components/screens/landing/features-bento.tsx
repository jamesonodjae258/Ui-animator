"use client";

import { useRef } from "react";
import {
  Sparkles,
  Camera,
  Cpu,
  Smartphone,
  ShieldCheck,
  Zap,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function LandingFeaturesBento() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".bento-card", {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-14">
        <Badge variant="outline" className="mb-3 font-mono text-[11px]">
          Engineered for storytelling
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
          Built for high-converting product demos
        </h2>
        <p className="text-sm sm:text-base text-text-muted max-w-xl">
          We replaced generic screen recording tours with intentional cinematic directing.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Narrative Beat Engine (Span 2 Cols) */}
        <div className="bento-card md:col-span-2 p-6 sm:p-7 rounded-xl border border-border bg-surface-1/70 flex flex-col justify-between relative overflow-hidden group hover:border-border-strong transition-all">
          <div className="space-y-3 z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-0 border border-border text-xs font-medium text-text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Narrative beat planner</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary">
              Storytelling structure, not a boring screen sequence
            </h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Every shot is placed according to narrative tension: an arresting hook beat, an optional
              problem state, core feature reveals, and a confident payoff resolution.
            </p>
          </div>

          {/* Interactive visual arc */}
          <div className="mt-8 pt-6 border-t border-border/80 grid grid-cols-5 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-surface-0 border border-border">
              <div className="text-[10px] font-mono text-amber-500 uppercase font-semibold">Hook</div>
              <div className="text-[11px] text-text-primary font-medium mt-0.5">Stop scroll</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-0 border border-border">
              <div className="text-[10px] font-mono text-text-muted uppercase font-semibold">Problem</div>
              <div className="text-[11px] text-text-primary font-medium mt-0.5">Pain point</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-0 border border-border">
              <div className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Reveal</div>
              <div className="text-[11px] text-text-primary font-medium mt-0.5">Core flow</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-0 border border-border">
              <div className="text-[10px] font-mono text-text-secondary uppercase font-semibold">Highlight</div>
              <div className="text-[11px] text-text-primary font-medium mt-0.5">Micro-crop</div>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-0 border border-border">
              <div className="text-[10px] font-mono text-emerald-500 uppercase font-semibold">Payoff</div>
              <div className="text-[11px] text-text-primary font-medium mt-0.5">Resolution</div>
            </div>
          </div>
        </div>

        {/* Card 2: Camera Kinematics (Span 1 Col) */}
        <div className="bento-card p-6 rounded-xl border border-border bg-surface-1/70 flex flex-col justify-between group hover:border-border-strong transition-all">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-0 border border-border text-xs font-medium text-text-primary">
              <Camera className="w-3.5 h-3.5" />
              <span>Camera kinematics</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              Smart camera paths
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Automated Ken Burns zooms, focal snaps, and horizontal sweeps designed to guide the viewer&apos;s
              eye to high-value UI elements.
            </p>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-surface-0 border border-border space-y-1.5 font-mono text-[10px] text-text-secondary">
            <div className="flex justify-between">
              <span>Zoom In Center</span>
              <span className="text-emerald-500">1.6x dynamic</span>
            </div>
            <div className="flex justify-between">
              <span>Pan Sweep</span>
              <span className="text-text-muted">45px linear</span>
            </div>
            <div className="flex justify-between">
              <span>Focal Hold</span>
              <span className="text-text-muted">2400ms steady</span>
            </div>
          </div>
        </div>

        {/* Card 3: Deterministic Remotion Engine (Span 1 Col) */}
        <div className="bento-card p-6 rounded-xl border border-border bg-surface-1/70 flex flex-col justify-between group hover:border-border-strong transition-all">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-0 border border-border text-xs font-medium text-text-primary">
              <Cpu className="w-3.5 h-3.5" />
              <span>Remotion pipeline</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              Deterministic 60fps
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Videos are rendered frame-by-frame on background workers. No browser throttling, no dropped
              frames, and no blurry compression artifacts.
            </p>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-surface-0 border border-border font-mono text-[10px] space-y-1">
            <div className="text-emerald-500">● 1920x1080 Full HD</div>
            <div className="text-text-muted">● Background worker render</div>
            <div className="text-text-muted">● Zero WebRTC screen drop</div>
          </div>
        </div>

        {/* Card 4: Multi-Aspect Social Exports (Span 1 Col) */}
        <div className="bento-card p-6 rounded-xl border border-border bg-surface-1/70 flex flex-col justify-between group hover:border-border-strong transition-all">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-0 border border-border text-xs font-medium text-text-primary">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Multi-aspect ratio</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              16:9 & 9:16 vertical
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Export widescreen landscape videos for desktop product launches and X, or 9:16 vertical clips
              for TikTok, Reels, and Shorts.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 p-3 rounded-lg bg-surface-0 border border-border">
            <div className="text-center">
              <div className="w-10 h-6 border border-border-strong rounded-xs bg-surface-2 mx-auto mb-1" />
              <span className="text-[10px] font-mono text-text-muted">16:9 Demo</span>
            </div>
            <div className="text-center">
              <div className="w-5 h-8 border border-border-strong rounded-xs bg-surface-2 mx-auto mb-1" />
              <span className="text-[10px] font-mono text-text-muted">9:16 Reel</span>
            </div>
          </div>
        </div>

        {/* Card 5: Enterprise-grade Token Security (Span 1 Col) */}
        <div className="bento-card p-6 rounded-xl border border-border bg-surface-1/70 flex flex-col justify-between group hover:border-border-strong transition-all">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-0 border border-border text-xs font-medium text-text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Encrypted tokens</span>
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              AES-256 encryption
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Figma OAuth tokens are encrypted at rest with AES-256-GCM. No token is ever exposed to client-side
              code or third parties.
            </p>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-surface-0 border border-border font-mono text-[10px] space-y-1 text-text-secondary">
            <div>Encrypted at rest: <span className="text-emerald-500">Active</span></div>
            <div>Row-level security: <span className="text-emerald-500">Enabled</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
