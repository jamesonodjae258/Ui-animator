"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const name =
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User";
          setUserName(name);
          setUserEmail(user.email || "");
        }
      } catch (err) {
        console.warn("Could not load user in header:", err);
      }
    }
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name =
          session.user.user_metadata?.name ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "User";
        setUserName(name);
        setUserEmail(session.user.email || "");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    setIsDropdownOpen(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // Fallback
    }
    router.push("/login");
    router.refresh();
  }

  const initial = (userName.charAt(0) || "U").toUpperCase();

  return (
    <header className="w-full border-b border-border bg-surface-0/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo & Main Nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-text-primary hover:opacity-80 transition-opacity"
          >
            <div className="h-6 w-6 rounded-full bg-fill-primary flex items-center justify-center text-on-primary text-xs font-bold">
              M
            </div>
            <span>Motioncast</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-xs font-medium">
            <Link
              href="/projects"
              className={`transition-colors ${
                pathname.startsWith("/projects")
                  ? "text-text-primary font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Projects
            </Link>
          </nav>
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
            aria-expanded={isDropdownOpen}
            aria-label="User menu"
          >
            <div className="h-7 w-7 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-semibold text-text-primary">
              {initial}
            </div>
            <span className="hidden sm:inline-block text-xs font-medium text-text-secondary max-w-[120px] truncate">
              {userName}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-text-muted transition-transform duration-150 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-0 border border-border rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-border">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {userName}
                </p>
                {userEmail && (
                  <p className="text-[11px] text-text-muted truncate mt-0.5">
                    {userEmail}
                  </p>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center px-3.5 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors"
                >
                  Account settings
                </Link>
                <Link
                  href="/projects"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center px-3.5 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-1 transition-colors"
                >
                  All projects
                </Link>
              </div>

              <div className="pt-1 border-t border-border">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-surface-1 transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
