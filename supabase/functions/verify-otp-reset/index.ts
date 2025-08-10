import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OTPVerifyRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  userType: 'client' | 'admin' | 'individual';
  verifyOnly?: boolean;
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
    const { email, otpCode, newPassword, userType, verifyOnly }: OTPVerifyRequest = await req.json();
    console.log(`OTP verification request for ${userType} user:`, email, verifyOnly ? '(verify only)' : '(reset password)');

    // Create Supabase client with service role for admin functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('password_reset_otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otpCode)
      .eq('user_type', userType)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpRecord) {
      console.log('Invalid or expired OTP:', otpError);
      return new Response(JSON.stringify({ 
        error: "Invalid or expired OTP code. Please request a new one." 
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // If this is just an OTP verification (not password reset), return success
    if (verifyOnly) {
      console.log('OTP verification successful for user:', email);
      return new Response(JSON.stringify({ 
        message: "OTP verified successfully." 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Handle individual users vs auth.users differently
    if (userType === 'individual') {
      // For individual users, they're actually in auth.users too, just need to find them
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log('Error listing users:', usersError);
        return new Response(JSON.stringify({ 
          error: "Unable to process password reset. Please try again." 
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      const targetUser = users.find(user => user.email === email);
      
      if (!targetUser) {
        console.log('Individual user not found for email:', email);
        return new Response(JSON.stringify({ 
          error: "User not found." 
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      // Verify user exists in individual_profiles table
      const { data: individualUser, error: individualError } = await supabase
        .from('individual_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (individualError || !individualUser) {
        console.log('User not found in individual_profiles table:', email);
        return new Response(JSON.stringify({ 
          error: "User not found in individual system." 
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      // Update user password in auth.users
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating individual user password:', updateError);
        return new Response(JSON.stringify({ 
          error: "Failed to update password. Please try again." 
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    } else {
      // Handle admin/client users in auth.users
      // Find the user by email
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log('Error listing users:', usersError);
        return new Response(JSON.stringify({ 
          error: "Unable to process password reset. Please try again." 
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      const targetUser = users.find(user => user.email === email);
      
      if (!targetUser) {
        console.log('User not found for email:', email);
        return new Response(JSON.stringify({ 
          error: "User not found." 
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      // Update user password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        return new Response(JSON.stringify({ 
          error: "Failed to update password. Please try again." 
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    // Mark OTP as used
    const { error: markUsedError } = await supabase
      .from('password_reset_otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    if (markUsedError) {
      console.error('Error marking OTP as used:', markUsedError);
      // Not a critical error, password was already updated
    }

    console.log('Password reset successful for user:', email);

    return new Response(JSON.stringify({ 
      message: "Password has been reset successfully. You can now login with your new password." 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-otp-reset function:", error);
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