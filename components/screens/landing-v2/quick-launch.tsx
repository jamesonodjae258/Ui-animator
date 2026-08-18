"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LandingQuickLaunch() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = crypto.randomUUID();
    if (url.trim()) {
      router.push(`/projects/${newId}/import?figma_url=${encodeURIComponent(url.trim())}`);
    } else {
      router.push(`/projects/${newId}/import`);
    }
  };

  return (
    <section className="py-20 px-6 bg-surface-1 border-b border-border/40">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary">
            Try it with your own Figma file
          </h2>
          <p className="text-text-secondary text-base max-w-[50ch] mx-auto">
            Paste any public or team Figma prototype link to generate your 30-second motion pitch.
          </p>
        </div>

        {/* Floating Quick-Launch Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.figma.com/design/:key/..."
            className="h-12 text-sm bg-surface-0 border-border focus:border-accent"
          />
          <Button variant="primary" size="lg" type="submit" className="h-12 px-7 text-sm whitespace-nowrap">
            Generate video
          </Button>
        </form>

        <div className="flex items-center justify-center gap-6 text-xs text-text-muted">
          <span>No credit card required</span>
          <span>•</span>
          <span>Figma OAuth 2.0 secured</span>
          <span>•</span>
          <span>Instant preview</span>
        </div>

      </div>
    </section>
  );
}
