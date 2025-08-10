import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting auto-end sessions job...')

    // Get current timestamp
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0] // HH:MM:SS format

    console.log(`Current date: ${currentDate}, Current time: ${currentTime}`)

    // Find individual bookings that should be ended
    // Sessions that are scheduled, have a date/time, and the time has passed
    const { data: expiredBookings, error: bookingsError } = await supabaseClient
      .from('individual_bookings')
      .select('*')
      .eq('status', 'scheduled')
      .not('session_date', 'is', null)
      .not('session_time', 'is', null)
      .or(`session_date.lt.${currentDate},and(session_date.eq.${currentDate},session_time.lt.${currentTime})`)

    if (bookingsError) {
      console.error('Error fetching expired bookings:', bookingsError)
      throw bookingsError
    }

    console.log(`Found ${expiredBookings?.length || 0} expired individual bookings`)

    // Update expired individual bookings to 'completed'
    if (expiredBookings && expiredBookings.length > 0) {
      const bookingIds = expiredBookings.map(booking => booking.id)
      
      const { error: updateError } = await supabaseClient
        .from('individual_bookings')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .in('id', bookingIds)

      if (updateError) {
        console.error('Error updating individual bookings:', updateError)
        throw updateError
      }

      console.log(`Updated ${bookingIds.length} individual bookings to completed`)
    }

    // Also check session_bookings (credit-based sessions)
    const { data: expiredSessionBookings, error: sessionBookingsError } = await supabaseClient
      .from('session_bookings')
      .select(`
        *,
        sessions (
          session_date,
          session_time,
          duration
        )
      `)
      .eq('status', 'booked')

    if (sessionBookingsError) {
      console.error('Error fetching session bookings:', sessionBookingsError)
      throw sessionBookingsError
    }

    // Filter session bookings that have expired
    const expiredSessions = expiredSessionBookings?.filter(booking => {
      if (!booking.sessions?.session_date || !booking.sessions?.session_time) {
        return false
      }

      const sessionDateTime = new Date(`${booking.sessions.session_date}T${booking.sessions.session_time}`)
      
      // Add session duration to get end time
      const durationMinutes = parseInt(booking.sessions.duration?.replace(/\D/g, '') || '60')
      const sessionEndTime = new Date(sessionDateTime.getTime() + (durationMinutes * 60000))
      
      return sessionEndTime < now
    }) || []

    console.log(`Found ${expiredSessions.length} expired session bookings`)

    // Update expired session bookings to 'completed'
    if (expiredSessions.length > 0) {
      const sessionBookingIds = expiredSessions.map(booking => booking.id)
      
      const { error: updateSessionError } = await supabaseClient
        .from('session_bookings')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .in('id', sessionBookingIds)

      if (updateSessionError) {
        console.error('Error updating session bookings:', updateSessionError)
        throw updateSessionError
      }

      console.log(`Updated ${sessionBookingIds.length} session bookings to completed`)
    }

    const totalUpdated = (expiredBookings?.length || 0) + expiredSessions.length

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${totalUpdated} expired sessions`,
        individual_bookings_updated: expiredBookings?.length || 0,
        session_bookings_updated: expiredSessions.length,
        timestamp: now.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in auto-end-sessions function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})