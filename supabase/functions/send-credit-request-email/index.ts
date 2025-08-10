import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreditRequestEmailData {
  requestId: string;
  userEmail: string;
  userName: string;
  requestedAmount: number;
  reason: string;
  serviceType: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, userEmail, userName, requestedAmount, reason, serviceType }: CreditRequestEmailData = await req.json();

    console.log("Sending credit request email:", { requestId, userEmail, userName, requestedAmount });

    // Get admin emails from admin_profiles table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: adminEmails, error: adminError } = await supabase
      .from("admin_profiles")
      .select("email")
      .eq("is_approved", true);

    if (adminError) {
      console.error("Error fetching admin emails:", adminError);
      throw new Error("Failed to fetch admin emails");
    }

    const adminEmailList = adminEmails?.map(admin => admin.email) || [];
    
    if (adminEmailList.length === 0) {
      console.error("No approved admin emails found");
      throw new Error("No admin emails configured");
    }

    const serviceTypeLabel = serviceType === 'coaching' ? 'Coaching' : 'Short Session';
    
    const emailResponse = await resend.emails.send({
      from: "FinSage <noreply@finsage.co>",
      to: adminEmailList,
      subject: `New ${serviceTypeLabel} Credit Request from ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Credit Request</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Request Details</h3>
            <p><strong>User:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Service Type:</strong> ${serviceTypeLabel}</p>
            <p><strong>Requested Amount:</strong> ${requestedAmount} credits</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
          </div>
          
          <p>Please review this credit request in the admin panel.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              This is an automated message from FinSage Admin System.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-credit-request-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);