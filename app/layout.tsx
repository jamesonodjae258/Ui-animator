import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UI Animator",
  description: "Turn Figma prototypes into motion graphic videos that tell a story",
};

function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b border-border bg-surface-0/85 backdrop-blur-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-5 h-5 rounded-sm bg-text-primary flex items-center justify-center text-surface-0 text-[11px] font-bold">
          ▶
        </div>
        <span className="text-sm font-semibold tracking-tight text-text-primary">
          UI Animator
        </span>
      </Link>

      {/* Navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs text-text-muted">
        <a href="#interactive-demo" className="hover:text-text-primary transition-colors">
          Simulator
        </a>
        <a href="/projects" className="hover:text-text-primary transition-colors">
          Projects
        </a>
        <a
          href="https://www.figma.com/developers/api"
          target="_blank"
          rel="noreferrer"
          className="hover:text-text-primary transition-colors"
        >
          Figma API
        </a>
      </nav>

      {/* User / Dashboard action */}
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium bg-accent text-surface-0 hover:bg-accent-hover transition-colors"
        >
          <span>Dashboard</span>
          <span className="text-surface-0/70">→</span>
        </Link>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased bg-surface-0 text-text-primary">
        <Navbar />
        <main className="flex-1 animate-page-enter">{children}</main>
      </body>
    </html>
  );
}
