import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Send, Link as LinkIcon, Calendar, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ClientPurchase {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  purchase_date: string;
  amount_paid: number;
  status: string;
  user_profile: {
    full_name: string;
    email: string;
    phone_number?: string;
  };
  session_details: {
    title: string;
    description?: string;
    duration?: string;
  };
  session_link?: {
    id: string;
    session_url: string;
    expires_at: string;
    created_at: string;
  };
}

interface SessionLink {
  purchase_id: string;
  session_url: string;
  expires_at: string;
  notes?: string;
}

export const ClientSessionsManager = () => {
  const [clientPurchases, setClientPurchases] = useState<ClientPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<ClientPurchase | null>(null);
  const [sessionLinkForm, setSessionLinkForm] = useState<SessionLink>({
    purchase_id: '',
    session_url: '',
    expires_at: '',
    notes: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchClientPurchases();
  }, []);

  const fetchClientPurchases = async () => {
    try {
      setLoading(true);
      
      // Get all purchases first
      const { data: purchases, error } = await supabase
        .from('individual_purchases')
        .select('*')
        .eq('status', 'purchased')
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }

      if (!purchases || purchases.length === 0) {
        console.log('No purchases found');
        setClientPurchases([]);
        return;
      }

      console.log('Found purchases:', purchases.length);

      // Get all user profiles for these purchases
      const userIds = [...new Set(purchases.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('individual_profiles')
        .select('user_id, full_name, email, phone_number')
        .in('user_id', userIds);

      const profilesMap = new Map();
      profiles?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Get session details and existing links for each purchase
      const enrichedPurchases = await Promise.all(
        purchases.map(async (purchase) => {
          let sessionDetails = { title: 'Unknown Session', description: '', duration: '' };
          
          try {
            if (purchase.item_type === 'one_on_one') {
              const { data } = await supabase
                .from('one_on_one_sessions')
                .select('title, description, duration')
                .eq('id', purchase.item_id)
                .maybeSingle();
              if (data) sessionDetails = data;
            } else if (purchase.item_type === 'short_program') {
              const { data } = await supabase
                .from('short_programs')
                .select('title, description, duration')
                .eq('id', purchase.item_id)
                .maybeSingle();
              if (data) sessionDetails = data;
            } else if (purchase.item_type === 'financial_tool') {
              const { data } = await supabase
                .from('financial_tools')
                .select('title, description, duration')
                .eq('id', purchase.item_id)
                .maybeSingle();
              if (data) sessionDetails = data;
            }
          } catch (error) {
            console.error('Error fetching session details:', error);
          }

          // Check for existing session links
          let linkData = null;
          try {
            const { data } = await supabase
              .from('session_links')
              .select('*')
              .eq('purchase_id', purchase.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            linkData = data;
          } catch (error) {
            console.error('Error fetching session links:', error);
          }

          const userProfile = profilesMap.get(purchase.user_id) || { 
            full_name: 'Unknown User', 
            email: 'unknown@email.com',
            phone_number: null
          };

          return {
            ...purchase,
            user_profile: userProfile,
            session_details: sessionDetails,
            session_link: linkData || null
          };
        })
      );

      setClientPurchases(enrichedPurchases);
    } catch (error) {
      console.error('Error fetching client purchases:', error);
      toast.error('Failed to load client purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSessionLink = async () => {
    if (!selectedPurchase || !sessionLinkForm.session_url || !sessionLinkForm.expires_at) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // First, deactivate any existing session links for this purchase
      await supabase
        .from('session_links')
        .update({ status: 'inactive' })
        .eq('purchase_id', selectedPurchase.id);

      // Create new session link
      const { error } = await supabase
        .from('session_links')
        .insert({
          purchase_id: selectedPurchase.id,
          user_id: selectedPurchase.user_id,
          session_url: sessionLinkForm.session_url,
          expires_at: sessionLinkForm.expires_at,
          notes: sessionLinkForm.notes,
          status: 'active'
        });

      if (error) throw error;

      // Send notification to user (you can implement email notification here)
      toast.success(`Session link sent to ${selectedPurchase.user_profile.full_name}`);
      
      setIsDialogOpen(false);
      setSessionLinkForm({ purchase_id: '', session_url: '', expires_at: '', notes: '' });
      setSelectedPurchase(null);
      
      // Refresh data
      fetchClientPurchases();
    } catch (error) {
      console.error('Error sending session link:', error);
      toast.error('Failed to send session link');
    }
  };

  const openSendLinkDialog = (purchase: ClientPurchase) => {
    setSelectedPurchase(purchase);
    setSessionLinkForm({
      purchase_id: purchase.id,
      session_url: purchase.session_link?.session_url || '',
      expires_at: purchase.session_link?.expires_at || '',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (purchase: ClientPurchase) => {
    if (purchase.session_link) {
      const isExpired = new Date(purchase.session_link.expires_at) < new Date();
      return (
      <Badge variant={isExpired ? "destructive" : "default"} className={isExpired ? "" : "bg-green-100 text-green-800"}>
        {isExpired ? 'Link Expired' : 'Link Active'}
      </Badge>
      );
    }
    return <Badge variant="secondary">No Link</Badge>;
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'one_on_one': return '1-on-1 Session';
      case 'short_program': return 'Short Program';
      case 'financial_tool': return 'Financial Tool';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Client Sessions ({clientPurchases.length})</h3>
        </div>
        <Button onClick={fetchClientPurchases} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {clientPurchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Client Purchases</h3>
            <p className="text-muted-foreground text-center">
              Clients will appear here once they purchase sessions
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.user_profile.full_name}</div>
                        <div className="text-sm text-muted-foreground">{purchase.user_profile.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.session_details.title}</div>
                        {purchase.session_details.duration && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {purchase.session_details.duration}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getItemTypeLabel(purchase.item_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(purchase.purchase_date), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>₹{purchase.amount_paid}</TableCell>
                    <TableCell>{getStatusBadge(purchase)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openSendLinkDialog(purchase)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {purchase.session_link ? 'Update' : 'Send'} Link
                        </Button>
                        {purchase.session_link && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(purchase.session_link.session_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Session Link</DialogTitle>
          </DialogHeader>
          
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium">{selectedPurchase.user_profile.full_name}</h4>
                <p className="text-sm text-muted-foreground">{selectedPurchase.session_details.title}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_url">Session URL *</Label>
                <Input
                  id="session_url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={sessionLinkForm.session_url}
                  onChange={(e) => setSessionLinkForm(prev => ({ ...prev, session_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Expires At *</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={sessionLinkForm.expires_at}
                  onChange={(e) => setSessionLinkForm(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional instructions for the client..."
                  value={sessionLinkForm.notes}
                  onChange={(e) => setSessionLinkForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSendSessionLink} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Link
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};