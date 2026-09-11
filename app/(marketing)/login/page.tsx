"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/projects";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to sign in.");
        }

        router.push(redirectPath);
        router.refresh();
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to sign in."
        );
      }
    });
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 sm:p-6">
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
            Sign in to manage your video projects and renders
          </p>
        </div>

        {/* Floating Card Shell */}
        <Card padding="lg" className="border border-border shadow-sm">
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 text-xs rounded-lg bg-surface-2 border border-border text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}

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
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
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
        <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
          <div className="text-xs text-text-muted">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
