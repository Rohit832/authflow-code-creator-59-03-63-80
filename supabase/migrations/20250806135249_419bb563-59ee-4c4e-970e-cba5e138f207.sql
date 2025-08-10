-- Check what values are currently in the type column
SELECT type, COUNT(*) FROM public.conversations GROUP BY type;

-- Get constraint info using the correct syntax for newer PostgreSQL
SELECT 
    conname, 
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass 
AND contype = 'c';

-- Drop all check constraints on the conversations table
DO $$ 
DECLARE 
    constraint_name text;
BEGIN
    FOR constraint_name IN 
        SELECT conname FROM pg_constraint 
        WHERE conrelid = 'public.conversations'::regclass AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE public.conversations DROP CONSTRAINT ' || constraint_name;
    END LOOP;
END $$;