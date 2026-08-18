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
      className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-6 max-w-6xl mx-auto flex flex-col items-center text-center"
    >
      {/* Background subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Pill badge */}
      <div className="hero-pill mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-1 border border-border text-xs text-text-secondary hover:border-border-strong transition-colors cursor-default">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] text-text-muted">v1.0</span>
          <span className="text-border-strong">/</span>
          <span>Figma prototype to narrative video engine</span>
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-text-primary max-w-4xl mb-6 leading-[1.08]">
        <span className="hero-title-line block">Turn Figma prototypes</span>
        <span className="hero-title-line block text-text-secondary font-normal">
          into motion graphic videos
        </span>
      </h1>

      {/* Description */}
      <p className="hero-description text-base sm:text-lg text-text-muted max-w-2xl mb-9 leading-relaxed">
        Paste your Figma prototype and a 2-sentence brief. UI Animator extracts frame structures,
        plans an intentional storytelling arc (hook → problem → reveal → payoff), and renders
        deterministic 60fps social videos with Remotion.
      </p>

      {/* Action CTA Buttons */}
      <div className="hero-actions flex flex-wrap items-center justify-center gap-3.5 mb-14">
        <Link href="/projects">
          <Button variant="primary" size="lg" className="gap-2 shadow-sm">
            <span>Open projects dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <a href="#interactive-demo">
          <Button variant="secondary" size="lg" className="gap-2">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Try interactive simulator</span>
          </Button>
        </a>
      </div>

      {/* Quick capability stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-4 border-t border-border/70">
        <div className="hero-stat-item flex items-center justify-center gap-2 p-3 rounded-lg bg-surface-1/60 border border-border/50 text-left">
          <Sparkles className="w-4 h-4 text-text-secondary shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">Story-first beats</div>
            <div className="text-[11px] text-text-muted">Hook to payoff arc</div>
          </div>
        </div>

        <div className="hero-stat-item flex items-center justify-center gap-2 p-3 rounded-lg bg-surface-1/60 border border-border/50 text-left">
          <Layers className="w-4 h-4 text-text-secondary shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">Figma frame import</div>
            <div className="text-[11px] text-text-muted">Direct node parsing</div>
          </div>
        </div>

        <div className="hero-stat-item flex items-center justify-center gap-2 p-3 rounded-lg bg-surface-1/60 border border-border/50 text-left">
          <Video className="w-4 h-4 text-text-secondary shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">60fps Remotion</div>
            <div className="text-[11px] text-text-muted">Deterministic render</div>
          </div>
        </div>

        <div className="hero-stat-item flex items-center justify-center gap-2 p-3 rounded-lg bg-surface-1/60 border border-border/50 text-left">
          <ShieldCheck className="w-4 h-4 text-text-secondary shrink-0" />
          <div>
            <div className="text-xs font-semibold text-text-primary">Encrypted tokens</div>
            <div className="text-[11px] text-text-muted">Zero client exposure</div>
          </div>
        </div>
      </div>
    </section>
  );
}
