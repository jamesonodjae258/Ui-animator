"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/projects";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDemoPending, setIsDemoPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handlePasswordSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please fill in email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            name: name.trim(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create account.");
        }

        // Account created and user logged in directly!
        router.push(redirectPath);
        router.refresh();
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to create account."
        );
      }
    });
  }

  async function handleDemoLogin() {
    setIsDemoPending(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not start demo session");
      }
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to start demo session."
      );
      setIsDemoPending(false);
    }
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
            Create an account
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Transform your Figma prototypes into narrative motion graphics
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

            <form onSubmit={handlePasswordSignup} className="space-y-4">
              <Input
                label="Full name (optional)"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
                placeholder="•••••••• (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="primary"
                size="default"
                className="w-full"
                disabled={isPending || isDemoPending}
              >
                {isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-surface-1 px-2 text-text-muted">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="default"
              className="w-full"
              disabled={isPending || isDemoPending}
              onClick={handleDemoLogin}
            >
              {isDemoPending ? "Entering demo..." : "Continue as demo user"}
            </Button>
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-text-muted mt-6">
          Already have an account?{" "}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-text-primary font-medium underline underline-offset-4 hover:opacity-80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
          <div className="text-xs text-text-muted">Loading...</div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
