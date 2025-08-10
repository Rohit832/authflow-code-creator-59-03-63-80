import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Calendar, Clock, Play, ExternalLink, IndianRupee } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import { supabase } from '@/integrations/supabase/client';

interface IndividualSession {
  id: string;
  title: string;
  description: string | null;
  price_inr: number;
  duration: string | null;
  category: string | null;
  thumbnail_url: string | null;
  session_url: string | null;
}

interface Purchase {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  status: 'purchased' | 'cancelled';
  purchase_date: string;
  cancellation_date: string | null;
  can_rebook: boolean;
}

interface EnhancedIndividualSessionCardProps {
  session: IndividualSession;
  itemType: 'one_on_one' | 'short_program' | 'financial_tool';
  purchase?: Purchase;
  onPurchase: (sessionId: string) => Promise<{ success?: boolean; error?: string }>;
  onCancel: (purchaseId: string) => Promise<{ success?: boolean; error?: string }>;
}

export const EnhancedIndividualSessionCard = ({
  session,
  itemType,
  purchase,
  onPurchase,
  onCancel,
}: EnhancedIndividualSessionCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionLink, setSessionLink] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { initiatePayment, isProcessing } = useRazorpayPayment();

  // Fetch session link when purchase exists and is purchased
  useEffect(() => {
    const fetchSessionLink = async () => {
      if (!purchase || purchase.status !== 'purchased') {
        setSessionLink(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('session_links')
          .select('session_url')
          .eq('purchase_id', purchase.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching session link:', error);
          return;
        }

        setSessionLink(data?.session_url || null);
      } catch (error) {
        console.error('Error fetching session link:', error);
      }
    };

    fetchSessionLink();
  }, [purchase]);

  const handlePurchaseClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmPurchase = async () => {
    setShowConfirmation(false);
    setIsLoading(true);
    try {
      // Get user profile for payment details
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: profile } = await supabase
        .from('individual_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      const sessionData = {
        id: session.id,
        title: session.title,
        price: session.price_inr,
        duration: session.duration || 'N/A',
        category: itemType, // Use the correct itemType passed from parent
        serviceId: session.id
      };

      const userDetails = {
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone_number
      };

      const result = await initiatePayment(sessionData, userDetails);
      
      if (result.success) {
        // Create a mock purchase object to update the UI immediately
        const mockPurchase = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          item_id: session.id,
          item_type: itemType,
          status: 'purchased' as const,
          purchase_date: new Date().toISOString(),
          cancellation_date: null,
          can_rebook: true,
          amount_paid: session.price_inr
        };
        
        // Update parent component data by calling onPurchase with the mock purchase
        await onPurchase(session.id);
        
        toast({
          title: "Payment Successful!",
          description: "You can now access this item.",
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Payment was cancelled or failed.",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
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
          title: "Purchase Cancelled",
          description: "Your purchase has been cancelled.",
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

  const handleJoinSession = () => {
    if (sessionLink) {
      window.open(sessionLink, '_blank');
    } else {
      toast({
        title: "Session URL Not Available", 
        description: "Admin hasn't shared the session link yet. Please contact admin.",
        variant: "destructive",
      });
    }
  };

  const isPurchased = purchase?.status === 'purchased';
  const isCancelled = purchase?.status === 'cancelled';

  const getActionButton = () => {
    if (itemType === 'one_on_one') return 'Join Session';
    if (itemType === 'short_program') return 'Start Program';
    return 'Open Tool';
  };

  const getActionIcon = () => {
    if (itemType === 'one_on_one') return <Calendar className="w-4 h-4 mr-2" />;
    if (itemType === 'short_program') return <Play className="w-4 h-4 mr-2" />;
    return <ExternalLink className="w-4 h-4 mr-2" />;
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{session.title}</CardTitle>
          {session.category && (
            <Badge variant="secondary" className="capitalize">
              {session.category}
            </Badge>
          )}
        </div>
        {session.description && (
          <CardDescription className="line-clamp-2">{session.description}</CardDescription>
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
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        {!purchase && (
            <Button 
              onClick={handlePurchaseClick} 
              disabled={isLoading || isProcessing}
              className="w-full"
            >
              {(isLoading || isProcessing) ? 'Processing...' : `Pay ₹${session.price_inr.toLocaleString()}`}
            </Button>
        )}
        
        {isPurchased && (
          <>
            <Badge variant="default" className="w-full justify-center bg-green-600">
              Purchased
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleJoinSession}
            >
              {getActionIcon()}
              {getActionButton()}
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Purchase'}
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
                onClick={handlePurchaseClick}
                disabled={isLoading || isProcessing}
                variant="outline"
                className="w-full"
              >
                {(isLoading || isProcessing) ? 'Processing...' : 'Rebook'}
              </Button>
            )}
          </div>
        )}
      </CardFooter>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Confirm Purchase
            </DialogTitle>
            <DialogDescription>
              Please review your purchase details before proceeding to payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div>
                <h4 className="font-semibold text-lg">{session.title}</h4>
                {session.description && (
                  <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span>{session.duration || 'N/A'}</span>
              </div>
              
              {session.category && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="secondary" className="capitalize">{session.category}</Badge>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{itemType.replace('_', '-')}</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">₹{session.price_inr.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={isLoading || isProcessing}
              className="min-w-[120px]"
            >
              {(isLoading || isProcessing) ? 'Processing...' : 'Confirm & Pay'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};