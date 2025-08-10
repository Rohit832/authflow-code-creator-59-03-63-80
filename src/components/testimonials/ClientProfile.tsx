import React from 'react';
import { Star } from 'lucide-react';

interface ClientProfileProps {
  name: string;
  title: string;
  avatar: string;
  className?: string;
  rating?: number; // 1-5 stars
}

export const ClientProfile: React.FC<ClientProfileProps> = ({
  name,
  title,
  avatar,
  className = "",
  rating,
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-stretch gap-[13px]">
        <img
          src={avatar}
          alt={`${name} profile`}
          loading="lazy"
          className="aspect-square object-cover w-14 h-14 shrink-0 rounded-full border-2 border-gray-200"
        />
        <div className="my-auto">
          <div className="font-semibold text-[15px] leading-[22px] text-black">{name}</div>
          <div className="text-[14px] leading-[24px] text-black">{title}</div>
        </div>
      </div>
      {typeof rating === 'number' && rating > 0 ? (
        <div className="ml-4 flex items-center gap-1 text-[hsl(var(--rating-star))]" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={i < rating ? 'fill-[hsl(var(--rating-star))] text-[hsl(var(--rating-star))]' : 'text-foreground/20'}
              size={16}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};