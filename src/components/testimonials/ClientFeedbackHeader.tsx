import React from 'react';

export const ClientFeedbackHeader: React.FC = () => {
  return (
    <header className="flex w-full flex-col items-center rounded-[0px_0px_0px_0px] max-md:max-w-full">
      <div className="text-black text-[15px] font-semibold leading-none text-center">
        Client Feedback
      </div>
      <div className="flex w-44 max-w-full items-stretch text-[15px] text-white font-semibold whitespace-nowrap text-center uppercase leading-none mt-3">
        <img
          src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/7795bb24a399abb35f65e6b8b46de7f66e4e0f58?placeholderIfAbsent=true"
          alt="Client avatar 1"
          loading="lazy"
          className="aspect-[1] object-contain w-[55px] shrink-0 rounded-[43px] max-md:mr-[-15px]"
        />
        <img
          src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/aaa0fcd270620ee8385e7c06fc49c0fab28f0a7f?placeholderIfAbsent=true"
          alt="Client avatar 2"
          loading="lazy"
          className="aspect-[1] object-contain w-[55px] shrink-0 rounded-[43px]"
        />
        <img
          src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/5015df910dc72563ec408fa7b837624275401434?placeholderIfAbsent=true"
          alt="Client avatar 3"
          loading="lazy"
          className="aspect-[1.02] object-contain w-14 shrink-0 rounded-[43px]"
        />
        <div className="stroke-[3.41px] bg-black flex flex-col items-center w-14 justify-center h-14 stroke-white px-3.5 rounded-[50%] border-white border-solid border-[3px]">
          <div className="text-white">8k+</div>
        </div>
      </div>
      <h1 className="text-black text-[61px] font-semibold leading-none mt-[26px] max-md:max-w-full max-md:text-[40px]">
        Love from Our Clients
      </h1>
    </header>
  );
};