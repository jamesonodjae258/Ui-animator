"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does UI Animator connect to my Figma prototype?",
    answer:
      "You connect via official Figma OAuth. UI Animator reads the document frame hierarchy, vector layers, and frame ordering using the Figma REST API. Your OAuth tokens are encrypted at rest with AES-256-GCM and never exposed to the client.",
  },
  {
    question: "Why does the AI create a narrative arc instead of a standard screen sequence?",
    answer:
      "Standard screen tours suffer from low retention because they simply walk through menus. UI Animator's shot-planner structures an emotional narrative arc (hook statement → problem tension → core reveal → payoff resolution) with calculated camera zooms and concise captions.",
  },
  {
    question: "How is the final video rendered?",
    answer:
      "Videos are rendered frame-by-frame using Remotion in background workers. This ensures deterministic 60fps output with flawless easing curves, zero dropped frames, and crisp 1080p vector clarity.",
  },
  {
    question: "Can I adjust shots, camera moves, and captions before rendering?",
    answer:
      "Yes. The shot review screen gives you full control to adjust camera moves (zoom in, pan, Ken Burns, static hold), modify shot durations, tweak narrative beats, or rewrite captions before triggering the render job.",
  },
  {
    question: "What aspect ratios and video lengths are supported in Phase 1?",
    answer:
      "Phase 1 supports 15s, 30s, and 60s video durations in both 16:9 widescreen (ideal for YouTube, websites, and X) and 9:16 vertical (ideal for TikTok, Instagram Reels, and YouTube Shorts).",
  },
];

export function LandingFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 md:py-24 px-6 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <Badge variant="outline" className="mb-3 font-mono text-[11px]">
          Common questions
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
          Frequently asked questions
        </h2>
        <p className="text-sm sm:text-base text-text-muted max-w-xl">
          Everything you need to know about Figma imports, narrative shot planning, and Remotion rendering.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface-1/50 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-1 transition-colors"
              >
                <span className="text-sm font-semibold text-text-primary">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-text-primary" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-border/40 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
