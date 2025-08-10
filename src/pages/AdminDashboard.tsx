
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { ClientRegistrationRequests } from '@/components/ClientRegistrationRequests';
import { LogOut, X, Calendar, User, Clock } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RecentBooking {
  id: string;
  user_id: string;
  session_id: string;
  credits_used: number;
  created_at: string;
  status: string;
  profiles?: {
    full_name: string;
  };
  sessions?: {
    title: string;
    session_date: string;
    session_time: string;
  };
}

const AdminDashboard = () => {
  const { signOut, user, loading } = useAdminAuth();
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [showCancelledSessions, setShowCancelledSessions] = useState(false);
  const today = new Date();
  
  console.log('AdminDashboard rendering - user:', user);

  const fetchRecentBookings = async () => {
    try {
      setBookingsLoading(true);
      
      // First get the bookings with conditional filtering
      let query = supabase
        .from('session_bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      // Only filter by status if not showing cancelled sessions
      if (!showCancelledSessions) {
        query = query.eq('status', 'booked');
      }

      const { data: bookings, error: bookingsError } = await query;

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return;
      }

      // Then enrich with profile and session data
      const enrichedBookings = await Promise.all(
        (bookings || []).map(async (booking) => {
          // Get profile data from client_profiles table
          const clientProfile = await supabase.from('client_profiles').select('full_name').eq('user_id', booking.user_id).maybeSingle();

          const profile = clientProfile.data;

          // Get session data
          const { data: session } = await supabase
            .from('sessions')
            .select('title, session_date, session_time')
            .eq('id', booking.session_id)
            .single();

          return {
            ...booking,
            profiles: profile,
            sessions: session
          };
        })
      );

      setRecentBookings(enrichedBookings);
    } catch (error) {
      console.error('Error in fetchRecentBookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const groupBookingsByDate = (bookings: RecentBooking[]) => {
    const grouped: { [key: string]: RecentBooking[] } = {};
    
    bookings.forEach(booking => {
      const bookingDate = parseISO(booking.created_at);
      let dateKey: string;
      
      if (isToday(bookingDate)) {
        dateKey = 'Today';
      } else if (isYesterday(bookingDate)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(bookingDate, 'MMMM d, yyyy');
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    
    return grouped;
  };

  // Redirect to admin auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log('No authenticated admin user, redirecting to admin auth');
      window.location.href = '/admin-auth';
    }
  }, [user, loading]);

  useEffect(() => {
    fetchRecentBookings();
  }, [showCancelledSessions]);

  // Don't render anything while checking auth or if user is null
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar userType="admin" />
      
      <SidebarInset>
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <select className="text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-black font-medium hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 cursor-pointer min-w-[80px]">
                  <option className="text-black bg-white">English</option>
                </select>
                <select className="text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-black font-medium hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 cursor-pointer min-w-[120px]">
                  <option className="text-black bg-white">Asia/Kolkata</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Send SOS details</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* June Updates Card */}
            <Card className="border-l-4 border-l-primary bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">June Updates</CardTitle>
                  <X className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">• New metrics on Insights Tab:</span> Track and improve your practice with new metrics on the Insights Tab — now view your PHQ-4 Completion Rate and Case Note Completion Rate. <span className="text-primary font-medium cursor-pointer hover:underline">Go to Insights →</span>
                  </div>
                  <div>
                    <span className="font-medium">• New "Adjusted" Tag:</span> View days where you've adjusted your available hours from the regular working hours with "Adjusted" tag
                  </div>
                  <div>
                    <span className="font-medium">• Coming soon - the new Partner app:</span> Built just for Intellect providers, your one-stop app for managing sessions and clients will be coming soon! Stay tuned.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Session Bookings */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Recent Session Bookings
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Show cancelled sessions</span>
                      <Switch 
                        checked={showCancelledSessions}
                        onCheckedChange={setShowCancelledSessions}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : recentBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No recent bookings found</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupBookingsByDate(recentBookings)).map(([date, bookings]) => (
                        <div key={date}>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background">{date}</h3>
                          <div className="space-y-3">
                            {bookings.map((booking) => (
                              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">
                                      {booking.profiles?.full_name || 'Unknown Client'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {booking.sessions?.title || 'Session'}
                                    </p>
                                    {booking.sessions?.session_date && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(booking.sessions.session_date), 'MMM d, yyyy')}
                                        {booking.sessions.session_time && ` at ${booking.sessions.session_time}`}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant={booking.status === 'booked' ? 'default' : 'secondary'}>
                                    {booking.status}
                                  </Badge>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {booking.credits_used} credits
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(booking.created_at), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
