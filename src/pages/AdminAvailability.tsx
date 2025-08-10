import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { LogOut, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const AdminAvailability = () => {
  const { signOut, user } = useAdminAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 6, 30)); // July 30, 2025
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 6)); // July 2025

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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Availability</h1>
              <p className="text-gray-600">Effortlessly manage your availability, working hours, and sessions</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="bg-white">
                  Today
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Week</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Week</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm text-gray-600">Day</span>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Working Hours
                </Button>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Left Calendar */}
              <Card className="w-80">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">July 2025</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full"
                    classNames={{
                      day_selected: "bg-primary text-white hover:bg-primary",
                      day_today: "bg-primary/10 text-primary font-medium",
                    }}
                  />
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Intellect calendar</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-teal-500 rounded-sm"></div>
                        <span className="text-sm text-gray-600">Virtual</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/5">
                        Connect Google Calendar
                        <span className="ml-auto text-primary">Add</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Schedule */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Sun 27</span>
                    <span>Mon 28</span>
                    <span>Tue 29</span>
                    <span className="bg-primary text-white px-3 py-1 rounded-full font-medium">Wed 30</span>
                    <span>Thu 31</span>
                    <span>Fri 1</span>
                    <span>Sat 2</span>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-right mb-4">
                      <span className="text-lg font-medium text-gray-900">August 02</span>
                    </div>
                    
                    {/* Time slots */}
                    <div className="space-y-4">
                      {['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => (
                        <div key={time} className="flex items-center gap-6 py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-sm text-gray-500 w-12">{time}</span>
                          <div className="flex-1 h-8 bg-gray-50 rounded relative">
                            {time === '13:00' && (
                              <div className="absolute right-4 top-1 bottom-1 bg-teal-400 rounded px-2 flex items-center">
                                <span className="text-xs text-white">Si...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminAvailability;