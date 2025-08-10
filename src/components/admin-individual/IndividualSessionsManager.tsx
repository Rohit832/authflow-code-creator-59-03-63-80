import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SessionFormModal } from './SessionFormModal';
import { SessionCard } from './SessionCard';

interface OneOnOneSession {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price_inr: number;
  duration: string | null;
  thumbnail_url: string | null;
  session_url: string | null;
  access_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const IndividualSessionsManager = () => {
  const [sessions, setSessions] = useState<OneOnOneSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<OneOnOneSession | null>(null);
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('one_on_one_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleAdd = () => {
    setEditingSession(null);
    setModalOpen(true);
  };

  const handleEdit = (session: OneOnOneSession) => {
    setEditingSession(session);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const { error } = await supabase
        .from('one_on_one_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSessions(sessions.filter(s => s.id !== id));
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    fetchSessions();
    setModalOpen(false);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">1-on-1 Sessions ({sessions.length})</h3>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onEdit={() => handleEdit(session)}
            onDelete={() => handleDelete(session.id)}
          />
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sessions created yet</p>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create your first session
          </Button>
        </div>
      )}

      <SessionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        session={editingSession}
        onSave={handleSave}
        tableName="one_on_one_sessions"
      />
    </div>
  );
};