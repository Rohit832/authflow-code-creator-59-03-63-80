import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Mail, Calendar, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface ClientRegistration {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  access_code?: string;
  created_at: string;
}

export function ApprovedRegistrations() {
  const [registrations, setRegistrations] = useState<ClientRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovedRegistrations();
  }, []);

  const fetchApprovedRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('client_registrations')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching approved registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch approved registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAccessCode = (accessCode: string) => {
    navigator.clipboard.writeText(accessCode);
    toast({
      title: "Copied",
      description: "Access code copied to clipboard",
    });
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
          <p className="text-muted-foreground">No approved registrations</p>
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
                  <Badge variant="default">Approved</Badge>
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
                {registration.access_code && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      Access Code: {registration.access_code}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyAccessCode(registration.access_code!)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}