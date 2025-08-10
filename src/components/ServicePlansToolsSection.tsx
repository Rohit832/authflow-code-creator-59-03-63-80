import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Eye, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServicePlan {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration: string | null;
  features: string[] | null;
  plan_type: string;
}

interface ServicePlansToolsSectionProps {
  isPlanPurchased: (planId: string) => boolean;
  getPlanStatus: (planId: string) => string | null;
  navigate: (path: string) => void;
}

export const ServicePlansToolsSection = ({ isPlanPurchased, getPlanStatus, navigate }: ServicePlansToolsSectionProps) => {
  const [toolsPlans, setToolsPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToolsPlans();
    
    // Add focus listener to refresh when coming back from payment
    const handleFocus = () => {
      fetchToolsPlans();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchToolsPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('service_plans')
        .select('*')
        .eq('plan_type', 'tools')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching tools plans:', error);
        return;
      }

      setToolsPlans(data || []);
    } catch (error) {
      console.error('Error fetching tools plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanAction = (plan: ServicePlan, isPurchased: boolean) => {
    if (isPurchased) {
      navigate('/client-tools-access');
    } else {
      // Navigate to payment with plan details
      const searchParams = new URLSearchParams({
        title: plan.title,
        price: plan.price.toString(),
        duration: plan.duration || 'Lifetime access',
        serviceId: plan.id,
        category: 'tools'
      });
      navigate(`/client-payment?${searchParams.toString()}`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Self-Guided Tools</CardTitle>
          <p className="text-gray-600">No fluff. Just the tools you wish someone had handed you years ago.</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading tools...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (toolsPlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Self-Guided Tools</CardTitle>
          <p className="text-gray-600">No fluff. Just the tools you wish someone had handed you years ago.</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Tools packages coming soon!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Self-Guided Tools</CardTitle>
        <p className="text-gray-600">No fluff. Just the tools you wish someone had handed you years ago.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {toolsPlans.map(plan => {
            const isPurchased = isPlanPurchased(plan.id);
            const planStatus = getPlanStatus(plan.id);
            return (
                <Card 
                key={plan.id} 
                className={`border transition-all duration-200 flex flex-col ${
                  isPurchased 
                    ? 'border-green-500 bg-green-50' 
                    : planStatus === 'cancelled'
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-green-200 hover:shadow-lg'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-green-800">{plan.title}</CardTitle>
                    {isPurchased && (
                      <Badge className="bg-green-500 text-white ml-2 flex-shrink-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Purchased
                      </Badge>
                    )}
                    {planStatus === 'cancelled' && (
                      <Badge className="bg-orange-500 text-white ml-2 flex-shrink-0">
                        <X className="w-3 h-3 mr-1" />
                        Cancelled
                      </Badge>
                    )}
                  </div>
                  {plan.duration && (
                    <Badge variant="outline" className="w-fit text-xs">{plan.duration}</Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <p className="text-sm text-gray-600">{plan.description}</p>
                  
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2 flex-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div className="flex items-end justify-between pt-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-green-600">
                        ₹{plan.price.toLocaleString()}
                      </span>
                    </div>
                    <Button 
                      className={`whitespace-nowrap ${
                        isPurchased 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : planStatus === 'cancelled'
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      onClick={() => handlePlanAction(plan, isPurchased)}
                    >
                      {isPurchased ? (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          View Tools
                        </>
                      ) : planStatus === 'cancelled' ? (
                        <>
                          Repurchase ₹{plan.price.toLocaleString()}
                        </>
                      ) : (
                        <>
                          Pay ₹{plan.price.toLocaleString()}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};