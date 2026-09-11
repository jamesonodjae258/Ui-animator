import { LandingHero } from "@/components/screens/landing/hero";
import { InteractiveStage } from "@/components/screens/landing/interactive-stage";
import { LandingWorkflowSteps } from "@/components/screens/landing/workflow-steps";
import { LandingFeaturesBento } from "@/components/screens/landing/features-bento";
import { LandingComparisonSection } from "@/components/screens/landing/comparison-section";
import { LandingTestimonialsSection } from "@/components/screens/landing/testimonials-section";
import { LandingPricingSection } from "@/components/screens/landing/pricing-section";
import { LandingFAQSection } from "@/components/screens/landing/faq-section";
import { LandingCTASection } from "@/components/screens/landing/cta-section";
import { LandingFooter } from "@/components/screens/landing/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-0 text-text-primary">
      <LandingHero />
      <InteractiveStage />
      <LandingWorkflowSteps />
      <LandingFeaturesBento />
      <LandingComparisonSection />
      <LandingTestimonialsSection />
      <LandingPricingSection />
      <LandingFAQSection />
      <LandingCTASection />
      <LandingFooter />
    </div>
  );
}
