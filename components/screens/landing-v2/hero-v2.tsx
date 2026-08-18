"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const BEATS = [
  {
    id: "hook",
    label: "01. Hook",
    title: "Managing chaos shouldn't be your day job",
    camera: "Dynamic Zoom In (1.35x)",
    duration: "2.5s",
    tag: "High Tension",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    bgPattern: "from-amber-500/5 to-transparent",
  },
  {
    id: "problem",
    label: "02. Problem",
    title: "14 tabs open. Deadlines slipping. Context lost.",
    camera: "Subtle Pan Left → Right",
    duration: "3.2s",
    tag: "Friction",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    bgPattern: "from-red-500/5 to-transparent",
  },
  {
    id: "reveal",
    label: "03. Reveal",
    title: "Meet JusticeHub: Your cases, organized in one place",
    camera: "Ken Burns Focus Pull",
    duration: "3.8s",
    tag: "Clarity",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bgPattern: "from-emerald-500/5 to-transparent",
  },
  {
    id: "highlight",
    label: "04. Highlight",
    title: "One click filing with automated client tracking",
    camera: "Center Punch-in (1.2x)",
    duration: "3.0s",
    tag: "Feature Proof",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    bgPattern: "from-blue-500/5 to-transparent",
  },
  {
    id: "payoff",
    label: "05. Payoff",
    title: "Focus on winning cases, not fighting software.",
    camera: "Wide Ease Out (0.95x)",
    duration: "4.0s",
    tag: "Resolution",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    bgPattern: "from-purple-500/5 to-transparent",
  },
];

export function LandingHeroV2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeBeat = BEATS[activeBeatIndex];

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: -12, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
        .fromTo(
          ".hero-headline-line",
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 },
          "-=0.4"
        )
        .fromTo(
          ".hero-subtext",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          ".hero-cta-group",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          ".hero-mockup-wrapper",
          { opacity: 0, scale: 0.94, y: 24 },
          { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power2.out" },
          "-=0.6"
        );
    },
    { scope: containerRef }
  );

  // Subtle 3D tilt on mouse movement over the mockup
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mockupRef.current) return;
    const rect = mockupRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(mockupRef.current, {
      rotateY: x * 0.02,
      rotateX: -y * 0.02,
      transformPerspective: 1000,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!mockupRef.current) return;
    gsap.to(mockupRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.7,
      ease: "power2.out",
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92dvh] flex items-center justify-center pt-8 pb-20 px-6 overflow-hidden border-b border-border/30"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-accent/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          
          <div className="hero-badge flex items-center gap-2">
            <Badge variant="outline" className="border-border px-3 py-1 text-xs font-mono text-text-secondary bg-surface-1/50 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-2" />
              AI Narrative Shot Planner
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary leading-[1.08]">
              <span className="block hero-headline-line">Turn UI prototypes</span>
              <span className="block hero-headline-line text-text-secondary">into motion stories,</span>
              <span className="block hero-headline-line text-accent">not screen tours.</span>
            </h1>
          </div>

          <p className="hero-subtext text-base sm:text-lg text-text-secondary max-w-[48ch] leading-relaxed">
            Paste a Figma link and brief. Our AI director crafts a 5-beat narrative arc and renders a broadcast-quality product launch video in seconds.
          </p>

          {/* CTAs */}
          <div className="hero-cta-group flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link href="/projects">
              <Button variant="primary" size="lg" className="w-full sm:w-auto h-12 px-7 text-sm font-medium shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Animate your prototype
              </Button>
            </Link>
            <a href="#narrative-arc">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto h-12 px-6 text-sm font-medium border-border/80 hover:bg-surface-2 transition-colors">
                Explore the 5-beat arc
              </Button>
            </a>
          </div>

          {/* Micro Trust Proof */}
          <div className="pt-4 flex items-center gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Figma OAuth 2.0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Remotion 1080p MP4</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>NVIDIA NIM Powered</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Story Director Simulator */}
        <div className="lg:col-span-6 flex justify-center">
          <div
            ref={mockupRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="hero-mockup-wrapper w-full max-w-xl bg-surface-1/90 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            {/* Top Bar / Inspector Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <span className="text-xs font-mono text-text-muted ml-2">
                  director-preview.mp4
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="subtle" className="text-[10px] font-mono uppercase tracking-wider">
                  1080 × 1920
                </Badge>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>

            {/* Video Viewport Stage */}
            <div className="relative aspect-[16/10] bg-surface-0 rounded-xl border border-border/60 overflow-hidden flex flex-col justify-between p-5">
              
              {/* Dynamic Camera Grid & Focus Ring */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 border border-white/10">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-white/20" />
                <div className="border-r border-white/20" />
                <div />
              </div>

              {/* Simulated UI Screen (Changes with Beat) */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${activeBeat.color}`}>
                    {activeBeat.label}
                  </span>
                  <span className="text-[11px] font-mono text-text-muted">
                    {activeBeat.camera}
                  </span>
                </div>
                <span className="text-xs font-mono text-text-secondary bg-surface-2/80 px-2 py-0.5 rounded">
                  {activeBeat.duration}
                </span>
              </div>

              {/* Center Dynamic UI Frame Visualization */}
              <div className="relative z-10 my-auto py-4 text-center">
                <div className="inline-block px-4 py-2 rounded-lg bg-surface-1/90 border border-border backdrop-blur-md max-w-[90%] shadow-lg transition-all duration-300">
                  <p className="text-sm md:text-base font-medium text-text-primary tracking-tight">
                    &ldquo;{activeBeat.title}&rdquo;
                  </p>
                </div>
              </div>

              {/* Bottom Telemetry Info */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-text-muted pt-2 border-t border-border/40">
                <span>AI Narration Score: 98.4%</span>
                <span className="text-accent">Motion: Smooth Spring</span>
              </div>
            </div>

            {/* Timeline Beat Selector Controls */}
            <div className="mt-4 pt-3 border-t border-border/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-secondary">Narrative Sequence</span>
                <span className="text-[11px] font-mono text-text-muted">Click a beat to simulate</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {BEATS.map((beat, idx) => (
                  <button
                    key={beat.id}
                    onClick={() => setActiveBeatIndex(idx)}
                    className={`py-2 px-1 rounded-lg text-[11px] font-mono transition-all text-center border ${
                      activeBeatIndex === idx
                        ? "bg-accent/15 border-accent text-accent font-semibold scale-[1.02]"
                        : "bg-surface-2/50 border-border/60 text-text-muted hover:text-text-primary hover:bg-surface-2"
                    }`}
                  >
                    <div className="truncate">{beat.id}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
