import React from 'react';

const ContentImages: React.FC = () => {
  return (
    <section className="relative">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/53e87441b608925ae653691976593d9e7cf84479?width=707"
        alt="Financial wellness illustration"
        className="absolute w-[353px] h-[460px] shrink-0 left-[893px] top-[149px] max-md:relative max-md:w-full max-md:max-w-[353px] max-md:h-auto max-md:mx-auto max-md:my-5 max-md:left-0 max-md:top-0"
        loading="lazy"
      />

      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/3378ac2a07fe6d8d2db8aea261ba0a27ee1dabf0?width=793"
        alt="Team financial education illustration"
        className="absolute w-[396px] h-[512px] shrink-0 left-[54px] top-[504px] max-md:relative max-md:w-full max-md:max-w-[396px] max-md:h-auto max-md:mx-auto max-md:my-5 max-md:left-0 max-md:top-0"
        loading="lazy"
      />
    </section>
  );
};

export default ContentImages;
