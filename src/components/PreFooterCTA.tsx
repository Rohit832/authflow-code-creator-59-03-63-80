import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Pre-footer promotional CTA matching the provided reference
// Uses design tokens (yellow palette in index.css) and semantic HTML

const PreFooterCTA: React.FC = () => {
  return (
    <section aria-labelledby="prefooter-cta-title" className="w-full relative z-20 mt-12 md:mt-16 mb-[-96px] md:mb-[-120px]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        <div className="rounded-lg md:rounded-xl lg:rounded-2xl border border-foreground/20 shadow-[3px_4px_0_0_hsl(var(--foreground))] bg-[hsl(var(--yellow-bg))] text-[hsl(var(--yellow-fg))] min-h-[460px] md:min-h-[520px] p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <div className="text-center">
            {/* Small brand row */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">finsage</span>
              <span className="w-3 h-3 rounded-full bg-primary" />
            </div>

            <h2 id="prefooter-cta-title" className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              Bring Finsage to Your Workplace & make financial calm your company's new culture.
            </h2>
            <p className="mt-5 md:mt-6 text-sm sm:text-base md:text-lg max-w-3xl mx-auto opacity-90 leading-relaxed">
              Think of it as every employee's personal CA, money mentor, and calm button — rolled into one,
              and gives HR a massive sigh of relief.
            </p>

            <div className="mt-7 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button size="lg" className="shadow-[3px_4px_0_0_hsl(var(--foreground))]">
                Book a Free Discovery Call
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="shadow-[3px_4px_0_0_hsl(var(--foreground))] bg-background"
              >
                <span className="mr-2">Explore Finsage for Your Team</span>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-foreground text-background">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooterCTA;
