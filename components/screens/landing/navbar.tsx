"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, LogOut, UserCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/ui/auth-dialog";
import { MobileNav } from "./mobile-nav";
import { createClient } from "@/lib/supabase/browser";

export function Navbar() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/demo", { method: "DELETE" }).catch(() => {});
    setUserEmail(null);
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14 border-b border-border bg-surface-0/85 backdrop-blur-md">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <div className="w-5 h-5 rounded-sm bg-text-primary flex items-center justify-center text-surface-0 text-[11px] font-bold">
              ▶
            </div>
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              UI Animator
            </span>
          </Link>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-5 text-xs text-text-muted">
            <a href="#interactive-demo" className="hover:text-text-primary transition-colors">
              Simulator
            </a>
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">
              Workflow
            </a>
            <a href="#features" className="hover:text-text-primary transition-colors">
              Features
            </a>
            <a href="#comparison" className="hover:text-text-primary transition-colors">
              Comparison
            </a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-text-primary transition-colors">
              FAQ
            </a>
          </nav>
        </div>

        {/* Right Actions: Auth, Projects & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {userEmail ? (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-text-muted text-[11px] truncate max-w-[130px] font-mono">
                {userEmail.split("@")[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="p-1 rounded text-text-muted hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthDialogOpen(true)}
              className="text-xs text-text-secondary hover:text-text-primary hidden sm:inline-flex"
            >
              <span>Sign in</span>
            </Button>
          )}

          <Link href="/projects">
            <Button variant="primary" size="sm" className="text-xs gap-1.5 shadow-xs">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Button>
          </Link>

          {/* Mobile hamburger menu */}
          <MobileNav
            onOpenAuth={() => setAuthDialogOpen(true)}
            userEmail={userEmail}
            onSignOut={handleSignOut}
          />
        </div>
      </header>

      <AuthDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onSuccess={() => setAuthDialogOpen(false)}
      />
    </>
  );
}
