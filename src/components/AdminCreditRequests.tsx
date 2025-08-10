import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface CreditRequest {
  id: string;
  user_id: string;
  requested_amount: number;
  reason: string;
  service_type: string;
  status: string;
  admin_notes: string;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
}

interface AdminCreditRequestsProps {
  serviceTypeFilter?: string;
}

export const AdminCreditRequests = ({ serviceTypeFilter }: AdminCreditRequestsProps) => {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAdminAuth();

  useEffect(() => {
    fetchCreditRequests();
  }, [serviceTypeFilter]);

  const fetchCreditRequests = async () => {
    try {
      let query = supabase
        .from("credit_requests")
        .select("*");
      
      // Add service type filter if provided
      if (serviceTypeFilter) {
        query = query.eq("service_type", serviceTypeFilter);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      // Get user names from client_profiles tables
      const userIds = data?.map(req => req.user_id) || [];
      
      // Get names from client_profiles table using auth user IDs
      const clientProfilesData = await supabase.from("client_profiles").select("user_id, full_name").in("user_id", userIds);
      
      // Combine user data
      const userMap = new Map();
      clientProfilesData.data?.forEach(profile => userMap.set(profile.user_id, profile.full_name));
      
      // Add user names to requests
      const requestsWithNames = data?.map(request => ({
        ...request,
        profiles: { full_name: userMap.get(request.user_id) || "Unknown User" }
      })) || [];
      
      setRequests(requestsWithNames);
    } catch (error: any) {
      console.error("Error fetching credit requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch credit requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, status: "approved" | "rejected") => {
    if (!user) return;

    setProcessingId(requestId);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update request status
      const { error: updateError } = await supabase
        .from("credit_requests")
        .update({
          status,
          admin_id: user.id,
          admin_notes: adminNotes[requestId] || "",
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // If approved, add credits to user's account
      if (status === "approved") {
        // Use the auth user ID directly for credits (not client profile ID)
        const { data: existingCredits } = await supabase
          .from("credits")
          .select("amount")
          .eq("user_id", request.user_id)
          .eq("service_type", request.service_type)
          .maybeSingle();

        if (existingCredits) {
          // Update existing credits
          const { error: creditError } = await supabase
            .from("credits")
            .update({
              amount: existingCredits.amount + request.requested_amount,
            })
            .eq("user_id", request.user_id)
            .eq("service_type", request.service_type);

          if (creditError) throw creditError;
        } else {
          // Create new credits record
          const { error: creditError } = await supabase
            .from("credits")
            .insert({
              user_id: request.user_id,
              amount: request.requested_amount,
              service_type: request.service_type,
            });

          if (creditError) throw creditError;
        }
      }

      toast({
        title: "Success",
        description: `Credit request ${status} successfully`,
      });

      fetchCreditRequests();
    } catch (error: any) {
      console.error("Error processing credit request:", error);
      toast({
        title: "Error",
        description: `Failed to ${status} credit request`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case "coaching":
        return "1:1";
      case "short_session":
        return "Group Sessions";
      default:
        return serviceType || "Not specified";
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading credit requests...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Credit Requests</h2>
      
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No credit requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {request.profiles?.full_name || "Unknown User"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Service: {getServiceTypeLabel(request.service_type)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {request.requested_amount} credits
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Reason</h4>
                  <p className="text-sm bg-muted p-3 rounded">{request.reason}</p>
                </div>
                
                {request.status === "pending" && (
                  <>
                    <div>
                      <label className="text-sm font-semibold">Admin Notes</label>
                      <Textarea
                        placeholder="Add notes about this request..."
                        value={adminNotes[request.id] || ""}
                        onChange={(e) =>
                          setAdminNotes(prev => ({
                            ...prev,
                            [request.id]: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleRequestAction(request.id, "approved")}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === request.id ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        onClick={() => handleRequestAction(request.id, "rejected")}
                        disabled={processingId === request.id}
                        variant="destructive"
                      >
                        {processingId === request.id ? "Processing..." : "Reject"}
                      </Button>
                    </div>
                  </>
                )}
                
                {request.admin_notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Admin Notes</h4>
                    <p className="text-sm bg-muted p-3 rounded">{request.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};