-- Add credits_required column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN credits_required integer NOT NULL DEFAULT 1;