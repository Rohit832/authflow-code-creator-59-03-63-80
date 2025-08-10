import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AdminIndividualSessionModal } from './AdminIndividualSessionModal';

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
  individual_profiles?: {
    full_name: string;
    email: string;
  };
}

export const AdminIndividualSessionsManagement = () => {
  const [sessions, setSessions] = useState<IndividualSession[]>([]);
  const [purchases, setPurchases] = useState<SessionPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<IndividualSession | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('individual_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch sessions",
          variant: "destructive",
        });
        return;
      }

      setSessions((data || []) as IndividualSession[]);
    } catch (error) {
      console.error('Error in fetchSessions:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('session_purchases')
        .select(`
          *,
          individual_profiles:user_id (
            full_name,
            email
          )
        `)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        return;
      }

      setPurchases((data || []) as any);
    } catch (error) {
      console.error('Error in fetchPurchases:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const { error } = await supabase
        .from('individual_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: "Session Deleted",
        description: "The session has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const toggleSessionStatus = async (sessionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('individual_sessions')
        .update({ is_active: !currentStatus })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      setSessions(prev => 
        prev.map(s => 
          s.id === sessionId 
            ? { ...s, is_active: !currentStatus }
            : s
        )
      );

      toast({
        title: "Session Updated",
        description: `Session ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update session status",
        variant: "destructive",
      });
    }
  };

  const getSessionsByType = (sessionType: string) => {
    return sessions.filter(session => session.session_type === sessionType);
  };

  const getPurchasesForSession = (sessionId: string) => {
    return purchases.filter(p => p.session_id === sessionId);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSessions(), fetchPurchases()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleSessionSaved = () => {
    fetchSessions();
    setModalOpen(false);
    setSelectedSession(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Individual Sessions Management</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Session
        </Button>
      </div>

      <Tabs defaultValue="one-on-one" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="one-on-one">One-on-One</TabsTrigger>
          <TabsTrigger value="short-program">Short Programs</TabsTrigger>
          <TabsTrigger value="self-guided-tool">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="one-on-one" className="space-y-4">
          <div className="grid gap-4">
            {getSessionsByType('one-on-one').map((session) => (
              <Card key={session.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription>{session.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={session.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleSessionStatus(session.id, session.is_active)}
                    >
                      {session.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Price: ₹{session.price_inr.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {session.duration || 'Not specified'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Bookings: {getPurchasesForSession(session.id).length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${session.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="short-program" className="space-y-4">
          <div className="grid gap-4">
            {getSessionsByType('short-program').map((session) => (
              <Card key={session.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription>{session.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={session.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleSessionStatus(session.id, session.is_active)}
                    >
                      {session.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Price: ₹{session.price_inr.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {session.duration || 'Not specified'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Bookings: {getPurchasesForSession(session.id).length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${session.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="self-guided-tool" className="space-y-4">
          <div className="grid gap-4">
            {getSessionsByType('self-guided-tool').map((session) => (
              <Card key={session.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription>{session.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={session.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleSessionStatus(session.id, session.is_active)}
                    >
                      {session.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Price: ₹{session.price_inr.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {session.duration || 'Not specified'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Bookings: {getPurchasesForSession(session.id).length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${session.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <AdminIndividualSessionModal
        session={selectedSession}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSession(null);
        }}
        onSave={handleSessionSaved}
      />
    </div>
  );
};