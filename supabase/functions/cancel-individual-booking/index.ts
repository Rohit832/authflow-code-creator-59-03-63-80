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
    const { bookingId } = await req.json();
    
    console.log('Cancelling individual booking:', bookingId);
    
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

    console.log('User authenticated:', user.id);

    // Get booking details using service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: booking, error: bookingError } = await supabaseService
      .from('individual_bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      throw new Error('Booking not found or access denied');
    }

    if (booking.status === 'cancelled') {
      console.log('Booking is already cancelled');
      return new Response(JSON.stringify({
        success: true,
        message: 'Booking was already cancelled',
        alreadyCancelled: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log('Booking found:', booking);

    // Get payment details - try to find any payment record for this booking
    const { data: payment, error: paymentError } = await supabaseService
      .from('individual_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .in('payment_status', ['completed', 'refunded'])
      .maybeSingle();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      
      // Check if this booking has already been processed for refund
      const { data: existingRefundPayment } = await supabaseService
        .from('individual_payments')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('payment_status', 'refunded')
        .maybeSingle();
      
      if (existingRefundPayment) {
        console.log('Found existing refund payment, marking booking as cancelled');
        
        // Update booking status to cancelled
        await supabaseService
          .from('individual_bookings')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Booking was already cancelled and refunded',
          alreadyCancelled: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      throw new Error('Payment not found for this booking');
    }

    console.log('Payment found:', payment);

    // Calculate refund amount based on cancellation time
    const bookingTime = new Date(booking.created_at);
    const currentTime = new Date();
    const timeDifferenceInHours = (currentTime.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
    
    let refundAmount: number;
    let refundPercentage: number;
    
    if (timeDifferenceInHours <= 1) {
      // Full refund if cancelled within 1 hour
      refundAmount = payment.amount;
      refundPercentage = 100;
    } else {
      // 90% refund if cancelled after 1 hour (10% penalty)
      refundAmount = Math.floor(payment.amount * 0.9);
      refundPercentage = 90;
    }

    console.log('Refund calculation:', { timeDifferenceInHours, refundAmount, refundPercentage });

    // Process Razorpay refund
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    // Create refund in Razorpay
    const refundData = {
      amount: refundAmount * 100, // Convert to paise
      notes: {
        booking_id: bookingId,
        refund_percentage: refundPercentage,
        cancellation_reason: 'User requested cancellation'
      }
    };

    console.log('Creating Razorpay refund:', refundData);

    const razorpayResponse = await fetch(`https://api.razorpay.com/v1/payments/${payment.transaction_id}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundData),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay refund error:', errorText);
      throw new Error(`Failed to process refund: ${errorText}`);
    }

    const razorpayRefund = await razorpayResponse.json();
    console.log('Razorpay refund created:', razorpayRefund.id);

    // Update booking status
    const { error: bookingUpdateError } = await supabaseService
      .from('individual_bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (bookingUpdateError) {
      console.error('Failed to update booking status:', bookingUpdateError);
      throw new Error('Failed to update booking status');
    }

    // Update payment status and add refund info
    const { error: paymentUpdateError } = await supabaseService
      .from('individual_payments')
      .update({
        payment_status: 'refunded',
        transaction_id: `${payment.transaction_id}_refund_${razorpayRefund.id}`
      })
      .eq('id', payment.id);

    if (paymentUpdateError) {
      console.error('Failed to update payment status:', paymentUpdateError);
      // Don't throw error here as the main cancellation was successful
    }

    console.log('Booking cancellation completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Booking cancelled and refund initiated successfully',
      refundAmount,
      refundPercentage,
      refundId: razorpayRefund.id,
      refundStatus: razorpayRefund.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Cancellation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});