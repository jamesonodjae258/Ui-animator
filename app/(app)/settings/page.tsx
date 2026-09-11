"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserData {
  id: string;
  email: string | null;
  name: string;
  created_at?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email ?? null,
            name:
              authUser.user_metadata?.name ||
              authUser.user_metadata?.full_name ||
              authUser.email?.split("@")[0] ||
              "User",
            created_at: authUser.created_at,
          });
        }
      } catch (err) {
        console.warn("Could not load user in settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Account settings
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Manage your personal account details and session
        </p>
      </div>

      <Card padding="lg" className="space-y-6">
        {loading ? (
          <div className="text-xs text-text-muted py-8 text-center">
            Loading profile...
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <div className="h-14 w-14 rounded-full bg-surface-2 border border-border flex items-center justify-center text-lg font-semibold text-text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-text-primary">
                    {user.name}
                  </h2>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1">
                  Name
                </label>
                <div className="text-sm font-medium text-text-primary px-4 py-2.5 bg-surface-1 border border-border rounded-full">
                  {user.name}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1">
                  Email address
                </label>
                <div className="text-sm font-medium text-text-primary px-4 py-2.5 bg-surface-1 border border-border rounded-full">
                  {user.email}
                </div>
              </div>

              {user.created_at && (
                <div>
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-1">
                    Member since
                  </label>
                  <p className="text-xs text-text-secondary px-1">
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-text-muted">
                Need to end your active session?
              </div>
              <Button
                variant="secondary"
                size="default"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full sm:w-auto"
              >
                {loggingOut ? "Signing out..." : "Log out"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs text-text-secondary">
              No authenticated user session detected.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/login")}
            >
              Sign in
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
