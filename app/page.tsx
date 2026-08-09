import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-6 text-center animate-page-enter">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2 border border-border text-xs text-text-secondary mb-6">
        <span>✨ Turn Figma prototypes into motion graphic videos</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary max-w-2xl mb-4 leading-tight">
        Animate your UI prototypes into narrative videos
      </h1>
      <p className="text-base text-text-muted max-w-xl mb-8 leading-relaxed">
        Import frames directly from Figma, construct storytelling camera beats, and render crisp video demos powered by Remotion.
      </p>
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="primary" size="lg">
            Open Projects Dashboard →
          </Button>
        </Link>
      </div>
    </div>
  );
}
