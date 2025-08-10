import React from 'react';
import { StatsCard } from './StatsCard';
import { CTAButtons } from './CTAButtons';

export const HRStatsSection: React.FC = () => {
  const statsData = [
    {
      percentage: '92%',
      description: 'of employees gained clarity after just 1 session'
    },
    {
      percentage: '4.9/5',
      description: 'coach satisfaction rating'
    },
    {
      percentage: '30%',
      description: 'average participation in first month'
    },
    {
      percentage: '16%',
      description: 'Up to 16% drop in attrition within 6 months'
    }
  ];

  return (
    <main className="max-w-none w-full min-h-[836px] relative flex flex-col items-center bg-[#CEE5CB] mx-auto pt-[73px] pb-[149px] px-0 max-md:max-w-[991px] max-md:pt-[50px] max-md:pb-[100px] max-md:px-5 max-sm:max-w-screen-sm max-sm:pt-[30px] max-sm:pb-[60px] max-sm:px-[15px]">
      <header className="flex flex-col items-center text-center">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/b17e4612482525a6d9f85763d17264c76c6f268d?width=192"
          alt="Company Highlight Logo"
          className="w-24 h-[58px] shrink-0 mb-[42px] max-sm:w-[60px] max-sm:h-9 max-sm:mb-5"
        />

        <h1 className="text-black text-center text-5xl font-bold w-[421px] h-[58px] mb-[25px] max-md:text-4xl max-md:w-auto max-md:max-w-[90%] max-sm:text-[28px] max-sm:mb-[15px]">
          <div>Why HRs Trust Us</div>
        </h1>

        <p className="w-[602px] text-black text-center text-[19px] font-normal leading-8 h-[33px] mb-[68px] max-md:text-base max-md:w-auto max-md:max-w-[90%] max-md:leading-6 max-sm:text-sm max-sm:leading-5 max-sm:mb-10">
          <div>Because your people deserve more than just policies</div>
        </p>
      </header>

      <section
        className="w-[1191px] h-[346px] shrink-0 relative flex items-center justify-between bg-[#F5EFDF] mb-[42px] px-[55px] py-0 rounded-[10px] max-md:w-full max-md:max-w-[900px] max-md:flex-wrap max-md:gap-10 max-md:h-auto max-md:px-5 max-md:py-10 max-sm:flex-col max-sm:gap-[30px] max-sm:px-[15px] max-sm:py-[30px]"
        aria-label="Company statistics and achievements"
      >
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            percentage={stat.percentage}
            description={stat.description}
          />
        ))}
      </section>

      <section aria-label="Call to action buttons">
        <CTAButtons />
      </section>
    </main>
  );
};