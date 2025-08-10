import React from 'react';
import FeatureSection from './FeatureSection';
import MapSection from './MapSection';

const GlobalGoalsSection: React.FC = () => {
  return (
    <section aria-labelledby="global-goals-heading" className="w-full bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 items-start">
        <header className="lg:col-span-2 mb-2">
          <h2 id="global-goals-heading" className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Built for India. Aligned with Global Goals
          </h2>
          <p className="text-muted-foreground text-lg mt-2 max-w-3xl">
            Whether you're a global firm with Indian teams or a homegrown startup that cares deeply — Finsage fits right in.
          </p>
        </header>
        <FeatureSection />
        <MapSection />
      </div>
      <link rel="canonical" href="/" />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How does Finsage align with global goals?', acceptedAnswer: { '@type': 'Answer', text: 'Our programs align with ESG, DEI and employee wellness policies while being tailored for India.' } },
            { '@type': 'Question', name: 'What benefits can teams expect?', acceptedAnswer: { '@type': 'Answer', text: 'Low-cost, high-impact employee perks that improve loyalty and wellbeing.' } }
          ]
        })
      }} />
    </section>
  );
};

export default GlobalGoalsSection;
