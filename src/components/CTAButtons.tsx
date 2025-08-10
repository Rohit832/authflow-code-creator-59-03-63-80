import React, { useState } from 'react';

export const CTAButtons: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      // In a real app, this would trigger an actual download
      console.log('HR Deck download initiated');
    }, 1000);
  };

  const handleBookPilot = () => {
    setIsBooking(true);
    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      // In a real app, this would open a booking form or redirect
      console.log('Pilot booking initiated');
    }, 1000);
  };

  return (
    <div className="flex gap-[30px] items-center max-md:flex-col max-md:gap-5 max-md:w-full max-md:max-w-[400px] max-sm:gap-[15px]">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex w-[324px] justify-center items-center gap-[7.549px] border shadow-[3px_4px_0_0_#000] h-[49px] cursor-pointer bg-[#14BA8C] px-3 py-2.5 rounded-[5px] border-solid border-black max-md:w-full max-md:max-w-[350px] hover:bg-[#12a67a] hover:shadow-[2px_3px_0_0_#000] active:shadow-[1px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
        aria-label="Download HR Deck"
      >
        <div className="text-white text-2xl font-normal max-md:text-xl max-sm:text-lg">
          <div>{isDownloading ? 'Downloading...' : 'Download Our HR Deck'}</div>
        </div>
      </button>

      <button
        onClick={handleBookPilot}
        disabled={isBooking}
        className="flex w-[316px] h-[49px] flex-col justify-center items-center gap-2.5 shrink-0 border shadow-[3px_4px_0_0_#000] cursor-pointer bg-white px-[18px] py-2 rounded-[5px] border-solid border-black max-md:w-full max-md:max-w-[350px] hover:bg-gray-50 hover:shadow-[2px_3px_0_0_#000] active:shadow-[1px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
        aria-label="Book a pilot session"
      >
        <div className="text-black text-center text-2xl font-bold tracking-[0.96px] uppercase max-md:text-xl max-sm:text-lg">
          <div>{isBooking ? 'Booking...' : 'Book a Pilot Now'}</div>
        </div>
      </button>
    </div>
  );
};