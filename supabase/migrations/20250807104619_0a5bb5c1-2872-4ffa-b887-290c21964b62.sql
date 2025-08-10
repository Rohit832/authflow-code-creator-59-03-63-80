-- Add session_url field to one_on_one_sessions table
ALTER TABLE one_on_one_sessions 
ADD COLUMN session_url text;

-- Add session_url field to short_programs table
ALTER TABLE short_programs 
ADD COLUMN session_url text;

-- Add session_url field to financial_tools table
ALTER TABLE financial_tools 
ADD COLUMN session_url text;