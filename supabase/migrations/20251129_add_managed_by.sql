ALTER TABLE public.guests ADD COLUMN managed_by_id UUID REFERENCES auth.users(id);

-- Allow users to view guests they manage
CREATE POLICY "Users can view managed guests" ON public.guests
  FOR SELECT USING (auth.uid() = managed_by_id);

-- Allow users to update guests they manage
CREATE POLICY "Users can update managed guests" ON public.guests
  FOR UPDATE USING (auth.uid() = managed_by_id);
