
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, Info } from 'lucide-react';

interface SessionCountdownProps {
  sessionDate: string;
  sessionTime: string;
  sessionLink: string;
}

export const SessionCountdown = ({ sessionDate, sessionTime, sessionLink }: SessionCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isSessionTime, setIsSessionTime] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const sessionDateTime = new Date(`${sessionDate} ${sessionTime}`);
      const now = new Date();
      const difference = sessionDateTime.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
        setIsSessionTime(false);
      } else {
        setIsSessionTime(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [sessionDate, sessionTime]);

  const tips = [
    "Test your internet connection 15 minutes before the session",
    "Prepare your questions in advance for maximum benefit",
    "Ensure you're in a quiet environment for the call",
    "Have a notepad ready to jot down important points"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Session Countdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isSessionTime ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-2">Your session is ready!</h3>
              <p className="text-green-700 mb-4">Click below to join your session now</p>
              <Button 
                onClick={() => window.open(sessionLink, '_blank')}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Session Now
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
                <div className="text-sm text-gray-600">Hours</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
                <div className="text-sm text-gray-600">Seconds</div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Session Tips</span>
              </div>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Please join the session 5 minutes before the scheduled time</li>
                <li>• Sessions are recorded for quality assurance purposes</li>
                <li>• Rescheduling must be done 24 hours in advance</li>
                <li>• No-show sessions will be charged as completed</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
