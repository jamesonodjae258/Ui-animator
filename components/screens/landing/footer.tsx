"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface-0 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-muted">
        {/* Left: Branding & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <Link href="/" className="font-semibold text-sm text-text-primary hover:opacity-80 transition-opacity">
            UI Animator
          </Link>
          <span className="hidden sm:inline text-border-strong">•</span>
          <span>Figma prototypes to narrative motion graphics</span>
        </div>

        {/* Center: System Status */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-1 border border-border">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono">Remotion rendering worker ready</span>
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-5">
          <Link href="/projects" className="hover:text-text-primary transition-colors">
            Projects dashboard
          </Link>
          <a
            href="https://www.figma.com/developers/api"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            Figma API
          </a>
          <a
            href="https://remotion.dev"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            Remotion
          </a>
        </div>
      </div>
    </footer>
  );
}
