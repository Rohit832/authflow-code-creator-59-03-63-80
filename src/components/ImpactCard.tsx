import React from 'react';

export interface ImpactCardProps {
  image: string;
  text: string;
  imageAlt: string;
}

export const ImpactCard: React.FC<ImpactCardProps> = ({ image, text, imageAlt }) => {
  return (
    <article className="bg-card border border-border text-foreground text-center w-full px-8 py-12 rounded-2xl shadow-sm transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <img
        src={image}
        alt={imageAlt}
        className="aspect-square object-contain w-28 h-28 mx-auto"
        loading="lazy"
      />
      <p className="mt-6 text-lg font-medium">
        {text}
      </p>
    </article>
  );
};

export default ImpactCard;
