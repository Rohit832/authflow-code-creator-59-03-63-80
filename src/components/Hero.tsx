import React from 'react';

const Hero: React.FC = () => {
  return (
    <header className="relative">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/3f23222970882f9e0d4dc51c1bcbfc89d95948dc?width=192"
        alt="Highlight decoration for headline"
        className="absolute w-24 h-[58px] shrink-0 left-0 top-[98px] max-md:relative max-md:mb-5 max-md:left-0 max-md:top-0"
        loading="lazy"
      />

      <div className="absolute w-[803px] h-[213px] text-foreground text-[59px] font-extrabold left-[54px] top-[140px] max-md:relative max-md:w-full max-md:text-5xl max-md:mb-5 max-md:left-0 max-md:top-0 max-sm:text-4xl">
        <h1 className="font-bold text-[59px] text-foreground max-sm:text-4xl">
          Finsage. Where Financial Wellness Meets Wisdom
        </h1>
      </div>

      <div className="absolute w-[640px] h-[71px] shrink-0 text-xl font-normal left-[54px] top-[393px] max-md:relative max-md:w-full max-md:mb-[30px] max-md:left-0 max-md:top-0 max-sm:text-lg text-muted-foreground">
        <p className="font-normal text-xl max-sm:text-lg">
          Because your team deserves more than just health benefits. They
          deserve peace with their money too
        </p>
      </div>
    </header>
  );
};

export default Hero;
