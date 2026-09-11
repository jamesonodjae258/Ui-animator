"use client";

import { Badge } from "@/components/ui/badge";

const TESTIMONIALS = [
  {
    quote:
      "We used to spend 3 days in After Effects keyframing prototype zooms for every minor release. With UI Animator, we drop in our Figma prototype, get a structured story arc in 30 seconds, and render an MP4 that got 40k views on X.",
    author: "Elena Rostova",
    role: "Lead Design Engineer",
    company: "VeloctyHQ",
    avatar: "ER",
  },
  {
    quote:
      "The narrative beat concept is the game changer. Screen recordings feel like a boring software manual. UI Animator puts the tension in the right place: hook the viewer, highlight the friction, reveal the magic.",
    author: "Marcus Chen",
    role: "Founder & Product Designer",
    company: "DraftFlow",
    avatar: "MC",
  },
  {
    quote:
      "Remotion background rendering is so crisp. Zero dropped frames, subpixel vector rendering, and the 9:16 vertical exports fit Reels and TikTok without any manual reframing.",
    author: "Devon Bailey",
    role: "Growth & Product Marketing",
    company: "Hyperstack",
    avatar: "DB",
  },
];

export function LandingTestimonialsSection() {
  return (
    <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto border-t border-border/60">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <Badge variant="outline" className="mb-3 font-mono text-[11px]">
          Social proof
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
          Loved by designers who build in public
        </h2>
        <p className="text-sm sm:text-base text-text-muted max-w-xl">
          See how design teams use UI Animator to tell compelling motion stories that get noticed.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl border border-border bg-surface-1/50 flex flex-col justify-between hover:border-border-strong hover:bg-surface-1 transition-all"
          >
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
              &quot;{t.quote}&quot;
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-border/70">
              <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-text-primary shrink-0 font-mono">
                {t.avatar}
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary">{t.author}</div>
                <div className="text-[11px] text-text-muted">
                  {t.role} • <span className="text-text-secondary">{t.company}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
