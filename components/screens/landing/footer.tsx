"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface-0 py-14 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top 4-Column SaaS Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          {/* Brand Col (Spans 2 on desktop) */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-5 h-5 rounded-sm bg-text-primary flex items-center justify-center text-surface-0 text-[11px] font-bold">
                ▶
              </div>
              <span className="text-sm font-semibold tracking-tight text-text-primary">
                UI Animator
              </span>
            </Link>
            <p className="text-text-muted leading-relaxed max-w-sm">
              AI-driven platform that converts Figma prototypes into structured, narrative motion
              graphic videos with Remotion at 60fps.
            </p>

            {/* System Status badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1 border border-border">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono text-text-secondary">
                  Remotion render worker operational
                </span>
              </div>
            </div>
          </div>

          {/* Col 1: Product */}
          <div className="space-y-3">
            <div className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
              Product
            </div>
            <ul className="space-y-2 text-text-muted">
              <li>
                <a href="#interactive-demo" className="hover:text-text-primary transition-colors">
                  Simulator
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-text-primary transition-colors">
                  Workflow
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-text-primary transition-colors">
                  Narrative engine
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-text-primary transition-colors">
                  Why not Loom
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-text-primary transition-colors">
                  Pricing plans
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Architecture */}
          <div className="space-y-3">
            <div className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
              Technology
            </div>
            <ul className="space-y-2 text-text-muted">
              <li>
                <a
                  href="https://remotion.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-text-primary transition-colors"
                >
                  Remotion 60fps
                </a>
              </li>
              <li>
                <a
                  href="https://www.figma.com/developers/api"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-text-primary transition-colors"
                >
                  Figma REST API
                </a>
              </li>
              <li>
                <span className="text-text-muted">AES-256 token vault</span>
              </li>
              <li>
                <span className="text-text-muted">Supabase RLS</span>
              </li>
              <li>
                <span className="text-text-muted">Deterministic MP4</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Studio */}
          <div className="space-y-3">
            <div className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
              Studio
            </div>
            <ul className="space-y-2 text-text-muted">
              <li>
                <Link href="/projects" className="hover:text-text-primary transition-colors">
                  Projects dashboard
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-text-primary transition-colors">
                  Common questions
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-text-primary transition-colors"
                >
                  Release notes
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-text-primary transition-colors"
                >
                  Build in public
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div>
            © {new Date().getFullYear()} UI Animator Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-5">
            <span className="text-text-muted">Phase 1 MVP Scope</span>
            <span>•</span>
            <span className="text-text-muted">AES-256 encrypted</span>
            <span>•</span>
            <Link href="/projects" className="hover:text-text-primary transition-colors font-medium">
              Launch studio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
