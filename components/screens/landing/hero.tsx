"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Layers, Video, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function LandingHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-pill", {
        opacity: 0,
        y: -12,
        duration: 0.6,
      })
        .from(
          ".hero-title-line",
          {
            opacity: 0,
            y: 24,
            duration: 0.8,
            stagger: 0.1,
          },
          "-=0.3"
        )
        .from(
          ".hero-description",
          {
            opacity: 0,
            y: 16,
            duration: 0.7,
          },
          "-=0.5"
        )
        .from(
          ".hero-actions",
          {
            opacity: 0,
            y: 16,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".hero-stat-item",
          {
            opacity: 0,
            y: 12,
            duration: 0.5,
            stagger: 0.08,
          },
          "-=0.3"
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center"
    >
      {/* Background subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Pill badge */}
      <div className="hero-pill mb-6 max-w-full px-2">
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-surface-1 border border-border text-xs text-text-secondary hover:border-border-strong transition-colors cursor-default">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-mono text-[10px] sm:text-[11px] text-text-muted">AI Shot Planner</span>
          <span className="text-border-strong hidden sm:inline">/</span>
          <span className="text-[11px] sm:text-xs">Figma prototype to motion story</span>
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary max-w-4xl mb-5 sm:mb-6 leading-[1.12] sm:leading-[1.08]">
        <span className="hero-title-line block">Turn Figma prototypes</span>
        <span className="hero-title-line block text-text-secondary font-normal">
          into motion graphic videos
        </span>
      </h1>

      {/* Description */}
      <p className="hero-description text-sm sm:text-base md:text-lg text-text-muted max-w-2xl mb-8 sm:mb-9 leading-relaxed px-2">
        Paste your Figma prototype and a 2-sentence brief. UI Animator extracts frame structures,
        plans an intentional storytelling arc (hook → problem → reveal → payoff), and renders
        deterministic 60fps social videos with Remotion.
      </p>

      {/* Action CTA Buttons */}
      <div className="hero-actions flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md sm:max-w-none mb-10 sm:mb-14">
        <Link href="/projects" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-sm justify-center">
            <span>Open projects dashboard</span>
          </Button>
        </Link>
        <a href="#interactive-demo" className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2 justify-center">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Try interactive simulator</span>
          </Button>
        </a>
      </div>

      {/* Social proof micro-line */}
      <div className="flex items-center justify-center gap-2 text-xs text-text-muted mb-8 font-mono">
        <span className="flex -space-x-1.5 overflow-hidden">
          <span className="inline-block h-5 w-5 rounded-full ring-2 ring-surface-0 bg-surface-2 text-[9px] flex items-center justify-center font-bold text-text-primary">A</span>
          <span className="inline-block h-5 w-5 rounded-full ring-2 ring-surface-0 bg-accent/20 text-[9px] flex items-center justify-center font-bold text-accent">F</span>
          <span className="inline-block h-5 w-5 rounded-full ring-2 ring-surface-0 bg-surface-2 text-[9px] flex items-center justify-center font-bold text-text-primary">R</span>
        </span>
        <span>Used by product teams shipping on X &amp; Product Hunt</span>
      </div>

      {/* Quick capability stat pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl pt-4 border-t border-border/70">
        <div className="hero-stat-item flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg bg-surface-1/60 border border-border/50 text-left">
          <Sparkles className="w-4 h-4 text-text-secondary shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-text-primary truncate">Story-first beats</div>
            <div className="text-[10px] sm:text-[11px] text-text-muted truncate">Hook to payoff arc</div>
          </div>
        </div>

        <div className="hero-stat-item flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg bg-surface-1/60 border border-border/50 text-left">
          <Layers className="w-4 h-4 text-text-secondary shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-text-primary truncate">Figma frame import</div>
            <div className="text-[10px] sm:text-[11px] text-text-muted truncate">Direct node parsing</div>
          </div>
        </div>

        <div className="hero-stat-item flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg bg-surface-1/60 border border-border/50 text-left">
          <Video className="w-4 h-4 text-text-secondary shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-text-primary truncate">60fps Remotion</div>
            <div className="text-[10px] sm:text-[11px] text-text-muted truncate">Deterministic render</div>
          </div>
        </div>

        <div className="hero-stat-item flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg bg-surface-1/60 border border-border/50 text-left">
          <ShieldCheck className="w-4 h-4 text-text-secondary shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-text-primary truncate">Encrypted tokens</div>
            <div className="text-[10px] sm:text-[11px] text-text-muted truncate">Zero client exposure</div>
          </div>
        </div>
      </div>
    </section>
  );
}
