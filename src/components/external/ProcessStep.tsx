import React from 'react';

interface ProcessStepProps {
  icon: string;
  title: string;
  backgroundColor: string; // arbitrary Tailwind bg class e.g. bg-[rgba(...)]
}

const ProcessStep: React.FC<ProcessStepProps> = ({ icon, title, backgroundColor }) => {
  return (
    <div className={`w-full flex border shadow-[3px_4px_0_0_#000] opacity-90 ${backgroundColor} mb-4 px-7 py-[22px] rounded-lg border-solid border-foreground max-sm:px-5 max-sm:py-[18px]`}>
      <div className="flex items-center gap-[17px]">
        <div>
          <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: icon }}
          />
        </div>
        <div className="text-xl font-bold text-foreground max-sm:text-lg">
          {title}
        </div>
      </div>
    </div>
  );
};

export default ProcessStep;
