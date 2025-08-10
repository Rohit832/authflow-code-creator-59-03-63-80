import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Save,
  Mail,
  Building,
  Briefcase,
  Phone,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';

interface ClientDetails {
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
}

interface SessionBooking {
  id: string;
  session_id: string;
  status: string;
  credits_used: number;
  booking_date: string;
  created_at: string;
  session_title?: string;
  session_date?: string;
  session_time?: string;
  session_type?: string;
  session_status?: string;
}

interface ClientDetailModalProps {
  client: ClientDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientUpdate: () => void;
}

export function ClientDetailModal({ client, open, onOpenChange, onClientUpdate }: ClientDetailModalProps) {
  const [bookings, setBookings] = useState<SessionBooking[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    if (client && open) {
      fetchClientDetails();
      setEditData({
        full_name: client.full_name || '',
        email: client.email || '',
        job_title: client.job_title || '',
        company_name: client.company_name || '',
        mobile_number: client.mobile_number || '',
        country: client.country || '',
        date_of_birth: client.date_of_birth || '',
        gender: client.gender || '',
        address: client.address || '',
        city: client.city || '',
        state_province: client.state_province || '',
        postal_code: client.postal_code || '',
        linkedin_profile: client.linkedin_profile || '',
        emergency_contact_name: client.emergency_contact_name || '',
        emergency_contact_phone: client.emergency_contact_phone || '',
        client_status: client.client_status || 'active',
        preferred_language: client.preferred_language || 'English',
        investment_experience: client.investment_experience || '',
        annual_income_range: client.annual_income_range || '',
        risk_tolerance: client.risk_tolerance || '',
        investment_goals: client.investment_goals || '',
        referral_source: client.referral_source || '',
        notes: client.notes || ''
      });
    }
  }, [client, open]);

  const fetchClientDetails = async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      // Fetch session bookings with separate query for sessions
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('session_bookings')
        .select('*')
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch session details separately and merge
      const enrichedBookings = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: sessionData } = await supabase
            .from('sessions')
            .select('title, session_date, session_time, session_type, status')
            .eq('id', booking.session_id)
            .single();

          return {
            ...booking,
            session_title: sessionData?.title,
            session_date: sessionData?.session_date,
            session_time: sessionData?.session_time,
            session_type: sessionData?.session_type,
            session_status: sessionData?.status
          };
        })
      );

      setBookings(enrichedBookings);

      // Fetch conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            id,
            content,
            sender_type,
            created_at
          )
        `)
        .eq('client_id', client.user_id)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;
      setConversations(conversationsData || []);

    } catch (error) {
      console.error('Error fetching client details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch client details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!client) return;

    try {
      console.log('Starting profile update for client:', client.user_id);
      console.log('Update data:', editData);

      // Update client_profiles table
      const { error: profileError } = await supabase
        .from('client_profiles')
        .update({ 
          full_name: editData.full_name,
          phone_number: editData.mobile_number,
          company_name: editData.company_name,
          job_title: editData.job_title,
          address: editData.address,
          city: editData.city,
          state_province: editData.state_province,
          country: editData.country,
          postal_code: editData.postal_code,
          date_of_birth: editData.date_of_birth || null,
          gender: editData.gender,
          linkedin_profile: editData.linkedin_profile,
          emergency_contact_name: editData.emergency_contact_name,
          emergency_contact_phone: editData.emergency_contact_phone,
          client_status: editData.client_status,
          preferred_language: editData.preferred_language,
          investment_experience: editData.investment_experience,
          annual_income_range: editData.annual_income_range,
          risk_tolerance: editData.risk_tolerance,
          investment_goals: editData.investment_goals,
          referral_source: editData.referral_source,
          notes: editData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', client.user_id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Profile updated successfully');

      // Try to update client_registrations if the record exists
      const { data: existingReg, error: regCheckError } = await supabase
        .from('client_registrations')
        .select('id')
        .eq('email', client.email)
        .maybeSingle();

      if (regCheckError && regCheckError.code !== 'PGRST116') {
        console.error('Error checking registration:', regCheckError);
      }

      if (existingReg) {
        const { error: regError } = await supabase
          .from('client_registrations')
          .update({
            full_name: editData.full_name,
            email: editData.email,
            job_title: editData.job_title,
            company_name: editData.company_name,
            mobile_number: editData.mobile_number,
            country: editData.country,
            date_of_birth: editData.date_of_birth || null,
            gender: editData.gender,
            address: editData.address,
            city: editData.city,
            state_province: editData.state_province,
            postal_code: editData.postal_code,
            linkedin_profile: editData.linkedin_profile,
            emergency_contact_name: editData.emergency_contact_name,
            emergency_contact_phone: editData.emergency_contact_phone,
            client_status: editData.client_status,
            preferred_language: editData.preferred_language,
            investment_experience: editData.investment_experience,
            annual_income_range: editData.annual_income_range,
            risk_tolerance: editData.risk_tolerance,
            investment_goals: editData.investment_goals,
            referral_source: editData.referral_source,
            notes: editData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('email', client.email);

        if (regError) {
          console.error('Registration update error:', regError);
          // Don't throw here, profile update was successful
        } else {
          console.log('Registration updated successfully');
        }
      } else {
        console.log('No matching registration found for email:', client.email);
      }

      toast({
        title: "Success",
        description: "Client profile updated successfully",
      });

      setEditMode(false);
      onClientUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update client profile",
        variant: "destructive",
      });
    }
  };

  if (!client) return null;

  const totalBookings = bookings.length;
  const completedSessions = bookings.filter(b => b.session_status === 'completed').length;
  const totalCreditsUsed = bookings.reduce((sum, booking) => sum + booking.credits_used, 0);
  const upcomingSessions = bookings.filter(b => 
    b.session_status === 'scheduled' && 
    b.session_date && new Date(b.session_date) > new Date()
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={client.avatar_url} />
              <AvatarFallback>
                {client.full_name?.charAt(0).toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            Client Details - {client.full_name || 'Unnamed Client'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedSessions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCreditsUsed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingSessions}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
                {client.job_title && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{client.job_title}</span>
                  </div>
                )}
                {client.company_name && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>{client.company_name}</span>
                  </div>
                )}
                {client.mobile_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{client.mobile_number}</span>
                  </div>
                )}
                {client.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{client.country}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bookings found
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{booking.session_title || 'Unknown Session'}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>
                              {booking.session_date ? format(new Date(booking.session_date), 'MMM d, yyyy') : 'Date TBD'} 
                              {booking.session_time && ` at ${booking.session_time}`}
                            </span>
                            <span>Credits: {booking.credits_used}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{booking.session_type || 'Unknown'}</Badge>
                          <Badge 
                            variant={booking.session_status === 'completed' ? 'default' : 'secondary'}
                          >
                            {booking.session_status || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Edit Profile</h3>
              <div className="flex gap-2">
                {editMode ? (
                  <>
                    <Button onClick={() => setEditMode(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditMode(true)} size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={editData.full_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={editData.date_of_birth}
                      onChange={(e) => setEditData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={editData.gender}
                      onChange={(e) => setEditData(prev => ({ ...prev, gender: e.target.value }))}
                      disabled={!editMode}
                      placeholder="Male/Female/Other"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile_number">Mobile Number</Label>
                    <Input
                      id="mobile_number"
                      type="tel"
                      value={editData.mobile_number}
                      onChange={(e) => setEditData(prev => ({ ...prev, mobile_number: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_language">Preferred Language</Label>
                    <Input
                      id="preferred_language"
                      value={editData.preferred_language}
                      onChange={(e) => setEditData(prev => ({ ...prev, preferred_language: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={editData.job_title}
                      onChange={(e) => setEditData(prev => ({ ...prev, job_title: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company</Label>
                    <Input
                      id="company_name"
                      value={editData.company_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, company_name: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
                    <Input
                      id="linkedin_profile"
                      type="url"
                      value={editData.linkedin_profile}
                      onChange={(e) => setEditData(prev => ({ ...prev, linkedin_profile: e.target.value }))}
                      disabled={!editMode}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Address Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editData.city}
                      onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state_province">State/Province</Label>
                    <Input
                      id="state_province"
                      value={editData.state_province}
                      onChange={(e) => setEditData(prev => ({ ...prev, state_province: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={editData.postal_code}
                      onChange={(e) => setEditData(prev => ({ ...prev, postal_code: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={editData.country}
                      onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={editData.emergency_contact_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      type="tel"
                      value={editData.emergency_contact_phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Financial Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="investment_experience">Investment Experience</Label>
                    <Input
                      id="investment_experience"
                      value={editData.investment_experience}
                      onChange={(e) => setEditData(prev => ({ ...prev, investment_experience: e.target.value }))}
                      disabled={!editMode}
                      placeholder="Beginner/Intermediate/Advanced"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annual_income_range">Annual Income Range</Label>
                    <Input
                      id="annual_income_range"
                      value={editData.annual_income_range}
                      onChange={(e) => setEditData(prev => ({ ...prev, annual_income_range: e.target.value }))}
                      disabled={!editMode}
                      placeholder="e.g., $50,000 - $75,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
                    <Input
                      id="risk_tolerance"
                      value={editData.risk_tolerance}
                      onChange={(e) => setEditData(prev => ({ ...prev, risk_tolerance: e.target.value }))}
                      disabled={!editMode}
                      placeholder="Conservative/Moderate/Aggressive"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_status">Client Status</Label>
                    <Input
                      id="client_status"
                      value={editData.client_status}
                      onChange={(e) => setEditData(prev => ({ ...prev, client_status: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="investment_goals">Investment Goals</Label>
                    <Textarea
                      id="investment_goals"
                      value={editData.investment_goals}
                      onChange={(e) => setEditData(prev => ({ ...prev, investment_goals: e.target.value }))}
                      disabled={!editMode}
                      placeholder="Describe investment objectives and goals"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="referral_source">How did you hear about us?</Label>
                    <Input
                      id="referral_source"
                      value={editData.referral_source}
                      onChange={(e) => setEditData(prev => ({ ...prev, referral_source: e.target.value }))}
                      disabled={!editMode}
                      placeholder="e.g., Google, Referral, Social Media"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={editData.notes}
                      onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                      disabled={!editMode}
                      placeholder="Additional notes or comments"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <h3 className="text-lg font-medium">Activity Timeline</h3>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Client registered on {format(new Date(client.created_at), 'PPP')}
              </div>
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-start gap-3 border-l-2 border-muted pl-4">
                  <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Booked: {booking.session_title || 'Unknown Session'}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(booking.created_at), 'PPp')} • {booking.credits_used} credits
                    </div>
                  </div>
                </div>
              ))}
              {conversations.map((conv) => (
                <div key={conv.id} className="flex items-start gap-3 border-l-2 border-muted pl-4">
                  <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Conversation started</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(conv.created_at), 'PPp')} • {conv.messages?.length || 0} messages
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}