import React from "react";
import FounderHeroSection from "./FounderHeroSection";
import FounderFeaturedSection from "./FounderFeaturedSection";
import FounderDetailsSection from "./FounderDetailsSection";

export const FounderSection: React.FC = () => {
  return (
    <section aria-labelledby="founder-title" className="bg-[hsl(var(--founder-bg))] flex w-full flex-col items-center pt-12 pb-20 px-5 md:px-20">
      <div className="flex w-full max-w-[1214px] flex-col items-center">
        <FounderHeroSection />
        <FounderFeaturedSection />
        <FounderDetailsSection />
      </div>
    </section>
  );
};

export default FounderSection;
