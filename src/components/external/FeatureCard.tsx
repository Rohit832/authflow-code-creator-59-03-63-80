import React from 'react';

interface FeatureCardProps {
  image: string;
  altText: string;
  title: string; // can contain <br />
  isNumbered?: boolean;
  numberText?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  image,
  altText,
  title,
  isNumbered = false,
  numberText,
}) => {
  return (
    <div className="flex flex-col items-center relative max-sm:mb-5 w-[160px] md:w-[190px]">
      <div className="relative w-28 h-28 md:w-32 md:h-32">
        <img src={image} alt={altText} className="w-full h-full object-contain" loading="lazy" />
        {isNumbered && numberText && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-foreground">
            {numberText}
          </div>
        )}
      </div>
      {/* eslint-disable-next-line react/no-danger */}
      <div className="text-xl font-medium text-foreground text-center mt-2" dangerouslySetInnerHTML={{ __html: title }} />
    </div>
  );
};

export default FeatureCard;
