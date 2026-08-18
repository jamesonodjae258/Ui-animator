"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/badge";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ARC_STEPS = [
  {
    step: "01",
    beat: "Hook",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    headline: "Grab attention in the first 3 seconds",
    description:
      "A fast, punchy camera zoom-in centered on the core conflict or pain point. Creates instant tension that stops the scroll.",
    cameraMove: "Zoom in center (1.35×)",
    captionExample: "“Managing client cases shouldn’t feel like managing chaos.”",
    duration: "2.5s",
    visualIcon: "🎯",
  },
  {
    step: "02",
    beat: "Problem",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    headline: "Expose the friction and cost of doing nothing",
    description:
      "A steady horizontal pan across cluttered workflows, manual spreadsheets, and missed deadlines. The audience sees their own struggle.",
    cameraMove: "Pan left → right (subtle)",
    captionExample: "“Lawyers lose 6+ hours every week searching across email threads.”",
    duration: "3.2s",
    visualIcon: "⚠️",
  },
  {
    step: "03",
    beat: "Reveal",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    headline: "The breakthrough product moment",
    description:
      "A cinematic Ken Burns focus pull introducing your clean, organized dashboard. The visual relief when the solution arrives.",
    cameraMove: "Ken Burns subtle focus pull",
    captionExample: "“Meet JusticeHub: Your cases, organized in one place.”",
    duration: "3.8s",
    visualIcon: "✨",
  },
  {
    step: "04",
    beat: "Highlight",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    headline: "Concrete visual proof of value",
    description:
      "A tight punch-in highlighting the 1-click filing automation and automated client status tracking in action.",
    cameraMove: "Static hold with micro-drift",
    captionExample: "“One-click filing with automatic client status tracking.”",
    duration: "3.0s",
    visualIcon: "⚡",
  },
  {
    step: "05",
    beat: "Payoff",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    headline: "Resolution and the compelling next step",
    description:
      "A smooth ease-out to a wide, calm perspective with your CTA. Leaves the viewer convinced and ready to sign up.",
    cameraMove: "Wide ease-out (0.95×)",
    captionExample: "“Focus on winning cases, not fighting software. Start free.”",
    duration: "4.0s",
    visualIcon: "🚀",
  },
];

export function LandingNarrativeStack() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".narrative-card");
      if (cards.length === 0) return;

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;

        ScrollTrigger.create({
          trigger: card,
          start: "top 12%",
          endTrigger: cards[cards.length - 1],
          end: "top 12%",
          pin: true,
          pinSpacing: false,
        });

        gsap.to(card, {
          scale: 0.94,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top 60%",
            end: "top 12%",
            scrub: true,
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="narrative-arc"
      ref={containerRef}
      className="relative py-24 px-6 bg-surface-0 border-b border-border/40"
    >
      <div className="max-w-4xl mx-auto mb-16 text-center space-y-4">
        <Badge variant="outline" className="border-border px-3 py-1 text-xs font-mono text-text-secondary">
          The 5-Beat Narrative Arc
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
          Why stories convert 3× better than screen tours.
        </h2>
        <p className="text-text-secondary text-base sm:text-lg max-w-[60ch] mx-auto leading-relaxed">
          Standard tools blindly scroll through frames 1 to N. UI Animator orchestrates a classic 5-act narrative curve tailored specifically for social video algorithms.
        </p>
      </div>

      {/* Pinned Card Stack */}
      <div className="max-w-3xl mx-auto space-y-12 relative pb-20">
        {ARC_STEPS.map((step) => (
          <div
            key={step.step}
            className="narrative-card bg-surface-1/95 backdrop-blur-xl border border-border rounded-2xl p-8 sm:p-10 shadow-2xl transition-shadow duration-300 min-h-[380px] flex flex-col justify-between"
          >
            {/* Top Meta */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-bold text-text-muted">
                  {step.step}
                </span>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${step.badgeColor}`}>
                  Beat: {step.beat}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <span>Duration: {step.duration}</span>
                <span>•</span>
                <span className="text-accent">{step.cameraMove}</span>
              </div>
            </div>

            {/* Core Narrative Card Body */}
            <div className="my-6 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
                {step.headline}
              </h3>
              <p className="text-text-secondary text-base leading-relaxed max-w-[60ch]">
                {step.description}
              </p>
            </div>

            {/* Generated Caption Sample */}
            <div className="bg-surface-0/80 border border-border/80 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-text-muted tracking-wider block">
                  AI Caption Generated
                </span>
                <p className="text-sm font-medium text-text-primary italic">
                  {step.captionExample}
                </p>
              </div>
              <span className="text-2xl hidden sm:block">{step.visualIcon}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
