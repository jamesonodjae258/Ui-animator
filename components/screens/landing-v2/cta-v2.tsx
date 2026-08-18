"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCTAV2() {
  return (
    <section className="py-28 px-6 bg-surface-1 text-center relative overflow-hidden">
      {/* Subtle ambient accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary leading-tight">
          Ready to turn your prototype into a compelling story?
        </h2>
        <p className="text-text-secondary text-base sm:text-lg max-w-[50ch] mx-auto leading-relaxed">
          Join designers, founders, and creative agencies creating high-converting launch videos in seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/projects">
            <Button variant="primary" size="lg" className="h-13 px-8 text-base font-medium shadow-xl hover:scale-105 transition-transform">
              Start your first video free
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" size="lg" className="h-13 px-6 text-sm font-medium border-border/80">
              View v1 layout
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LandingFooterV2() {
  return (
    <footer className="py-12 px-6 border-t border-border/40 bg-surface-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-text-muted">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center text-white text-[10px] font-bold">
            UI
          </div>
          <span className="font-semibold text-text-primary">UI Animator</span>
          <span>© {new Date().getFullYear()} — All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/projects" className="hover:text-text-primary transition-colors">
            App
          </Link>
          <a href="https://figma.com" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors">
            Figma API
          </a>
          <a href="https://remotion.dev" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors">
            Remotion
          </a>
          <a href="https://github.com/jamesonodjae258/Ui-animator" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
