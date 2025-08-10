import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface IndividualSession {
  id: string;
  title: string;
  description: string | null;
  session_type: 'one-on-one' | 'short-program' | 'self-guided-tool';
  duration: string | null;
  price_inr: number;
  tags: string[] | null;
}

interface SessionPurchase {
  id: string;
  user_id: string;
  session_id: string;
  status: 'purchased' | 'cancelled';
  purchase_date: string;
  cancellation_date: string | null;
  can_rebook: boolean;
}

interface IndividualSessionCardProps {
  session: IndividualSession;
  purchase?: SessionPurchase;
  onPurchase: (sessionId: string) => Promise<{ success?: boolean; error?: string }>;
  onCancel: (purchaseId: string) => Promise<{ success?: boolean; error?: string }>;
}

export const IndividualSessionCard = ({
  session,
  purchase,
  onPurchase,
  onCancel,
}: IndividualSessionCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const result = await onPurchase(session.id);
      if (result.success) {
        toast({
          title: "Session Purchased!",
          description: "You can now access this session.",
        });
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "An error occurred during purchase.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!purchase) return;
    
    setIsLoading(true);
    try {
      const result = await onCancel(purchase.id);
      if (result.success) {
        toast({
          title: "Session Cancelled",
          description: "Your session has been cancelled.",
        });
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.error || "An error occurred during cancellation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPurchased = purchase?.status === 'purchased';
  const isCancelled = purchase?.status === 'cancelled';

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{session.title}</CardTitle>
          <Badge variant="secondary" className="capitalize">
            {session.session_type.replace('-', ' ')}
          </Badge>
        </div>
        {session.description && (
          <CardDescription>{session.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-2">
          {session.duration && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              {session.duration}
            </div>
          )}
          
          <div className="text-2xl font-bold text-primary">
            ₹{session.price_inr.toLocaleString()}
          </div>
          
          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {session.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        {!purchase && (
          <Button 
            onClick={handlePurchase} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : `Pay ₹${session.price_inr.toLocaleString()}`}
          </Button>
        )}
        
        {isPurchased && (
          <>
            <div className="flex items-center gap-2 w-full">
              <Badge variant="default" className="flex-1 justify-center">
                Purchased
              </Badge>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
            
            {session.session_type === 'one-on-one' && (
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Join Session
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Session'}
            </Button>
          </>
        )}
        
        {isCancelled && (
          <div className="w-full space-y-2">
            <Badge variant="destructive" className="w-full justify-center">
              Cancelled
            </Badge>
            {purchase?.can_rebook && (
              <Button 
                onClick={handlePurchase}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Rebook'}
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};