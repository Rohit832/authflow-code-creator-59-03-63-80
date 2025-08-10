import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIndividualAuth } from '@/hooks/useIndividualAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EnhancedIndividualSessionCard } from '@/components/EnhancedIndividualSessionCard';
import { Video, BookOpen, Settings, LogOut, Plus, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function IndividualDashboard() {
  const { user, loading: authLoading, signOut } = useIndividualAuth();
  const navigate = useNavigate();
  
  const [oneOnOneSessions, setOneOnOneSessions] = useState([]);
  const [shortPrograms, setShortPrograms] = useState([]);
  const [financialTools, setFinancialTools] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/individual-auth');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all sessions and programs
      const [oneOnOneRes, shortProgramsRes, toolsRes, purchasesRes] = await Promise.all([
        supabase.from('one_on_one_sessions').select('*').eq('is_active', true),
        supabase.from('short_programs').select('*').eq('is_active', true),
        supabase.from('financial_tools').select('*').eq('is_active', true),
        supabase.from('individual_purchases').select('*').eq('user_id', user.id)
      ]);

      setOneOnOneSessions(oneOnOneRes.data || []);
      setShortPrograms(shortProgramsRes.data || []);
      setFinancialTools(toolsRes.data || []);
      setPurchases(purchasesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getPurchaseForItem = (itemId: string, itemType: string) => {
    console.log('Looking for purchase:', { itemId, itemType, purchases });
    return purchases.find(p => p.item_id === itemId && p.item_type === itemType && p.status === 'purchased');
  };

  const handlePurchase = async (itemId: string, itemType: string, price: number) => {
    // Refresh data to get updated purchase status
    await fetchData();
    return { success: true };
  };

  const handleCancel = async (purchaseId: string) => {
    try {
      const { error } = await supabase
        .from('individual_purchases')
        .update({ 
          status: 'cancelled',
          cancellation_date: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) throw error;

      toast.success('Purchase cancelled successfully');
      fetchData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel purchase');
      return { error: 'Cancel failed' };
    }
  };

  const handleStartChat = () => {
    console.log('Chat button clicked, navigating to /individual-chat');
    try {
      navigate('/individual-chat');
      console.log('Navigation called successfully');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderSessionSection = (
    title: string,
    icon: React.ReactNode,
    sessions: any[],
    itemType: 'one_on_one' | 'short_program' | 'financial_tool',
    description: string
  ) => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{sessions.length} available</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sessions.map((session) => (
              <EnhancedIndividualSessionCard
                key={session.id}
                session={session}
                itemType={itemType}
                purchase={getPurchaseForItem(session.id, itemType)}
                onPurchase={(sessionId) => handlePurchase(sessionId, itemType, session.price_inr)}
                onCancel={handleCancel}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No {title.toLowerCase()} available</div>
            <p className="text-sm text-muted-foreground">Check back later for new sessions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome, {user.full_name}
            </h1>
            <p className="text-muted-foreground mt-2">Discover and manage your learning journey</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleStartChat} 
              className="gap-2"
              type="button"
            >
              <MessageCircle className="h-4 w-4" />
              Chat with Coach
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="space-y-8">
          {renderSessionSection(
            "1-on-1 Sessions",
            <Video className="h-6 w-6 text-primary" />,
            oneOnOneSessions,
            'one_on_one',
            "Personalized coaching sessions with expert mentors"
          )}

          {renderSessionSection(
            "Short Programs",
            <BookOpen className="h-6 w-6 text-primary" />,
            shortPrograms,
            'short_program',
            "Structured learning programs for focused skill development"
          )}

          {renderSessionSection(
            "Financial Tools",
            <Settings className="h-6 w-6 text-primary" />,
            financialTools,
            'financial_tool',
            "Interactive tools and resources for financial management"
          )}
        </div>
      </div>
    </div>
  );
}