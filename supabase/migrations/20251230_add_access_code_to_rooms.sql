-- Add access_code to rooms
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS access_code TEXT;
