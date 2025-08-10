import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useClientAuth } from "@/hooks/useClientAuth";

interface CreditRequestModalProps {
  trigger?: React.ReactNode;
  defaultServiceType?: string;
}

export const CreditRequestModal = ({ trigger, defaultServiceType }: CreditRequestModalProps) => {
  const [open, setOpen] = useState(false);
  const [serviceType, setServiceType] = useState(defaultServiceType || "");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useClientAuth();

  // Auto-select service type when modal opens and reset form when closed
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && defaultServiceType) {
      setServiceType(defaultServiceType);
    } else if (!isOpen) {
      // Reset form when modal closes
      setServiceType(defaultServiceType || "");
      setAmount("");
      setReason("");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to request credits",
        variant: "destructive",
      });
      return;
    }

    if (!serviceType || !amount || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get the current auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error("Not authenticated");
      }

      // Insert credit request using auth user ID
      const { data: requestData, error: requestError } = await supabase
        .from("credit_requests")
        .insert({
          user_id: authUser.id,
          requested_amount: parseInt(amount),
          reason: reason,
          service_type: serviceType,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-credit-request-email', {
        body: {
          requestId: requestData.id,
          userEmail: user.email,
          userName: user.full_name || user.email,
          requestedAmount: parseInt(amount),
          reason: reason,
          serviceType: serviceType,
        },
      });

      if (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail the whole request if email fails
      }

      toast({
        title: "Success",
        description: "Credit request submitted successfully! Admins will review your request.",
      });

      setOpen(false);
      setServiceType("");
      setAmount("");
      setReason("");
    } catch (error: any) {
      console.error("Error submitting credit request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit credit request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            Request Credits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Credits</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Service Type</Label>
            <RadioGroup value={serviceType} onValueChange={setServiceType} required>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coaching" id="coaching" />
                <Label htmlFor="coaching">1:1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short_session" id="short_session" />
                <Label htmlFor="short_session">Group Sessions</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Credit Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount of credits needed"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Request</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you need these credits..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};