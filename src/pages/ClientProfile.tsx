import { useClientAuth } from '@/hooks/useClientAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ChevronRight, Heart, HelpCircle, LogOut, Mail, Settings, Shield, Download, FileText, Calendar, BarChart3, User, Cookie, Menu, X, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

import { CreditRequestModal } from '@/components/CreditRequestModal';


const ClientProfile = () => {
  const [activeSection, setActiveSection] = useState('benefits');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState({ coaching: 0, short_session: 0 });
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useClientAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user?.id) {
      fetchCredits();
    }
  }, [user?.id]);

  const fetchCredits = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('credits')
        .select('service_type, amount')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      const creditsMap = { coaching: 0, short_session: 0 };
      data?.forEach((credit) => {
        if (credit.service_type === 'coaching') {
          creditsMap.coaching = credit.amount;
        } else if (credit.service_type === 'short_session') {
          creditsMap.short_session = credit.amount;
        }
      });

      setCredits(creditsMap);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'benefits', label: 'My benefits', icon: Heart, active: true },
    { id: 'credits', label: 'My Credits', icon: Coins },
    { id: 'insights', label: 'Personal Insights', icon: BarChart3 },
    { id: 'wellbeing', label: 'Wellbeing Insights', icon: User },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'account', label: 'Account settings', icon: Settings },
    { id: 'email', label: 'Email preferences', icon: Mail },
    { id: 'password', label: 'Change password', icon: Shield },
    { id: 'support', label: 'Contact Support', icon: HelpCircle },
    { id: 'emergency', label: 'Emergency contacts', icon: Heart },
    { id: 'import', label: 'Import results', icon: Download },
    { id: 'sessions', label: 'Session Logs', icon: Calendar },
    { id: 'assessments', label: 'Assessment logs', icon: BarChart3 },
    { id: 'cookies', label: 'Manage cookies', icon: Cookie },
    { id: 'terms', label: 'Terms & conditions', icon: FileText },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-4 h-4 transition-transform duration-200 ${
                activeSection === item.id ? 'text-blue-600' : 'group-hover:scale-110'
              }`} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
          
          <Separator className="my-6" />
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group border border-transparent hover:border-red-200"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/client-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-semibold text-sm sm:text-base hidden sm:block">finsage consult</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Help
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
          {activeSection === 'benefits' && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">All benefits</h2>
                <p className="text-sm text-gray-600">Valid till 01 Aug 2026</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">All benefits</h3>
                
                {/* 1:1 Card */}
                <Card className="border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">1:1 Personal Coaching</h4>
                          {loading ? (
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                            </div>
                          ) : credits.coaching > 0 ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                {credits.coaching} credits
                              </Badge>
                              <span className="text-sm text-green-600">available</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                                No credits
                              </Badge>
                              <span className="text-sm text-red-600">Request more</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <CreditRequestModal 
                        defaultServiceType="coaching"
                        trigger={
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-sm whitespace-nowrap hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            Get credits
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Group Sessions Card */}
                <Card className="border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Group Sessions</h4>
                          {loading ? (
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                            </div>
                          ) : credits.short_session > 0 ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                {credits.short_session} credits
                              </Badge>
                              <span className="text-sm text-green-600">available</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                                No credits
                              </Badge>
                              <span className="text-sm text-red-600">Request more</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <CreditRequestModal 
                        defaultServiceType="short_session"
                        trigger={
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-sm whitespace-nowrap hover:bg-purple-50 hover:border-purple-300 transition-colors"
                          >
                            Get credits
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Self-care Card */}
                <Card className="border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 group cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Self-care Resources</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                              Unlimited
                            </Badge>
                            <span className="text-sm text-green-600">access</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card className="border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 group cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Frequently Asked Questions</h4>
                          <p className="text-sm text-gray-600">Find answers to common queries</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                {/* Support Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Need more assistance?</h4>
                      <p className="text-gray-600 mb-4 text-sm">Our support team is here to help you make the most of your benefits</p>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'credits' && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">My Credits</h2>
                <p className="text-sm text-gray-600">Manage your available session credits</p>
              </div>

              <div className="space-y-4">
                {/* 1:1 Coaching Credits */}
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">1:1 Personal Coaching</h3>
                          {loading ? (
                            <Skeleton className="h-4 w-24 mt-1" />
                          ) : (
                            <p className="text-2xl font-bold text-primary mt-1">{credits.coaching}</p>
                          )}
                          <p className="text-sm text-gray-600">Available credits</p>
                        </div>
                      </div>
                      <CreditRequestModal 
                        defaultServiceType="coaching"
                        trigger={
                          <Button variant="outline">
                            Request More
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Group Session Credits */}
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Group Sessions</h3>
                          {loading ? (
                            <Skeleton className="h-4 w-24 mt-1" />
                          ) : (
                            <p className="text-2xl font-bold text-primary mt-1">{credits.short_session}</p>
                          )}
                          <p className="text-sm text-gray-600">Available credits</p>
                        </div>
                      </div>
                      <CreditRequestModal 
                        defaultServiceType="short_session"
                        trigger={
                          <Button variant="outline">
                            Request More
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Coins className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">How credits work</h4>
                      <p className="text-sm text-blue-700">
                        Credits are required to book sessions. 1:1 sessions typically require 15 credits, 
                        while group sessions require 5 credits. You can request additional credits as needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'benefits' && activeSection !== 'credits' && (
            <div className="max-w-4xl">
              <div className="text-center py-12 sm:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600 text-sm sm:text-base">This feature is currently under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;