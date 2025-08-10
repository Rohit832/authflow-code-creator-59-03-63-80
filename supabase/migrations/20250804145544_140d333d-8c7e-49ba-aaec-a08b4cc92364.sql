-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the auto-end-sessions function every 5 minutes
SELECT cron.schedule(
  'auto-end-sessions-job',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://fivwwotswaaypzlfdcol.supabase.co/functions/v1/auto-end-sessions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpdnd3b3Rzd2FheXB6bGZkY29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDEzMTYsImV4cCI6MjA2OTUxNzMxNn0.DxYYWN82Qaoxx6hXCRwLxdqP6mjSzTM3t_R9NjJOJLI"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Update individual_bookings to show 'paid' status when payment is completed
UPDATE individual_bookings 
SET status = 'paid' 
WHERE payment_status = 'completed' AND status != 'completed';