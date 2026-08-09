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
    <nav className="flex items-center justify-between px-6 h-14 border-b border-border bg-surface-0">
      {/* Logo */}
      <Link href="/projects" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-sm font-semibold tracking-tight text-text-primary">
          UI Animator
        </span>
      </Link>

      {/* User avatar indicator */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs text-text-secondary font-medium">
          UA
        </div>
      </div>
    </nav>
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
