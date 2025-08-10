import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  userEmail: string;
  userName: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  creditsUsed: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Booking confirmation email request received");

    const { 
      userEmail, 
      userName, 
      sessionTitle, 
      sessionDate, 
      sessionTime, 
      sessionType, 
      creditsUsed 
    }: BookingConfirmationRequest = await req.json();

    console.log("Sending booking confirmation to:", userEmail);

    const formattedDate = new Date(sessionDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailResponse = await resend.emails.send({
      from: "Finsage <noreply@finsage.co>",
      to: [userEmail],
      subject: `Session Booking Confirmed - ${sessionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0; font-size: 28px;">✓ Session Booked Successfully!</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Your coaching session has been confirmed</p>
            </div>

            <!-- Greeting -->
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Dear ${userName},
            </p>

            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 25px;">
              Great news! Your ${sessionType === '1:1' ? 'one-on-one coaching' : 'group'} session has been successfully booked. 
              We're excited to help you on your financial journey.
            </p>

            <!-- Session Details Card -->
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">Session Details</h3>
              
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                  <span style="font-weight: 600; color: #374151;">Session:</span>
                  <span style="color: #059669; font-weight: 600;">${sessionTitle}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                  <span style="font-weight: 600; color: #374151;">Type:</span>
                  <span style="color: #374151;">${sessionType === '1:1' ? 'One-on-One Coaching' : 'Group Session'}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                  <span style="font-weight: 600; color: #374151;">Date:</span>
                  <span style="color: #374151;">${formattedDate}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                  <span style="font-weight: 600; color: #374151;">Time:</span>
                  <span style="color: #374151;">${sessionTime}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #374151;">Credits Used:</span>
                  <span style="color: #ea580c; font-weight: 600;">${creditsUsed} Credit${creditsUsed > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <!-- What's Next -->
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">What's Next?</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>You'll receive a calendar invitation closer to your session date</li>
                <li>Our coach will contact you 24 hours before the session</li>
                <li>Login to your dashboard to view all your booked sessions</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
              </ul>
            </div>

            <!-- Contact Information -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0;">
                Questions about your booking? We're here to help!
              </p>
              <p style="color: #059669; font-weight: 600; margin: 0;">
                Email: support@finsageconsult.com
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                This email was sent by Finsage Financial Consulting.<br>
                You're receiving this because you booked a coaching session with us.
              </p>
            </div>

          </div>
        </div>
      `,
    });

    console.log("Booking confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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