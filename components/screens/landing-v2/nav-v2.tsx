"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function LandingNavV2() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-surface-0/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/v2" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:scale-105 transition-transform duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
              </svg>
            </div>
            <span className="font-semibold text-text-primary tracking-tight text-base">
              UI Animator
            </span>
          </Link>
          <Badge variant="subtle" className="text-[11px] font-mono tracking-wider">
            v2 Editorial
          </Badge>
        </div>

        {/* Version Switcher & Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <a href="#narrative-arc" className="hover:text-text-primary transition-colors">
            Narrative arc
          </a>
          <a href="#how-it-works" className="hover:text-text-primary transition-colors">
            Story vs tour
          </a>
          <a href="#features" className="hover:text-text-primary transition-colors">
            Engine
          </a>
          <a href="#faq" className="hover:text-text-primary transition-colors">
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-text-muted hover:text-text-primary px-2.5 py-1.5 rounded-md border border-border/60 hover:border-border transition-all">
            Switch to v1
          </Link>
          <Link href="/projects">
            <Button variant="primary" size="sm" className="h-9 px-4 font-medium">
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
