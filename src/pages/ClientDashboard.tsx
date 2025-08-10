import { useClientAuth } from '@/hooks/useClientAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { LogOut, Phone, Check, X, Sparkles, Stethoscope, Menu, User, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import MessageIcon from '@/components/messaging/MessageIcon';
import MessageDialog from '@/components/messaging/MessageDialog';

import { CoachingSessionCard } from '@/components/CoachingSessionCard';
import { SessionMatchingCard } from '@/components/SessionMatchingCard';
import { useSessions } from '@/hooks/useSessions';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';


const ClientDashboard = () => {
  const [coachingOpen, setCoachingOpen] = useState(false);
  const [shortSessionOpen, setShortSessionOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [consultationDetailsOpen, setConsultationDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [visibleOneOnOneSessions, setVisibleOneOnOneSessions] = useState(2);
  const [visibleGroupSessions, setVisibleGroupSessions] = useState(2);
  const [loading, setLoading] = useState(true);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [credits, setCredits] = useState({ coaching: 0, short_session: 0 });
  const [hasCredits, setHasCredits] = useState(false);
  const { getAvailableSessions } = useSessions();
  const { toast } = useToast();
  const {
    signOut,
    user
  } = useClientAuth();

  // Debug current user state
  console.log('🎯 ClientDashboard - Current user:', user);
  console.log('🎯 ClientDashboard - User full_name:', user?.full_name);
  console.log('🎯 ClientDashboard - User email:', user?.email);
  
  useEffect(() => {
    fetchSessions();
    if (user?.id) {
      fetchCredits();
      fetchUserBookings();
    }
  }, [user?.id]);

  const fetchSessions = async () => {
    try {
      console.log('Fetching available sessions...');
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'scheduled')
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        setLoading(false);
        return;
      }

      console.log('Sessions fetched:', data);
      setSessions(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  const fetchCredits = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching user credits...');
      const { data, error } = await supabase
        .from('credits')
        .select('service_type, amount')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      console.log('Credits fetched:', data);
      
      const creditsMap = { coaching: 0, short_session: 0 };
      data?.forEach((credit) => {
        if (credit.service_type === 'coaching') {
          creditsMap.coaching = credit.amount;
        } else if (credit.service_type === 'short_session') {
          creditsMap.short_session = credit.amount;
        }
      });

      setCredits(creditsMap);
      setHasCredits(creditsMap.coaching > 0 || creditsMap.short_session > 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const fetchUserBookings = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching user bookings...');
      const { data, error } = await supabase
        .from('session_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user bookings:', error);
        return;
      }

      console.log('User bookings fetched:', data);
      setUserBookings(data || []);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  const refetchCredits = () => {
    fetchCredits();
  };

  const refetchBookings = () => {
    fetchUserBookings();
  };

  const getBookingForSession = (sessionId: string) => {
    return userBookings.find(booking => booking.session_id === sessionId);
  };

  const isSessionBooked = (sessionId: string) => {
    const booking = getBookingForSession(sessionId);
    return booking && booking.status === 'booked';
  };

  const getSessionBookingStatus = (sessionId: string) => {
    const booking = getBookingForSession(sessionId);
    return booking?.status || null;
  };

  const handleSignOut = async () => {
    console.log('🚪 Attempting to sign out...');
    try {
      await signOut();
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    }
  };
  
  const handleProfileClick = () => {
    navigate('/client-profile');
  };

  const handleBookSession = async (sessionType: 'coaching' | 'short_session', sessionId: string) => {
    if (!user) return;

    try {
      // Find the specific session to get credits_required
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        toast({
          title: "Error",
          description: "Session not found",
          variant: "destructive",
        });
        return;
      }

      const creditsRequired = session.credits_required || 1;
      
      // Check if user has enough credits
      const currentCredits = sessionType === 'coaching' ? credits.coaching : credits.short_session;
      if (currentCredits < creditsRequired) {
        toast({
          title: "Insufficient Credits",
          description: `You need ${creditsRequired} ${sessionType === 'coaching' ? '1:1' : 'group'} credits to book this session. You have ${currentCredits}.`,
          variant: "destructive",
        });
        return;
      }

      console.log('🔍 Attempting to book session:', sessionId, 'for user:', user.id);
      console.log('🔍 Session type:', sessionType, 'Credits required:', creditsRequired);
      
      // Check if session is already booked
      const existingBooking = getBookingForSession(sessionId);
      if (existingBooking && existingBooking.status === 'booked') {
        toast({
          title: "Already Purchased",
          description: "You've already purchased this session.",
          variant: "destructive",
        });
        return;
      }

      setBookingSessionId(sessionId);

      console.log('🔍 Creating booking with data:', {
        user_id: user.id,
        session_id: sessionId,
        status: 'booked',
        credits_used: creditsRequired,
        booking_date: new Date().toISOString()
      });

      // Debug auth context first
      const { data: authDebug, error: authDebugError } = await supabase
        .rpc('debug_auth_context');
      
      console.log('🔍 Auth debug info:', authDebug, 'Error:', authDebugError);

      // Create session booking record
      const { data: bookingData, error: bookingError } = await supabase
        .from('session_bookings')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          status: 'booked',
          credits_used: creditsRequired,
          booking_date: new Date().toISOString()
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        toast({
          title: "Booking Failed",
          description: "Failed to create booking record",
          variant: "destructive",
        });
        return;
      }

      // Deduct credits after successful booking
      const { data: currentCreditData, error: fetchError } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', user.id)
        .eq('service_type', sessionType)
        .single();

      if (!fetchError && currentCreditData) {
        const newAmount = currentCreditData.amount - creditsRequired;

        const { error: updateError } = await supabase
          .from('credits')
          .update({ amount: newAmount })
          .eq('user_id', user.id)
          .eq('service_type', sessionType);

        if (updateError) {
          console.error('Error updating credits:', updateError);
        } else {
          toast({
            title: "Session Booked Successfully",
            description: `Your ${sessionType === 'coaching' ? '1:1' : 'group'} session has been booked!`,
            variant: "default",
          });
          
          // Refresh both credits and bookings
          refetchCredits();
          refetchBookings();
        }
      }

    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive",
      });
    } finally {
      setBookingSessionId(null);
    }
  };

  const handleViewBookingDetails = (sessionId: string) => {
    const booking = getBookingForSession(sessionId);
    const session = sessions.find(s => s.id === sessionId);
    
    if (booking && session) {
      // Set selected booking and session data for the modal
      setSelectedBooking(booking);
      setSelectedSession(session);
      setSessionDetailsOpen(true);
    } else {
      toast({
        title: "No Details Found",
        description: "Session or booking details not found.",
        variant: "destructive",
      });
    }
  };

  const handleCancelBooking = async (sessionId: string) => {
    const booking = getBookingForSession(sessionId);
    if (!booking) return;

    try {
      // Update booking status to cancelled
      const { error: updateError } = await supabase
        .from('session_bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (updateError) {
        console.error('Error cancelling booking:', updateError);
        toast({
          title: "Cancellation Failed",
          description: "Failed to cancel booking",
          variant: "destructive",
        });
        return;
      }

      // Refund credits
      const sessionType = sessions.find(s => s.id === sessionId)?.session_type === '1:1' ? 'coaching' : 'short_session';
      const { data: currentCreditData, error: fetchError } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', user.id)
        .eq('service_type', sessionType)
        .single();

      if (!fetchError && currentCreditData) {
        const newAmount = currentCreditData.amount + booking.credits_used;

        await supabase
          .from('credits')
          .update({ amount: newAmount })
          .eq('user_id', user.id)
          .eq('service_type', sessionType);
      }

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled and credits refunded.",
        variant: "default",
      });

      // Refresh both credits and bookings
      refetchCredits();
      refetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };
  return <div className="min-h-screen flex flex-col w-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-semibold text-sm sm:text-base">finsage consult</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <Button variant="link" className="text-primary font-medium underline">
                Home
              </Button>
              <Button onClick={() => navigate('/client-content')} variant="link" className="text-gray-600">
                Content library
              </Button>
            </nav>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <MessageIcon 
              hasCredits={hasCredits}
              onClick={() => setMessageDialogOpen(true)}
            />
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Help
            </Button>
            <Button onClick={handleProfileClick} variant="ghost" size="sm" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
            {isMobile ? (
              <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Menu</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 space-y-4">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-primary font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/client-content');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Content library
                    </Button>
                    <MessageIcon 
                      hasCredits={hasCredits}
                      onClick={() => {
                        setMessageDialogOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    />
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleProfileClick();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help
                    </Button>
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Button variant="ghost" size="sm">
                <Menu className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Welcome {user?.full_name || 'User'}!
              </h1>
              
              {/* Credits Display */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{credits.coaching}</div>
                  <div className="text-xs text-gray-600">1:1 Credits</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{credits.short_session}</div>
                  <div className="text-xs text-gray-600">Group Credits</div>
                </div>
              </div>
            </div>
            
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              {/* Wellbeing Check-in Card */}
              <Card className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-0">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="mb-3 sm:mb-4">
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 mb-2 sm:mb-3 text-xs sm:text-sm">
                      Wellbeing check-in
                    </Badge>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      Check out your mood check in insights
                    </h3>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" className="bg-white hover:bg-gray-50 text-xs sm:text-sm px-3 sm:px-4">
                      View insights
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Insights Card */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-0">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="mb-3 sm:mb-4">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 mb-2 sm:mb-3 text-xs sm:text-sm">
                      Personal insights
                    </Badge>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      Find out your strengths and growth areas
                    </h3>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm px-3 sm:px-4">
                      Begin quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Matching Sections */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading available sessions...</p>
                </div>
              ) : (
                <>
                  {/* 1:1 Sessions */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">1:1 Sessions</h3>
                    {sessions.filter(session => session.session_type === '1:1').length > 0 ? (
                      <>
                        {sessions
                          .filter(session => session.session_type === '1:1')
                          .slice(0, visibleOneOnOneSessions)
                          .map((session) => (
                          <div key={session.id}>
                            {credits.coaching > 0 ? (
                              <SessionMatchingCard
                                sessionType="1:1"
                                title={session.title}
                                description={session.description}
                                dateAvailable={`${new Date(session.session_date).toLocaleDateString('en-US', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })} - ${session.session_time}`}
                                creditsRequired={session.credits_required || 1}
                                imageUrl={session.image_url}
                                isBooked={isSessionBooked(session.id)}
                                bookingStatus={getSessionBookingStatus(session.id)}
                                isBooking={bookingSessionId === session.id}
                                onBook={() => handleBookSession('coaching', session.id)}
                                onAbout={() => setCoachingOpen(true)}
                                onViewDetails={() => handleViewBookingDetails(session.id)}
                                onCancelBooking={() => handleCancelBooking(session.id)}
                              />
                            ) : (
                              <Card className="border border-gray-200">
                                <CardContent className="p-3 sm:p-4 lg:p-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="destructive" className="bg-red-100 text-red-700 text-xs sm:text-sm">
                                          Not available - No credits
                                        </Badge>
                                      </div>
                                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                                        {session.title}
                                      </h3>
                                      <p className="text-sm text-gray-600">{session.description}</p>
                                    </div>
                                    <Button variant="outline" disabled className="bg-gray-100 text-xs sm:text-sm">
                                      Need credits to book
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                         ))}
                         {sessions.filter(session => session.session_type === '1:1').length > visibleOneOnOneSessions && (
                          <div className="text-center mt-4">
                            <Button 
                              variant="outline" 
                              className="text-primary border-primary hover:bg-primary/10"
                              onClick={() => setVisibleOneOnOneSessions(prev => prev + 2)}
                            >
                              View more sessions
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <Card className="border border-gray-200">
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs sm:text-sm">
                                  No sessions available
                                </Badge>
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                                No 1:1 sessions scheduled yet
                              </h3>
                              <p className="text-sm text-gray-600">Check back later for available sessions</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Group Sessions */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Group Sessions</h3>
                    {sessions.filter(session => session.session_type === 'group').length > 0 ? (
                      <>
                        {sessions
                          .filter(session => session.session_type === 'group')
                          .slice(0, visibleGroupSessions)
                          .map((session) => (
                          <div key={session.id}>
                            {credits.short_session > 0 ? (
                              <SessionMatchingCard
                                sessionType="group"
                                title={session.title}
                                description={session.description}
                                dateAvailable={`${new Date(session.session_date).toLocaleDateString('en-US', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })} - ${session.session_time}`}
                                creditsRequired={session.credits_required || 1}
                                imageUrl={session.image_url}
                                isBooked={isSessionBooked(session.id)}
                                bookingStatus={getSessionBookingStatus(session.id)}
                                isBooking={bookingSessionId === session.id}
                                onBook={() => handleBookSession('short_session', session.id)}
                                onAbout={() => setShortSessionOpen(true)}
                                onViewDetails={() => handleViewBookingDetails(session.id)}
                                onCancelBooking={() => handleCancelBooking(session.id)}
                              />
                            ) : (
                              <Card className="border border-gray-200">
                                <CardContent className="p-3 sm:p-4 lg:p-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="destructive" className="bg-red-100 text-red-700 text-xs sm:text-sm">
                                          Not available - No credits
                                        </Badge>
                                      </div>
                                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                                        {session.title}
                                      </h3>
                                      <p className="text-sm text-gray-600">{session.description}</p>
                                    </div>
                                    <Button variant="outline" disabled className="bg-gray-100 text-xs sm:text-sm">
                                      Need credits to book
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                         ))}
                         {sessions.filter(session => session.session_type === 'group').length > visibleGroupSessions && (
                          <div className="text-center mt-4">
                            <Button 
                              variant="outline" 
                              className="text-primary border-primary hover:bg-primary/10"
                              onClick={() => setVisibleGroupSessions(prev => prev + 2)}
                            >
                              View more sessions
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <Card className="border border-gray-200">
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs sm:text-sm">
                                  No sessions available
                                </Badge>
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                                No group sessions scheduled yet
                              </h3>
                              <p className="text-sm text-gray-600">Check back later for available sessions</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Urgent Distress Section */}
            <Card className="border border-gray-200 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Are you in urgent distress?
                    </h3>
                    <p className="text-gray-600">We are here for you 24/7</p>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Local helpline
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <Card className="border border-gray-200 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Explore your benefits
                      </h3>
                      <p className="text-gray-600">
                        Your company benefits offer personalised care and wellness resources to help you thrive
                      </p>
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    See benefits
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Self-care Banner */}
            <Card className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-orange-200 border-0">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Self-care in 5 minutes
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Explore our library of 200+ bite-sized sessions<br />
                      for mental health, career, relationships & more
                    </p>
                    <Button variant="default" className="bg-gray-900 hover:bg-gray-800 text-white">
                      Open content library
                    </Button>
                  </div>
                  <div className="hidden md:block ml-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                      <div className="text-white text-2xl">📚</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MessageDialog 
        open={messageDialogOpen} 
        onOpenChange={setMessageDialogOpen} 
      />

      {/* Session Details Modal */}
      <Dialog open={sessionDetailsOpen} onOpenChange={setSessionDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          
          {selectedSession && selectedBooking && (
            <div className="space-y-6">
              {/* Session Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {selectedSession.session_type === '1:1' ? 'Personal Consultation' : 'Group Consultation'}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Booked
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {selectedSession.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedSession.description}
                  </p>
                </div>
              </div>

              {/* Session Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Session Date & Time</h4>
                    <p className="text-foreground">
                      {new Date(selectedSession.session_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-foreground font-medium">
                      {selectedSession.session_time}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Duration & Location</h4>
                    <p className="text-foreground">{selectedSession.duration}</p>
                    <p className="text-muted-foreground">{selectedSession.location}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Booking Information</h4>
                    <p className="text-foreground">Booking ID: {selectedBooking.id}</p>
                    <p className="text-muted-foreground">
                      Booked on: {new Date(selectedBooking.booking_date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Credits Used</h4>
                    <p className="text-foreground font-semibold text-lg">
                      ₹ {selectedBooking.credits_used} Credit{selectedBooking.credits_used > 1 ? 's' : ''}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {selectedSession.session_type === '1:1' ? '1:1 Consultation' : 'Group Session'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setSessionDetailsOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSessionDetailsOpen(false);
                    handleCancelBooking(selectedSession.id);
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>;
};
export default ClientDashboard;