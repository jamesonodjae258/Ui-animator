"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/browser";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not launch demo session");
      }
      setSuccessMsg("Demo session active! Reloading...");
      setTimeout(() => {
        onSuccess?.();
        window.location.reload();
      }, 700);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to start demo session");
      setIsDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg("Signed in successfully!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg("Account created! You are now signed in.");
      }

      setTimeout(() => {
        onSuccess?.();
        window.location.reload();
      }, 700);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-0/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-surface-1 border border-border rounded-xl p-6 shadow-2xl z-10 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-[11px] font-mono text-text-secondary mb-3">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>UI Animator Studio</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            {mode === "signin" ? "Sign in to UI Animator" : "Create your creator account"}
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Build narrative motion graphics from Figma prototypes in 60fps.
          </p>
        </div>

        {/* Fast 1-Click Demo Button */}
        <div className="mb-5 pb-5 border-b border-border">
          <button
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isLoading}
            className="w-full flex items-center justify-between p-3.5 rounded-lg border border-accent/40 bg-surface-0 hover:border-accent hover:bg-surface-2/40 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center text-accent">
                {isDemoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors flex items-center gap-1.5">
                  <span>1-click demo access</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent/10 text-accent">
                    Instant
                  </span>
                </div>
                <div className="text-[11px] text-text-muted">
                  Test import, scene graph planning & video rendering immediately.
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="designer@startup.com"
                className="w-full text-xs"
                disabled={isLoading || isDemoLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full text-xs"
              disabled={isLoading || isDemoLoading}
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center text-xs py-2"
            disabled={isLoading || isDemoLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>

          {/* Toggle mode */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setErrorMsg(null);
              }}
              className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {mode === "signin"
                ? "Don't have an account yet? Create one"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
