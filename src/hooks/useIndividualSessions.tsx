import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface IndividualSession {
  id: string;
  title: string;
  description: string | null;
  session_type: 'one-on-one' | 'short-program' | 'self-guided-tool';
  duration: string | null;
  price_inr: number;
  tags: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  admin_id: string | null;
}

interface SessionPurchase {
  id: string;
  user_id: string;
  session_id: string;
  status: 'purchased' | 'cancelled';
  purchase_date: string;
  cancellation_date: string | null;
  can_rebook: boolean;
  created_at: string;
  updated_at: string;
}

export const useIndividualSessions = () => {
  const [sessions, setSessions] = useState<IndividualSession[]>([]);
  const [purchases, setPurchases] = useState<SessionPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('individual_sessions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching individual sessions:', error);
        return;
      }

      setSessions((data || []) as IndividualSession[]);
    } catch (error) {
      console.error('Error in fetchSessions:', error);
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('session_purchases')
        .select('*')
        .eq('user_id', session.user.id)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        return;
      }

      setPurchases((data || []) as SessionPurchase[]);
    } catch (error) {
      console.error('Error in fetchUserPurchases:', error);
    }
  };

  const purchaseSession = async (sessionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Check if already purchased
      const existingPurchase = purchases.find(p => 
        p.session_id === sessionId && p.status === 'purchased'
      );
      
      if (existingPurchase) {
        throw new Error('You have already purchased this session');
      }

      const { data, error } = await supabase
        .from('session_purchases')
        .insert({
          user_id: session.user.id,
          session_id: sessionId,
          status: 'purchased'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPurchases(prev => [...prev, data as SessionPurchase]);
      return { success: true };
    } catch (error) {
      console.error('Error purchasing session:', error);
      return { error: error.message };
    }
  };

  const cancelPurchase = async (purchaseId: string) => {
    try {
      const { error } = await supabase
        .from('session_purchases')
        .update({
          status: 'cancelled',
          cancellation_date: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) {
        throw error;
      }

      setPurchases(prev => 
        prev.map(p => 
          p.id === purchaseId 
            ? { ...p, status: 'cancelled' as const, cancellation_date: new Date().toISOString() } as SessionPurchase
            : p
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Error cancelling purchase:', error);
      return { error: error.message };
    }
  };

  const getSessionsByType = (sessionType: string) => {
    return sessions.filter(session => session.session_type === sessionType);
  };

  const getPurchaseForSession = (sessionId: string) => {
    return purchases.find(p => p.session_id === sessionId);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSessions(), fetchUserPurchases()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    sessions,
    purchases,
    loading,
    refetch: () => Promise.all([fetchSessions(), fetchUserPurchases()]),
    purchaseSession,
    cancelPurchase,
    getSessionsByType,
    getPurchaseForSession
  };
};