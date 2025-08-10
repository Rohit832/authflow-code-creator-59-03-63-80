import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ClientRegistration {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  access_code?: string;
  created_at: string;
}

interface PendingRegistrationsProps {
  onUpdate: () => void;
}

export function PendingRegistrations({ onUpdate }: PendingRegistrationsProps) {
  const [registrations, setRegistrations] = useState<ClientRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      console.log('Fetching pending registrations...');
      const { data, error } = await supabase
        .from('client_registrations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      console.log('Pending registrations query result:', { data, error });
      
      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        // Generate access code using the database function
        const { data: codeData, error: codeError } = await supabase
          .rpc('generate_access_code');

        if (codeError) {
          console.error('Error generating access code:', codeError);
          toast({
            title: "Error",
            description: "Failed to generate access code",
            variant: "destructive",
          });
          return;
        }

        const accessCode = codeData;

        // Update registration with approval status and access code
        const { error } = await supabase
          .from('client_registrations')
          .update({ 
            status: 'approved',
            access_code: accessCode
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success", 
          description: `Registration approved! Access code: ${accessCode}`,
        });
      } else {
        // Update registration status to rejected
        const { error } = await supabase
          .from('client_registrations')
          .update({ status: 'rejected' })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Registration rejected successfully",
        });
      }

      // Refresh data and notify parent
      fetchPendingRegistrations();
      onUpdate();

    } catch (error) {
      console.error(`Error ${action}ing registration:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} registration`,
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
      {registrations.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No pending registrations</p>
        </div>
      ) : (
        registrations.map((registration) => (
          <div
            key={registration.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={registration.avatar_url} />
                <AvatarFallback>
                  {registration.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{registration.full_name}</h4>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {registration.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(registration.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegistration(registration.id, 'reject')}
                className="text-destructive hover:text-destructive"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleRegistration(registration.id, 'approve')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}