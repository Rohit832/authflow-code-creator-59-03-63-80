import { useState } from "react";
import { AdminCreditRequests } from "@/components/AdminCreditRequests";
import { SidebarInset, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, CreditCard, Users, TrendingUp, UserCheck, Heart } from 'lucide-react';

const AdminCredits = () => {
  const { signOut, user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("coaching");

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
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Credits Management</h1>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="coaching" className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    1:1
                  </TabsTrigger>
                  <TabsTrigger value="short-session" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Group Sessions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="coaching" className="space-y-6">
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">1:1 Credits</h2>
                        <p className="text-sm text-gray-600">Manage credit requests for 1:1 sessions</p>
                      </div>
                    </div>
                    <AdminCreditRequests serviceTypeFilter="coaching" />
                  </div>
                </TabsContent>

                <TabsContent value="short-session" className="space-y-6">
                  <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Group Sessions Credits</h2>
                        <p className="text-sm text-gray-600">Manage credit requests for group sessions</p>
                      </div>
                    </div>
                    <AdminCreditRequests serviceTypeFilter="short_session" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminCredits;