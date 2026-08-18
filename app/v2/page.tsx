import { LandingNavV2 } from "@/components/screens/landing-v2/nav-v2";
import { LandingHeroV2 } from "@/components/screens/landing-v2/hero-v2";
import { LandingNarrativeStack } from "@/components/screens/landing-v2/narrative-stack";
import { LandingStoryVsTour } from "@/components/screens/landing-v2/story-vs-tour";
import { LandingBentoV2 } from "@/components/screens/landing-v2/bento-v2";
import { LandingQuickLaunch } from "@/components/screens/landing-v2/quick-launch";
import { LandingFAQV2 } from "@/components/screens/landing-v2/faq-v2";
import { LandingCTAV2, LandingFooterV2 } from "@/components/screens/landing-v2/cta-v2";

export const metadata = {
  title: "UI Animator — AI Narrative Motion Graphics for Figma (v2 Editorial)",
  description:
    "Convert Figma prototypes into high-converting 30-second motion graphic videos with an AI narrative director.",
};

export default function LandingV2Page() {
  return (
    <div className="min-h-screen bg-surface-0 text-text-primary selection:bg-accent selection:text-white">
      <LandingNavV2 />
      <main>
        <LandingHeroV2 />
        <LandingNarrativeStack />
        <LandingStoryVsTour />
        <LandingBentoV2 />
        <LandingQuickLaunch />
        <LandingFAQV2 />
        <LandingCTAV2 />
      </main>
      <LandingFooterV2 />
    </div>
  );
}
