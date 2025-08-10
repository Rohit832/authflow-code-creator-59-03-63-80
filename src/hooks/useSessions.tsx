
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Session {
  id: string;
  title: string;
  description: string | null;
  session_type: string;
  session_date: string;
  session_time: string;
  duration: string;
  location: string;
  max_participants: number | null;
  status: string;
  admin_id: string | null;
  image_url: string | null;
  credits_required: number;
  created_at: string;
  updated_at: string;
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching available sessions...');
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'scheduled')
        .order('session_date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching sessions:', error);
        setSessions([]);
        return;
      }

      console.log('✅ Sessions fetched successfully:', data?.length || 0, 'sessions');
      console.log('📊 Sessions data:', data);
      setSessions(data || []);
    } catch (error) {
      console.error('❌ Error in fetchSessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getAvailableSessions = (sessionType: string) => {
    return sessions.filter(session => session.session_type === sessionType);
  };

  return {
    sessions,
    loading,
    refetch: fetchSessions,
    getAvailableSessions
  };
};
