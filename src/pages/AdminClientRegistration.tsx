import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { ClientRegistrationRequests } from '@/components/ClientRegistrationRequests';
import { LogOut } from 'lucide-react';

export default function AdminClientRegistration() {
  const { signOut, user } = useAdminAuth();

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Client Registration Requests</h1>
            <p className="text-muted-foreground mt-2">
              Review and manage pending client registration requests
            </p>
          </div>
          
          <ClientRegistrationRequests />
        </main>
      </SidebarInset>
    </div>
    </SidebarProvider>
  );
}