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
    const { sessionData, userDetails } = await req.json();
    
    console.log('Creating Razorpay payment for:', sessionData);
    
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

    // Razorpay API configuration
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Create Razorpay order
    const orderData = {
      amount: sessionData.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        user_id: user.id,
        session_type: sessionData.title,
        duration: sessionData.duration
      }
    };

    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay API error:', errorText);
      throw new Error(`Failed to create Razorpay order: ${errorText}`);
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created:', razorpayOrder.id);

    // Create payment record in database using service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if user exists in individual_users table, create if not
    const { data: existingUser } = await supabaseService
      .from('individual_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingUser) {
      // Get user details from individuals table if it exists, otherwise use auth data
      const { data: individualUser } = await supabaseService
        .from('individuals')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const userData = individualUser || {
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        phone_number: user.user_metadata?.phone_number || null,
        password_hash: null
      };

      // Create user record in individual_users table
      const { error: userCreateError } = await supabaseService
        .from('individual_users')
        .insert({
          id: user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          password_hash: userData.password_hash,
          status: 'active'
        });

      if (userCreateError) {
        console.error('User creation error:', userCreateError);
        throw new Error('Failed to create user record');
      }
    }

    const serviceType = sessionData.category || 'consultation';
    const { data: payment, error: paymentError } = await supabaseService
      .from('individual_payments')
      .insert({
        user_id: user.id,
        amount: sessionData.price,
        payment_status: 'pending',
        payment_method: 'razorpay',
        transaction_id: razorpayOrder.id,
        service_type: serviceType
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Database error:', paymentError);
      throw new Error('Failed to create payment record');
    }

    // Get booking info if booking_id is provided
    let bookingId = null;
    if (sessionData.bookingId) {
      bookingId = sessionData.bookingId;
    } else {
      // Create booking record for tools or other services
      const serviceType = sessionData.category || 'consultation';
      const { data: booking, error: bookingError } = await supabaseService
        .from('individual_bookings')
        .insert({
          user_id: user.id,
          plan_id: sessionData.category === 'tools' ? sessionData.serviceId : null,
          service_type: serviceType,
          payment_amount: sessionData.price,
          payment_status: 'pending',
          status: 'payment_pending'
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking error:', bookingError);
        throw new Error('Failed to create booking record');
      }
      bookingId = booking.id;
    }

    // Update payment with booking_id
    await supabaseService
      .from('individual_payments')
      .update({ booking_id: bookingId })
      .eq('id', payment.id);

    // Return order details for frontend
    return new Response(JSON.stringify({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayKeyId,
      bookingId: bookingId,
      sessionData: sessionData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});