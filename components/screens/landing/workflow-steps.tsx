"use client";

import { useRef } from "react";
import { Link2, MessageSquareText, Compass, Film, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const STEPS = [
  {
    number: "01",
    icon: Link2,
    title: "Paste Figma prototype link",
    description:
      "Connect your Figma account securely. Motioncast extracts the frame hierarchy, canvas order, and high-resolution layer vector assets.",
    badge: "Figma REST API",
    snippet: "https://figma.com/proto/...",
  },
  {
    number: "02",
    icon: MessageSquareText,
    title: "Define 2-sentence brief",
    description:
      "Tell the director what the product does, who it's for, and why it matters. No animation choreography needed — the AI builds the story arc.",
    badge: "Story context",
    snippet: "A real-time workspace for async teams to ship faster without endless meetings.",
  },
  {
    number: "03",
    icon: Compass,
    title: "AI plans the narrative scene graph",
    description:
      "Our shot-planner structures a dramatic arc: hook statement → problem frame → reveal sequence → highlight zoom → confident payoff.",
    badge: "Structured JSON",
    snippet: "Hook (1x) → Problem (1x) → Reveal (3x) → Payoff (1x)",
  },
  {
    number: "04",
    icon: Film,
    title: "Render deterministic 60fps video",
    description:
      "Remotion executes camera movements, easing curves, and synced typography frame by frame in background workers without browser lag.",
    badge: "Remotion Engine",
    snippet: "Render completed • 1080p MP4 ready",
  },
];

export function LandingWorkflowSteps() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".workflow-step-card", {
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
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
          Simple 4-step workflow
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
          From Figma prototype to viral social clip in seconds
        </h2>
        <p className="text-sm sm:text-base text-text-muted max-w-xl">
          Everything is engineered for speed, narrative coherence, and studio-grade motion quality.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="workflow-step-card group p-5 rounded-xl border border-border bg-surface-1/60 hover:bg-surface-1 hover:border-border-strong transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Step Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold text-text-muted">
                    {step.number}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 text-text-secondary border border-border">
                    {step.badge}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-2 rounded-lg bg-surface-0 border border-border text-text-primary group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary leading-tight">
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  {step.description}
                </p>
              </div>

              {/* Code snippet preview badge */}
              <div className="p-2.5 rounded-md bg-surface-0 border border-border/80 text-[11px] font-mono text-text-secondary truncate flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-text-muted shrink-0" />
                <span className="truncate">{step.snippet}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
