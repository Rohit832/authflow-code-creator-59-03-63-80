
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import coachAvatar from '@/assets/coach-avatar.png';

interface SessionMatchingCardProps {
  sessionType: '1:1' | 'group';
  title: string;
  description: string;
  dateAvailable: string;
  creditsRequired: number;
  imageUrl?: string;
  isBooked?: boolean;
  isBooking?: boolean;
  bookingStatus?: string | null;
  onBook: () => void;
  onAbout: () => void;
  onViewDetails?: () => void;
  onCancelBooking?: () => void;
}

export const SessionMatchingCard = ({
  sessionType,
  title,
  description,
  dateAvailable,
  creditsRequired,
  imageUrl,
  isBooked = false,
  isBooking = false,
  bookingStatus = null,
  onBook,
  onAbout,
  onViewDetails,
  onCancelBooking
}: SessionMatchingCardProps) => {
  return (
    <Card className="border-border bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs font-medium">
              Premium Coaching
            </Badge>
            <Badge variant="outline" className="text-xs">
              {sessionType === '1:1' ? 'Personal Consultation' : 'Group Consultation'}
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground">
            Book Your {sessionType === '1:1' ? 'Exclusive 1:1' : 'Group'} Consultation
          </h3>
          
          {/* Coach Card */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img 
                src={imageUrl || coachAvatar} 
                alt="Financial Coach"
                className="w-28 h-36 object-cover rounded-lg border-2 border-primary/20"
                style={{
                  imageRendering: 'crisp-edges',
                } as React.CSSProperties}
                loading="lazy"
                decoding="async"
              />
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-foreground text-lg mb-2">
                {title}
              </h4>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {description}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground font-medium">Next Available</span>
                <span className="text-xs text-primary">→</span>
                <Badge variant="outline" className="text-xs px-2 py-1 border-primary/30 bg-primary/5 text-primary font-medium">
                  {dateAvailable}
                </Badge>
              </div>
              
              {bookingStatus === 'cancelled' ? (
                <div className="space-y-2">
                  <Button 
                    variant="outline"
                    onClick={onBook}
                    className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 text-sm font-medium py-2.5 bg-orange-50/50"
                  >
                    📅 Rebook Consultation
                  </Button>
                  <p className="text-xs text-orange-600 text-center font-medium">
                    Previous booking was cancelled - You can rebook
                  </p>
                </div>
              ) : isBooked || bookingStatus === 'booked' ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={onViewDetails}
                      className="flex-1 border-green-500 text-green-600 hover:bg-green-50 text-sm font-medium py-2.5 bg-green-50/50"
                    >
                      ✓ Booked - View Details
                    </Button>
                    {onCancelBooking && (
                      <Button 
                        variant="outline"
                        onClick={onCancelBooking}
                        className="border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium py-2.5 bg-red-50/50 px-3"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-green-600 text-center font-medium">
                    Your consultation has been confirmed
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={onBook}
                  disabled={isBooking}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2.5 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isBooking ? 'Booking...' : `Schedule ${sessionType === '1:1' ? 'Private' : 'Group'} Consultation`}
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <Button 
              variant="link" 
              onClick={onAbout}
              className="text-primary p-0 h-auto text-sm font-medium hover:underline"
            >
              About {sessionType === '1:1' ? 'Private' : 'Group'} Consultations →
            </Button>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1.5 font-bold shadow-sm">
              ₹ {creditsRequired} Credit{creditsRequired > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
