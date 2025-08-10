import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <header className="relative z-10">
      <h1 className="w-[487px] text-white text-[26px] font-normal absolute h-[31px] left-[140px] top-[82px] max-md:w-full max-md:text-[22px] max-md:left-5 max-md:top-10 max-sm:text-lg max-sm:left-4 max-sm:top-[30px]">
        Why Finsage?
      </h1>

      <h2 className="w-[487px] text-black text-5xl font-bold absolute h-[232px] left-[140px] top-[138px] max-md:w-full max-md:text-4xl max-md:h-auto max-md:mb-[30px] max-md:left-5 max-md:top-20 max-sm:text-[28px] max-sm:w-[calc(100%_-_32px)] max-sm:left-4 max-sm:top-[60px]">
        Because money stress isn't just personal. It shows up at work too.
      </h2>

      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/2d77a02028ccadb495a0b666bf197eb6eda36495?width=824"
        alt="Financial wellness illustration showing people managing money stress"
        className="w-[412px] h-[536px] absolute left-[140px] top-[416px] max-md:w-[300px] max-md:h-[390px] max-md:-translate-x-2/4 max-md:left-2/4 max-md:top-[300px] max-sm:w-[250px] max-sm:h-[325px] max-sm:top-60"
      />
    </header>
  );
};