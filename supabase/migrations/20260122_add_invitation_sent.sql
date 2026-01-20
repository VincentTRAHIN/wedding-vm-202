-- Add invitation_sent flag to track if an invitation email was already sent
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS invitation_sent BOOLEAN DEFAULT FALSE;

-- Set invitation_sent to true for guests who already have auth_id (already onboarded)
UPDATE public.guests SET invitation_sent = TRUE WHERE auth_id IS NOT NULL;
