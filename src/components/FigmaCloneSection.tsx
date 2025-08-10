import React from 'react';
import { BackgroundSVG } from '@/components/BackgroundSVG';
import { HeroSection } from '@/components/HeroSection';
import { ContentSection } from '@/components/ContentSection';
import { CallToActionButton } from '@/components/CallToActionButton';
import { DecorativeShape } from '@/components/DecorativeShape';

const FigmaCloneSection = () => {
  const handleLearnMore = () => {
    console.log('Learn more clicked');
    window.open('mailto:contact@finsage.com?subject=Learn More About Finsage&body=Hi, I would like to learn more about Finsage financial wellness solutions for my organization.', '_blank');
  };

  return (
    <div
      className="max-w-none w-full h-[952px] relative overflow-hidden mx-auto max-md:max-w-[991px] max-md:h-auto max-md:min-h-screen max-md:p-5 max-sm:max-w-screen-sm max-sm:p-4"
      role="main"
      aria-label="Finsage financial wellness landing page"
    >
      <BackgroundSVG />
      <HeroSection />
      <ContentSection />
      <CallToActionButton onClick={handleLearnMore} />
      <DecorativeShape />
    </div>
  );
};

export default FigmaCloneSection;