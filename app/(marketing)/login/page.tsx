"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/projects";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
              redirectPath
            )}`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setMagicLinkSent(true);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to send magic link."
        );
      }
    });
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        router.push(redirectPath);
        router.refresh();
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to log in."
        );
      }
    });
  }

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-text-primary hover:opacity-80 transition-opacity"
          >
            <div className="w-5 h-5 rounded-sm bg-text-primary flex items-center justify-center text-surface-0 text-[11px] font-bold">
              ▶
            </div>
            <span>UI Animator</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary mt-3">
            Welcome back
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Log in to manage your video projects and renders
          </p>
        </div>

        {/* Floating Card Shell */}
        <Card padding="lg" className="border border-border shadow-sm">
          {magicLinkSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center text-text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-text-primary">
                  Check your email
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  We sent a temporary sign-in link to{" "}
                  <strong className="text-text-primary">{email}</strong>. Click
                  the link in your inbox to complete login.
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="default"
                  onClick={() => setMagicLinkSent(false)}
                  className="w-full"
                >
                  Use a different email
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setMagicLinkSent(false);
                    setUsePassword(true);
                  }}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-4"
                >
                  Or sign in with password
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-xs rounded-lg bg-surface-2 border border-border text-red-600 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              {!usePassword ? (
                /* Primary Option: Magic Link */
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="default"
                    className="w-full"
                    disabled={isPending}
                  >
                    {isPending ? "Sending link..." : "Send magic link"}
                  </Button>
                </form>
              ) : (
                /* Secondary Option: Password */
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="default"
                    className="w-full"
                    disabled={isPending}
                  >
                    {isPending ? "Signing in..." : "Log in"}
                  </Button>
                </form>
              )}

              {/* Mode Toggle */}
              <div className="pt-2 text-center border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setUsePassword(!usePassword);
                  }}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  {usePassword
                    ? "Send me a magic link instead"
                    : "Or use a password instead"}
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-text-primary font-medium underline underline-offset-4 hover:opacity-80"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-1 flex items-center justify-center p-4">
          <div className="text-xs text-text-muted">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
