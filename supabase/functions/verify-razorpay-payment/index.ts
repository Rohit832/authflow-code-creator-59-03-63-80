import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, orderId, signature, bookingId, sessionData } = await req.json();
    
    console.log('Verifying Razorpay payment:', { paymentId, orderId, bookingId, sessionData });
    
    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Verify signature using Razorpay key secret
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      throw new Error("Razorpay key secret not configured");
    }

    // Create expected signature
    const expectedSignature = await generateSignature(orderId + "|" + paymentId, razorpayKeySecret);
    
    if (signature !== expectedSignature) {
      console.error('Signature verification failed');
      throw new Error("Payment signature verification failed");
    }

    console.log('Payment signature verified successfully');

    // Update payment and booking status using service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create purchase record in individual_purchases table
    const purchaseData = {
      user_id: user.id,
      item_id: sessionData?.serviceId || sessionData?.id,
      item_type: sessionData?.category === 'one_on_one' ? 'one_on_one' : 
                 sessionData?.category === 'short_program' ? 'short_program' : 
                 sessionData?.category === 'financial_tool' ? 'financial_tool' : 'one_on_one',
      amount_paid: sessionData?.price || 0,
      payment_method: 'razorpay',
      status: 'purchased',
      can_rebook: true,
      purchase_date: new Date().toISOString()
    };
    
    console.log('Creating purchase record:', purchaseData);
    
    const { error: purchaseError } = await supabaseService
      .from('individual_purchases')
      .insert(purchaseData);

    if (purchaseError) {
      console.error('Purchase creation error:', purchaseError);
      throw new Error('Failed to create purchase record');
    }

    console.log('Payment verification completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment verified and booking updated successfully'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function generateSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}