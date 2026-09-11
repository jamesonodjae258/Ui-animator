import type { ReactNode } from "react";
import { AppHeader } from "@/components/screens/app-header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-1 text-text-primary flex flex-col antialiased">
      {/* Top Nav Shell */}
      <AppHeader />

      {/* Floating Card Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:py-8 flex flex-col">
        <div className="bg-surface-0 border border-border rounded-2xl shadow-sm p-6 sm:p-8 flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
