import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PendingRegistrations } from './client-management/PendingRegistrations';
import { ApprovedRegistrations } from './client-management/ApprovedRegistrations';
import { ActiveClients } from './client-management/ActiveClients';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function ClientRegistrationRequests() {
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  const fetchCounts = async () => {
    try {
      // Get pending count
      const { count: pending } = await supabase
        .from('client_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get approved count
      const { count: approved } = await supabase
        .from('client_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get active clients count
      const { count: active } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      setPendingCount(pending || 0);
      setApprovedCount(approved || 0);
      setActiveCount(active || 0);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              Approved
              {approvedCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {approvedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              Active Clients
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <PendingRegistrations onUpdate={fetchCounts} />
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <ApprovedRegistrations />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <ActiveClients />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}