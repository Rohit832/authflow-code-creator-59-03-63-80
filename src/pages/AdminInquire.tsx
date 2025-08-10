import React, { useEffect, useState } from 'react';
import { SidebarInset, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InquiryStats from '@/components/inquiries/InquiryStats';
import InquiryDateGroup from '@/components/inquiries/InquiryDateGroup';

interface Inquiry {
  id: string;
  first_name: string;
  last_name: string;
  work_email: string;
  mobile_number?: string;
  job_title?: string;
  company_name: string;
  company_size?: string;
  country?: string;
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
  client_ip?: string | null;
}

const AdminInquire = () => {
  const { signOut, user } = useAdminAuth();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await signOut();
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to ensure all fields are properly typed
      const typedInquiries = (data || []).map(inquiry => ({
        ...inquiry,
        client_ip: inquiry.client_ip as string | null,
        mobile_number: inquiry.mobile_number as string | undefined
      })) as Inquiry[];
      
      setInquiries(typedInquiries);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inquiries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the list
      fetchInquiries();
      toast({
        title: "Status Updated",
        description: `Inquiry marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast({
        title: "Error",
        description: "Failed to update inquiry status. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <SidebarProvider>
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar userType="admin" />
      
      <SidebarInset>
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
                <p className="text-sm text-gray-600">Manage customer inquiries and demo requests</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={fetchInquiries}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
            <InquiryStats inquiries={inquiries} />
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading inquiries...
                </div>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No inquiries found</div>
                <p className="text-gray-400 mt-2">New inquiries will appear here as they come in.</p>
              </div>
            ) : (
              <InquiryDateGroup 
                inquiries={inquiries} 
                onStatusUpdate={updateInquiryStatus} 
              />
            )}
          </div>
        </main>
      </SidebarInset>
    </div>
    </SidebarProvider>
  );
};

export default AdminInquire;
