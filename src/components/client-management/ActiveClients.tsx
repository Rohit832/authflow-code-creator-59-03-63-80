import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Users, Mail, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ActiveClient {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  email?: string;
}

export function ActiveClients() {
  const [clients, setClients] = useState<ActiveClient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveClients();
  }, []);

  const fetchActiveClients = async () => {
    try {
      // Get all clients
      const { data: profiles, error: profilesError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all approved client registrations
      const { data: registrations, error: registrationsError } = await supabase
        .from('client_registrations')
        .select('email, full_name, avatar_url')
        .eq('status', 'approved');

      if (registrationsError) throw registrationsError;

      // Match profiles with registrations by full_name
      const clientsWithEmails = (profiles || []).map((profile) => {
        // Find matching registration by full_name
        const matchingRegistration = registrations?.find(
          reg => reg.full_name?.toLowerCase() === profile.full_name?.toLowerCase()
        );

        return {
          ...profile,
          user_id: profile.id, // Map id to user_id for consistency
          email: matchingRegistration?.email || 'No email found',
          // Use registration avatar if profile doesn't have one
          avatar_url: profile.avatar_url || matchingRegistration?.avatar_url
        };
      });

      setClients(clientsWithEmails);
    } catch (error) {
      console.error('Error fetching active clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch active clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (userId: string, clientName: string) => {
    try {
      // Delete from clients table
      const { error: profileError } = await supabase
        .from('clients')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Remove any related client registrations
      await supabase
        .from('client_registrations')
        .delete()
        .eq('email', clients.find(c => c.user_id === userId)?.email);

      toast({
        title: "Success",
        description: `Client ${clientName} has been deleted successfully`,
      });

      // Refresh the list
      fetchActiveClients();

    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No active clients</p>
        </div>
      ) : (
        clients.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={client.avatar_url} />
                <AvatarFallback>
                  {client.full_name?.charAt(0).toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{client.full_name || 'Unnamed Client'}</h4>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {client.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(client.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Client</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {client.full_name || 'this client'}? 
                    This action cannot be undone and will permanently remove the client's account and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteClient(client.user_id, client.full_name || 'Client')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))
      )}
    </div>
  );
}