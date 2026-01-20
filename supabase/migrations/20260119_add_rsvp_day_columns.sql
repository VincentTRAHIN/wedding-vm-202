-- Add missing RSVP columns to guests table
-- present_saturday: Guest is present on Saturday
-- present_sunday: Guest is present on Sunday  
-- message_for_couple: Personal message from guest to couple

ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS present_saturday BOOLEAN,
ADD COLUMN IF NOT EXISTS present_sunday BOOLEAN,
ADD COLUMN IF NOT EXISTS message_for_couple TEXT;

-- Ensure email can be NULL (for guests without email)
ALTER TABLE public.guests ALTER COLUMN email DROP NOT NULL;

-- Drop UNIQUE constraint on email if exists (to allow multiple NULL emails)
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_email_key;

-- Add unique constraint that allows multiple NULLs
CREATE UNIQUE INDEX IF NOT EXISTS guests_email_unique ON public.guests (email) WHERE email IS NOT NULL;
