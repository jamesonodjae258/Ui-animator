"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCTASection() {
  return (
    <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
      <div className="relative rounded-2xl border border-border-strong bg-surface-1 p-8 sm:p-14 text-center overflow-hidden shadow-sm">
        {/* Subtle decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-0 border border-border text-xs text-text-secondary mb-6">
          <Sparkles className="w-3.5 h-3.5 text-text-primary" />
          <span>No video editing experience required</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary max-w-2xl mx-auto mb-4 leading-tight">
          Ready to tell the story of your product?
        </h2>

        <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto mb-8 leading-relaxed">
          Import your Figma frames in seconds and let the narrative engine plan and render studio-grade motion graphic videos.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/projects">
            <Button variant="primary" size="lg">
              <span>Open projects dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
