"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LandingPricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const tiers = [
    {
      name: "Starter",
      id: "starter",
      description: "For individual designers exploring narrative video demos.",
      monthlyPrice: "$0",
      annualPrice: "$0",
      period: "forever free",
      badge: "Free plan",
      isPopular: false,
      features: [
        "3 video renders per month",
        "1080p full HD export",
        "15-second narrative duration",
        "Core camera moves (zoom, pan, snap)",
        "Figma REST API frame import",
        "Community support",
      ],
      ctaText: "Start building for free",
      ctaVariant: "secondary" as const,
    },
    {
      name: "Pro creator",
      id: "creator",
      description: "For design engineers and indie makers shipping high-converting launch clips.",
      monthlyPrice: "$29",
      annualPrice: "$23",
      period: isAnnual ? "per month, billed annually" : "per month, billed monthly",
      badge: "Most popular",
      isPopular: true,
      features: [
        "Unlimited 60fps renders",
        "15s, 30s and 60s narrative durations",
        "16:9 landscape & 9:16 vertical reel exports",
        "Advanced camera kinematics & Ken Burns zooms",
        "Deterministic Remotion background queue",
        "Custom subtitle typography & auto-captions",
        "AES-256 encrypted Figma token vault",
      ],
      ctaText: "Get started with creator",
      ctaVariant: "primary" as const,
    },
    {
      name: "Studio & agency",
      id: "studio",
      description: "For design agencies and product marketing teams with heavy launch volume.",
      monthlyPrice: "$79",
      annualPrice: "$63",
      period: isAnnual ? "per month, billed annually" : "per month, billed monthly",
      badge: "Team scale",
      isPopular: false,
      features: [
        "Everything in Pro creator",
        "Multi-seat team workspace",
        "Concurrent background render workers",
        "Custom audio stems & background music sync",
        "Dedicated brand preset styles",
        "Commercial usage rights",
        "Priority Slack & email support",
      ],
      ctaText: "Launch studio plan",
      ctaVariant: "secondary" as const,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <Badge variant="outline" className="mb-3 font-mono text-[11px]">
          Simple, predictable pricing
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
          Turn prototypes into videos that convert
        </h2>
        <p className="text-sm sm:text-base text-text-muted max-w-xl mb-6">
          Start for free, then upgrade when you need multi-aspect exports, longer durations, and priority rendering.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="inline-flex items-center gap-2 p-1 rounded-lg bg-surface-1 border border-border">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              !isAnnual
                ? "bg-surface-0 text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Monthly billing
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              isAnnual
                ? "bg-surface-0 text-text-primary shadow-xs"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <span>Annual billing</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;

          return (
            <div
              key={tier.id}
              className={`relative rounded-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 ${
                tier.isPopular
                  ? "border-2 border-accent/70 bg-surface-1 shadow-sm"
                  : "border border-border bg-surface-1/50 hover:border-border-strong hover:bg-surface-1/80"
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent text-surface-0 text-[10px] font-mono font-semibold uppercase tracking-wider shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>{tier.badge}</span>
                  </span>
                </div>
              )}

              <div>
                {/* Plan Name & Tag */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-text-primary">{tier.name}</h3>
                  {!tier.isPopular && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
                      {tier.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-muted min-h-[36px] mb-6 leading-relaxed">
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight text-text-primary">
                      {price}
                    </span>
                    {price !== "$0" && (
                      <span className="text-xs text-text-muted">/ month</span>
                    )}
                  </div>
                  <div className="text-[11px] text-text-muted mt-1">{tier.period}</div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <span className="text-[11px] font-semibold text-text-primary uppercase tracking-wider block">
                    What&apos;s included
                  </span>
                  <ul className="space-y-2.5 text-xs text-text-secondary">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <Link href="/projects" className="block pt-2">
                <Button
                  variant={tier.ctaVariant}
                  size="default"
                  className="w-full justify-center gap-1.5 text-xs"
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Money-back / Guarantee reassurance */}
      <div className="mt-10 text-center text-xs text-text-muted flex flex-wrap items-center justify-center gap-4">
        <span>● No credit card required for Starter</span>
        <span>● Cancel or pause subscription anytime</span>
        <span>● Custom enterprise SLAs available</span>
      </div>
    </section>
  );
}
