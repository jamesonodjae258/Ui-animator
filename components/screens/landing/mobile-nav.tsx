"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Play, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  onOpenAuth?: () => void;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export function MobileNav({ onOpenAuth, userEmail, onSignOut }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden flex items-center">
      {/* Hamburger / Close Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -mr-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors cursor-pointer"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-14 bg-surface-0/80 backdrop-blur-md z-40 transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Slide-down Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-x-0 top-14 bg-surface-0 border-b border-border p-6 shadow-xl z-50 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="flex flex-col space-y-4 text-sm font-medium">
            <a
              href="#interactive-demo"
              onClick={closeMenu}
              className="flex items-center justify-between py-2 text-text-secondary hover:text-text-primary border-b border-border/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 text-accent" />
                <span>Interactive simulator</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-1 text-text-muted">
                Demo
              </span>
            </a>

            <a
              href="#how-it-works"
              onClick={closeMenu}
              className="flex items-center justify-between py-2 text-text-secondary hover:text-text-primary border-b border-border/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-text-muted" />
                <span>How it works</span>
              </span>
              <span className="text-xs text-text-muted">4 steps</span>
            </a>

            <a
              href="#features"
              onClick={closeMenu}
              className="flex items-center justify-between py-2 text-text-secondary hover:text-text-primary border-b border-border/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-text-muted" />
                <span>Narrative engine</span>
              </span>
            </a>

            <a
              href="#comparison"
              onClick={closeMenu}
              className="py-2 text-text-secondary hover:text-text-primary border-b border-border/40 transition-colors"
            >
              Why traditional tours fail
            </a>

            <a
              href="#pricing"
              onClick={closeMenu}
              className="flex items-center justify-between py-2 text-text-secondary hover:text-text-primary border-b border-border/40 transition-colors"
            >
              <span>Pricing plans</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                Free tier
              </span>
            </a>

            <a
              href="#faq"
              onClick={closeMenu}
              className="py-2 text-text-secondary hover:text-text-primary border-b border-border/40 transition-colors"
            >
              Common questions
            </a>

            <Link
              href="/projects"
              onClick={closeMenu}
              className="py-2 text-text-primary hover:text-accent font-semibold border-b border-border/40 transition-colors"
            >
              Projects dashboard
            </Link>

            {/* User Session status */}
            <div className="pt-2">
              {userEmail ? (
                <div className="p-3 rounded-lg bg-surface-1 border border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate">{userEmail}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => {
                      closeMenu();
                      onSignOut?.();
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="default"
                  className="w-full justify-center"
                  onClick={() => {
                    closeMenu();
                    onOpenAuth?.();
                  }}
                >
                  Sign in
                </Button>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="pt-1">
              <Link href="/projects" onClick={closeMenu} className="block">
                <Button variant="primary" size="lg" className="w-full justify-center gap-2">
                  <span>Launch project studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
