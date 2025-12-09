-- Fix managed_by_id to reference guests(id) instead of auth.users(id)
-- This allows us to link guests to other guests (Head of Household) and easily join for names.

ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_managed_by_id_fkey;

ALTER TABLE public.guests
  ADD CONSTRAINT guests_managed_by_id_fkey
  FOREIGN KEY (managed_by_id)
  REFERENCES public.guests(id)
  ON DELETE SET NULL;
