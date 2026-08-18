"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function LandingBentoV2() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".bento-v2-cell",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section id="features" ref={containerRef} className="py-24 px-6 bg-surface-0 border-b border-border/40">
      <div className="max-w-7xl mx-auto space-y-14">
        
        {/* Section Title */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline" className="border-border px-3 py-1 text-xs font-mono text-text-secondary">
            Engine Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary">
            Built for speed, narrative fidelity, and pixel precision.
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-[55ch] leading-relaxed">
            Every layer of UI Animator was engineered to eliminate hours of manual video production while preserving design fidelity.
          </p>
        </div>

        {/* Asymmetric 5-Cell Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Cell 1: Structured LLM Shot Director (Span 7) */}
          <div className="bento-v2-cell md:col-span-7 bg-surface-1 border border-border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-border-strong transition-colors">
            <div className="space-y-3 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-accent font-semibold">01 / SHOT PLANNER</span>
                <span className="text-[10px] font-mono text-text-muted bg-surface-2 px-2 py-0.5 rounded">Zod Schema Validated</span>
              </div>
              <h3 className="text-2xl font-semibold text-text-primary tracking-tight">
                LLM director with strict narrative constraints
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-[45ch]">
                NVIDIA NIM & Anthropic evaluate your frame geometry and project brief to output structured JSON adhering to cardinality rules (exactly 1 Hook and 1 Payoff).
              </p>
            </div>

            {/* Code Snippet Inspector Window */}
            <div className="mt-8 z-10 bg-surface-0/90 border border-border/70 rounded-xl p-4 font-mono text-xs text-text-secondary overflow-x-auto">
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2 text-[11px] text-text-muted">
                <span>shot-plan-schema.json</span>
                <span className="text-emerald-400">valid</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-text-muted">
                {`{
  "narrative_beat": "hook",
  "camera_move": "zoom_in_center",
  "caption": "Managing cases shouldn't feel like chaos",
  "duration_ms": 2500
}`}
              </pre>
            </div>
          </div>

          {/* Cell 2: Figma Direct OAuth & Ingestion (Span 5) */}
          <div className="bento-v2-cell md:col-span-5 bg-surface-1 border border-border rounded-2xl p-8 flex flex-col justify-between group hover:border-border-strong transition-colors">
            <div className="space-y-3">
              <span className="text-xs font-mono text-accent font-semibold">02 / INGESTION</span>
              <h3 className="text-2xl font-semibold text-text-primary tracking-tight">
                Direct Figma API flow extraction
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Connect your Figma account via OAuth 2.0. We extract top-level frames, flow interactions, and 2x resolution thumbnails in under 3 seconds.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-surface-0/80 border border-border/60 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-text-primary">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Encrypted AES-256</span>
              </div>
              <span className="text-text-muted">RLS Enforced</span>
            </div>
          </div>

          {/* Cell 3: Remotion Render Worker (Span 4) */}
          <div className="bento-v2-cell md:col-span-4 bg-surface-1 border border-border rounded-2xl p-8 flex flex-col justify-between group hover:border-border-strong transition-colors">
            <div className="space-y-3">
              <span className="text-xs font-mono text-accent font-semibold">03 / RENDERING</span>
              <h3 className="text-xl font-semibold text-text-primary tracking-tight">
                Remotion programmatic render worker
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Background rendering worker executes headless Chromium pipelines to output broadcast-quality 1080p MP4 videos with zero serverless timeout limits.
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-text-muted flex items-center gap-2">
              <span className="text-accent">●</span>
              <span>1080 × 1920 (9:16) & 1920 × 1080 (16:9)</span>
            </div>
          </div>

          {/* Cell 4: Automatic Thumbnail S3 Caching (Span 4) */}
          <div className="bento-v2-cell md:col-span-4 bg-surface-1 border border-border rounded-2xl p-8 flex flex-col justify-between group hover:border-border-strong transition-colors">
            <div className="space-y-3">
              <span className="text-xs font-mono text-accent font-semibold">04 / RESILIENCE</span>
              <h3 className="text-xl font-semibold text-text-primary tracking-tight">
                Permanent asset persistence
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Figma S3 image URLs expire in minutes. UI Animator automatically caches all frame assets into dedicated Supabase Storage buckets for instant replay.
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-text-muted flex items-center gap-2">
              <span className="text-accent">●</span>
              <span>Zero broken image links</span>
            </div>
          </div>

          {/* Cell 5: Style Presets & Custom Typography (Span 4) */}
          <div className="bento-v2-cell md:col-span-4 bg-surface-1 border border-border rounded-2xl p-8 flex flex-col justify-between group hover:border-border-strong transition-colors">
            <div className="space-y-3">
              <span className="text-xs font-mono text-accent font-semibold">05 / AESTHETICS</span>
              <h3 className="text-xl font-semibold text-text-primary tracking-tight">
                Curated style presets
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Choose between Clean SaaS (minimalist typography and subtle device shadows) or Bold Product Launch (high-contrast kinetic pacing).
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-text-muted flex items-center gap-2">
              <span className="text-accent">●</span>
              <span>15s, 30s, or 60s targets</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
