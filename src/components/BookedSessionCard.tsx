
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, MessageCircle, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookedSession {
  id: string;
  session_id?: string;
  status: string;
  credits_used?: number;
  booking_date?: string;
  payment_amount?: number;
  session_date?: string | null;
  session_time?: string | null;
  session_link?: string | null;
  coach_id?: string | null;
  coach?: {
    full_name: string;
    avatar_url?: string;
  } | null;
  session?: {
    title: string;
    description: string;
    session_date: string;
    session_time: string;
    duration: string;
    session_type: string;
    location: string;
    image_url?: string;
  };
}

interface BookedSessionCardProps {
  booking: BookedSession;
}

export const BookedSessionCard = ({ booking }: BookedSessionCardProps) => {
  const navigate = useNavigate();

  // Handle session bookings
  const sessionData = booking.session || {
    title: 'Financial Consultation',
    description: 'Financial consultation session',
    session_date: booking.session_date || '',
    session_time: booking.session_time || '',
    duration: '60 mins',
    session_type: '1:1',
    location: 'Online',
  };

  const sessionDate = sessionData.session_date ? new Date(sessionData.session_date) : null;
  const isUpcoming = sessionDate ? sessionDate > new Date() : false;

  const handleJoinSession = () => {
    // Use actual session link if available, otherwise fallback to generic link
    const sessionLink = booking.session_link || 'https://meet.google.com';
    if (sessionData.location.toLowerCase().includes('online')) {
      window.open(sessionLink, '_blank');
    } else {
      alert(`Session location: ${sessionData.location}`);
    }
  };

  const handleChat = () => {
    console.log('Chat button clicked for booking:', booking.id);
    try {
      navigate(`/client-chat/${booking.id}`);
      console.log('Navigation successful to:', `/client-chat/${booking.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="w-5 h-5 text-green-600" />
            {sessionData.title}
          </CardTitle>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Booked
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">{sessionData.description}</p>
          
          {sessionDate && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{sessionDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{sessionData.session_time} ({sessionData.duration})</span>
              </div>
              {sessionData.session_type !== '1:1' && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{sessionData.session_type}</span>
                </div>
              )}
            </div>
          )}

          {booking.coach && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Coach: {booking.coach.full_name}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-green-200">
            <div className="text-sm text-gray-600">
              <span><span className="font-medium">Credits used:</span> {booking.credits_used}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleChat}
                className="flex items-center gap-1"
                type="button"
              >
                <MessageCircle className="w-4 h-4" />
                {booking.coach ? `Chat with ${booking.coach.full_name}` : 'Chat with Coach'}
              </Button>
              {isUpcoming && sessionDate && (
                <Button 
                  size="sm"
                  onClick={handleJoinSession}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                >
                  <Video className="w-4 h-4" />
                  Join Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
