import React from 'react';

export const BackgroundSVG: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <svg
        width="1512"
        height="936"
        viewBox="0 0 1512 936"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-[936px] absolute left-0 top-0"
        style={{ fill: '#14BA8C' }}
        role="img"
        aria-label="Curved green background"
      >
        <path
          d="M0 0H1512V842.249C1512 842.249 806 933.23 733.5 935.954C661 938.678 0 820.458 0 820.458V0Z"
          fill="#14BA8C"
        />
      </svg>
    </div>
  );
};