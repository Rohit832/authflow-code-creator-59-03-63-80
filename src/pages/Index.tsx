
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import BackgroundImages from '@/components/BackgroundImages';
import ContentImages from '@/components/ContentImages';
import BottomSection from '@/components/BottomSection';
import TrustedOrganizations from '@/components/TrustedOrganizations';
import FigmaCloneSection from '@/components/FigmaCloneSection';
import { ImpactSection } from '@/components/ImpactSection';
import GlobalGoalsSection from '@/components/GlobalGoalsSection';
import FounderSection from '@/components/FounderSection';
import WhatWeOffer from '@/components/WhatWeOffer';
import { HRStatsSection } from '@/components/HRStatsSection';
import { TestimonialSection } from '@/components/testimonials/TestimonialSection';
import PreFooterCTA from '@/components/PreFooterCTA';
import Footer from '@/components/Footer';
import HowItWorks from '@/components/external/HowItWorks';

const Index = () => {
  return (
    <div className="w-full min-h-screen bg-background">
      <Header />
      <main className="max-w-[1422px] relative w-full h-[1015px] overflow-hidden mx-auto my-0 max-md:max-w-[991px] max-md:h-auto max-md:p-5 max-sm:max-w-screen-sm">
        <BackgroundImages />
        <Hero />
        <ContentImages />
        <BottomSection />
      </main>
      <TrustedOrganizations />
      <FigmaCloneSection />
      <ImpactSection />
      <GlobalGoalsSection />
      <FounderSection />
      <WhatWeOffer />
      <HRStatsSection />
      <HowItWorks />
      <TestimonialSection />
      <PreFooterCTA />
      <Footer />
    </div>
  );
};

export default Index;
