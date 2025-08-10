import React from 'react';

const BackgroundImages: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/259fd9cb5ec272fa0f4dbe8707f7051315f72bcf?width=1484"
        alt="Background radial grid decoration"
        className="absolute w-[742px] h-[493px] -rotate-90 opacity-40 shrink-0 left-[929px] top-0 max-md:hidden"
        loading="lazy"
      />

      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/6bb18c98082fa2099505f942474bafe60d68eac5?width=591"
        alt="Isolation mode accent shape"
        className="absolute w-[296px] h-[157px] flex justify-center items-center shrink-0 left-[491px] top-[521px] max-md:relative max-md:mx-auto max-md:my-5 max-md:left-0 max-md:top-0"
        loading="lazy"
      />
    </div>
  );
};

export default BackgroundImages;
