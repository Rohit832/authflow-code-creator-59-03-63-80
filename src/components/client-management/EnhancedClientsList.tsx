import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ClientDetailModal } from './ClientDetailModal';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Building,
  Briefcase,
  Eye,
  Filter,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';

interface ClientData {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  email?: string;
  job_title?: string;
  company_name?: string;
  mobile_number?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  linkedin_profile?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  client_status?: string;
  preferred_language?: string;
  investment_experience?: string;
  annual_income_range?: string;
  risk_tolerance?: string;
  investment_goals?: string;
  referral_source?: string;
  notes?: string;
  total_bookings?: number;
  total_credits_used?: number;
  last_booking?: string;
  status?: 'active' | 'inactive';
}

export function EnhancedClientsList() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
    
    // Set up real-time updates
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_bookings'
        },
        () => {
          console.log('Session booking updated, refreshing clients...');
          fetchClients();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Profile updated, refreshing clients...');
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    // Filter clients based on search term and filter
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter(client => client.status === filter);
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, filter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Get all client profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('client_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get client registrations for email mapping and extended data
      const { data: registrations, error: registrationsError } = await supabase
        .from('client_registrations')
        .select(`
          email, full_name, avatar_url, job_title, company_name, mobile_number, country,
          date_of_birth, gender, address, city, state_province, postal_code, linkedin_profile,
          emergency_contact_name, emergency_contact_phone, client_status, preferred_language,
          investment_experience, annual_income_range, risk_tolerance, investment_goals,
          referral_source, notes
        `)
        .eq('status', 'approved');

      if (registrationsError) throw registrationsError;

      // Get inquiries for additional client details
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*');

      if (inquiriesError) throw inquiriesError;

      // Enrich client data with booking statistics
      const enrichedClients = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Find matching registration
          const registration = registrations?.find(
            reg => reg.full_name?.toLowerCase() === profile.full_name?.toLowerCase()
          );

          // Find matching inquiry for additional details
          const inquiry = inquiries?.find(
            inq => inq.work_email?.toLowerCase() === registration?.email?.toLowerCase() ||
                   `${inq.first_name} ${inq.last_name}`.toLowerCase() === profile.full_name?.toLowerCase()
          );

          // Get booking statistics
          const { data: bookings, error: bookingError } = await supabase
            .from('session_bookings')
            .select('credits_used, created_at')
            .eq('user_id', profile.user_id);

          const totalBookings = bookings?.length || 0;
          const totalCreditsUsed = bookings?.reduce((sum, booking) => sum + booking.credits_used, 0) || 0;
          const lastBooking = bookings?.[0]?.created_at;

          // Determine status based on recent activity
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const hasRecentActivity = lastBooking && new Date(lastBooking) > thirtyDaysAgo;

          return {
            ...profile,
            email: registration?.email || inquiry?.work_email || 'No email found',
            job_title: registration?.job_title || inquiry?.job_title,
            company_name: registration?.company_name || inquiry?.company_name,
            mobile_number: registration?.mobile_number || inquiry?.mobile_number,
            country: registration?.country || inquiry?.country,
            date_of_birth: registration?.date_of_birth,
            gender: registration?.gender,
            address: registration?.address,
            city: registration?.city,
            state_province: registration?.state_province,
            postal_code: registration?.postal_code,
            linkedin_profile: registration?.linkedin_profile,
            emergency_contact_name: registration?.emergency_contact_name,
            emergency_contact_phone: registration?.emergency_contact_phone,
            client_status: registration?.client_status,
            preferred_language: registration?.preferred_language,
            investment_experience: registration?.investment_experience,
            annual_income_range: registration?.annual_income_range,
            risk_tolerance: registration?.risk_tolerance,
            investment_goals: registration?.investment_goals,
            referral_source: registration?.referral_source,
            notes: registration?.notes,
            avatar_url: profile.avatar_url || registration?.avatar_url,
            total_bookings: totalBookings,
            total_credits_used: totalCreditsUsed,
            last_booking: lastBooking,
            status: hasRecentActivity ? 'active' : 'inactive'
          } as ClientData;
        })
      );

      setClients(enrichedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch client data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = (client: ClientData) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Clients</span>
            </div>
            <div className="text-2xl font-bold mt-1">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Badge className="w-4 h-4" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {clients.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Bookings</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {clients.reduce((sum, client) => sum + (client.total_bookings || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 text-muted-foreground">💳</span>
              <span className="text-sm font-medium">Credits Used</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {clients.reduce((sum, client) => sum + (client.total_credits_used || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search clients by name, email, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-input rounded-md text-sm bg-background"
          >
            <option value="all">All Clients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Clients list */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {searchTerm || filter !== 'all' ? 'No clients match your criteria' : 'No clients found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={client.avatar_url} />
                      <AvatarFallback>
                        {client.full_name?.charAt(0).toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-lg">
                          {client.full_name || 'Unnamed Client'}
                        </h4>
                        <Badge 
                          variant={client.status === 'active' ? 'default' : 'secondary'}
                        >
                          {client.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                        {client.job_title && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {client.job_title}
                          </div>
                        )}
                        {client.company_name && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {client.company_name}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Bookings: {client.total_bookings}</span>
                        <span>Credits: {client.total_credits_used}</span>
                        {client.last_booking && (
                          <span>
                            Last booking: {format(new Date(client.last_booking), 'MMM d, yyyy')}
                          </span>
                        )}
                        <span>
                          Joined: {format(new Date(client.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleClientClick(client)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client detail modal */}
      <ClientDetailModal
        client={selectedClient}
        open={showModal}
        onOpenChange={setShowModal}
        onClientUpdate={fetchClients}
      />
    </div>
  );
}