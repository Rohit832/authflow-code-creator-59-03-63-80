import { useState, useEffect } from 'react';

interface SimpleCountdownProps {
  sessionDate: string;
  sessionTime: string;
}

export const SimpleCountdown = ({ sessionDate, sessionTime }: SimpleCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!sessionDate || !sessionTime) return;

      // Parse the ISO date string and combine with time
      const date = new Date(sessionDate);
      const [hours, minutes, seconds] = sessionTime.split(':').map(Number);
      
      // Create session datetime by setting the time on the parsed date
      const sessionDateTime = new Date(date);
      sessionDateTime.setHours(hours, minutes, seconds || 0, 0);
      
      const now = new Date();
      const difference = sessionDateTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [sessionDate, sessionTime]);

  return (
    <div className="flex gap-1 text-xs">
      <div className="bg-white/80 rounded px-2 py-1 text-center min-w-[28px] shadow-sm">
        <div className="font-bold text-blue-900">{timeLeft.days}</div>
        <div className="text-[10px] text-blue-700">D</div>
      </div>
      <div className="bg-white/80 rounded px-2 py-1 text-center min-w-[28px] shadow-sm">
        <div className="font-bold text-blue-900">{timeLeft.hours}</div>
        <div className="text-[10px] text-blue-700">H</div>
      </div>
      <div className="bg-white/80 rounded px-2 py-1 text-center min-w-[28px] shadow-sm">
        <div className="font-bold text-blue-900">{timeLeft.minutes}</div>
        <div className="text-[10px] text-blue-700">M</div>
      </div>
      <div className="bg-white/80 rounded px-2 py-1 text-center min-w-[28px] shadow-sm">
        <div className="font-bold text-blue-900">{timeLeft.seconds}</div>
        <div className="text-[10px] text-blue-700">S</div>
      </div>
    </div>
  );
};