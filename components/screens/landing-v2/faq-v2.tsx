"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    q: "How does UI Animator create a story instead of a screen tour?",
    a: "Unlike traditional tools that simply transition between frames in chronological order, UI Animator takes your project brief and frame hierarchy and assigns each shot a specific narrative beat: Hook, Problem, Reveal, Highlight, or Payoff. Camera moves (dynamic zooms, Ken Burns, pans) and captions are paced to build emotional tension and deliver a compelling pitch.",
  },
  {
    q: "Do I need to install any Figma plugins?",
    a: "No plugins required. Connect your Figma account securely via Figma's official OAuth 2.0. UI Animator reads top-level frames and prototype flows directly from the Figma REST API.",
  },
  {
    q: "How long does video rendering take?",
    a: "A 30-second 1080p MP4 render typically completes in under 45 seconds using our dedicated background Remotion rendering worker.",
  },
  {
    q: "Can I edit the captions and camera moves before rendering?",
    a: "Yes. The Shot Review screen provides an interactive director interface where you can reorder shots, tweak captions, change camera moves, and customize transition effects before triggering the final render.",
  },
  {
    q: "What video formats and aspect ratios are supported?",
    a: "We currently export high-bitrate 1080p MP4 videos optimized for social feeds, product launches, and investor pitch decks.",
  },
];

export function LandingFAQV2() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 px-6 bg-surface-0 border-b border-border/40">
      <div className="max-w-3xl mx-auto space-y-12">
        
        <div className="text-center space-y-3">
          <Badge variant="outline" className="border-border px-3 py-1 text-xs font-mono text-text-secondary">
            Questions & Answers
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-primary">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-border rounded-xl bg-surface-1 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-medium text-text-primary text-base hover:text-accent transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-text-muted font-mono text-lg transition-transform duration-200">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
