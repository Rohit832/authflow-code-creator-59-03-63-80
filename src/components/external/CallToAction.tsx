import React from 'react';

const CallToAction: React.FC = () => {
  return (
    <section className="relative w-full max-w-[1120px] mx-auto px-5 md:px-0 mt-6">
      <button
        className="flex justify-center items-center shadow-[0_6.5px_0_0_#000] text-2xl font-semibold text-foreground text-center tracking-[0.96px] uppercase bg-[hsl(var(--yellow-bg))] px-8 py-3 rounded-[8px] border border-solid border-foreground max-md:text-xl max-md:p-5 max-sm:text-lg max-sm:tracking-[0.5px] max-sm:px-5 max-sm:py-[15px] w-full hover:shadow-[0_4px_0_0_#000] hover:translate-y-[2px] transition-all duration-150"
        aria-label="Monthly usage and wellness reports"
      >
        You receive monthly usage + wellness reports
        <br />
        It's plug-and-play. But powerful
      </button>
    </section>
  );
};

export default CallToAction;
