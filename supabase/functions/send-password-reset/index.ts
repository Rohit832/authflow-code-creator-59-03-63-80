import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  userType: 'client' | 'admin' | 'individual';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { email, userType }: PasswordResetRequest = await req.json();
    console.log(`Password reset request for ${userType} user:`, email);

    // Create Supabase client with service role for admin functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify user exists based on user type
    let userExists = false;

    if (userType === 'individual') {
      // Check if user exists in individual_profiles table
      const { data: individualUser, error } = await supabase
        .from('individual_profiles')
        .select('email')
        .eq('email', email)
        .single();

      userExists = !error && !!individualUser;
      console.log('Individual user exists:', userExists);
    } else if (userType === 'admin') {
      // Check if user exists in admin_profiles table
      const { data: adminUser, error } = await supabase
        .from('admin_profiles')
        .select('email')
        .eq('email', email)
        .single();

      userExists = !error && !!adminUser;
    } else if (userType === 'client') {
      // Check if user exists in client_profiles table  
      const { data: clientUser, error } = await supabase
        .from('client_profiles')
        .select('email')
        .eq('email', email)
        .single();

      userExists = !error && !!clientUser;
    }

    // Always return success message for security (don't reveal if email exists)
    const successMessage = "If an account with that email exists, a password reset OTP has been sent.";

    // Only proceed if user exists
    if (!userExists) {
      console.log('User not found, returning generic success message');
      return new Response(JSON.stringify({ 
        message: successMessage 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    console.log('Generated OTP:', otpCode, 'expires at:', expiresAt);

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('password_reset_otps')
      .insert({
        email,
        otp_code: otpCode,
        user_type: userType,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (otpError) {
      console.error('Error storing OTP:', otpError);
      return new Response(JSON.stringify({ 
        error: "Failed to generate OTP. Please try again." 
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Send email with OTP using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    if (!Deno.env.get("RESEND_API_KEY")) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: "Email service not configured" 
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    const emailSubject = "Password Reset OTP - FinSage";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">FinSage</h1>
          <p style="color: #64748b; margin: 5px 0;">Financial Consulting Platform</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #475569; line-height: 1.6;">
            You requested a password reset for your ${userType} account. Use the following 6-digit code to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; border-radius: 6px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
              ${otpCode}
            </div>
          </div>
          
          <p style="color: #dc2626; font-weight: 500; text-align: center;">
            This code will expire in 15 minutes.
          </p>
          
          <p style="color: #475569; line-height: 1.6; margin-top: 30px;">
            If you didn't request this password reset, please ignore this email. Your account remains secure.
          </p>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 30px;">
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">
            © 2025 FinSage. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      const emailResponse = await resend.emails.send({
        from: "FinSage Support <support@finsage.co>", // Using your verified domain
        to: [email],
        subject: emailSubject,
        html: emailHtml,
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(JSON.stringify({ 
        message: successMessage 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      
      // Delete the OTP since email failed
      await supabase
        .from('password_reset_otps')
        .delete()
        .eq('email', email)
        .eq('otp_code', otpCode);

      return new Response(JSON.stringify({ 
        error: "Failed to send email. Please try again." 
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ 
        error: "An error occurred while processing your request. Please try again." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);