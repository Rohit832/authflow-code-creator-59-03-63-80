-- Add 'completed' status to registration_status enum
ALTER TYPE registration_status ADD VALUE IF NOT EXISTS 'completed';