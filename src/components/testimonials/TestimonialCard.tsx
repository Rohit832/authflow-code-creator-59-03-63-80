import React from 'react';
import { ClientProfile } from './ClientProfile';

interface TestimonialCardProps {
  quote: string;
  clientName: string;
  clientTitle: string;
  clientAvatar: string;
  badgeText: string;
  badgeColor: string;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  clientName,
  clientTitle,
  clientAvatar,
  badgeText,
  badgeColor,
  className = ""
}) => {
  return (
    <article className={className}>
      <div className="bg-white px-[38px] py-10 rounded-[13px_13px_0px_0px] border-r-4 border-b-4 border-black border-t border-l max-md:max-w-full max-md:px-5">
        <blockquote className="text-2xl font-medium leading-[43px] max-md:max-w-full">
          {quote}
        </blockquote>
        <div className="w-full text-[17px] font-normal leading-[26px] mt-[47px] max-md:max-w-full max-md:mt-10">
          <div className="w-full h-[0.85px] bg-foreground/20 mt-6" />
          <div className="flex w-full items-center gap-[40px_119px] mt-[26px] max-md:max-w-full">
            <ClientProfile
              name={clientName}
              title={clientTitle}
              avatar={clientAvatar}
              className="self-stretch my-auto rounded-[0px_0px_0px_0px]"
              rating={5}
            />
          </div>
        </div>
      </div>
      <div
        className={`z-10 flex flex-col items-center text-[15px] text-white font-semibold text-center uppercase tracking-[0.61px] justify-center -mt-2.5 px-[70px] py-[17px] rounded-[0px_0px_5px_5px] border-black border-r border-b border-l max-md:max-w-full max-md:mr-[3px] max-md:px-5`}
        style={{ backgroundColor: badgeColor }}
      >
        <div>{badgeText}</div>
      </div>
    </article>
  );
};