
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import coachAvatar from '@/assets/coach-avatar.png';

interface CoachingSessionCardProps {
  sessionType: 'coaching' | 'short_session';
  title: string;
  description: string;
  coachName: string;
  dateAvailable: string;
  creditsRequired: number;
  onBook: () => void;
}

export const CoachingSessionCard = ({
  sessionType,
  title,
  description,
  coachName,
  dateAvailable,
  creditsRequired,
  onBook
}: CoachingSessionCardProps) => {
  return (
    <Card className="border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary" className="bg-teal-50 text-teal-700 text-xs font-medium">
              Premium Coaching
            </Badge>
            <Badge variant="outline" className="text-xs">
              Personal Consultation
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900">
            Book Your Exclusive 1:1 Financial Consultation
          </h3>
          
          {/* Coach Card */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img 
                src={coachAvatar} 
                alt="Financial Coach"
                className="w-24 h-32 object-cover rounded-lg border-2 border-teal-200"
              />
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg mb-2">
                {title}
              </h4>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {description}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-500 font-medium">Next Available</span>
                <span className="text-xs text-teal-600">→</span>
                <Badge variant="outline" className="text-xs px-2 py-1 border-teal-300 bg-teal-50 text-teal-700 font-medium">
                  {dateAvailable}
                </Badge>
              </div>
              
              <Button 
                onClick={onBook}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2.5 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Schedule Private Consultation
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <Button variant="link" className="text-teal-600 p-0 h-auto text-sm font-medium hover:underline">
              About Private Consultations →
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
