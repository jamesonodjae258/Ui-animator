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

import { Navbar } from "@/components/screens/landing/navbar";

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
