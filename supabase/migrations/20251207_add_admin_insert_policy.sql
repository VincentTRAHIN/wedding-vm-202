-- Allow admins to insert new guests
CREATE POLICY "Admins can insert guests" ON public.guests
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT auth_id FROM public.guests WHERE role = 'admin'
    )
  );

-- Allow admins to delete guests
CREATE POLICY "Admins can delete guests" ON public.guests
  FOR DELETE USING (
    auth.uid() IN (
      SELECT auth_id FROM public.guests WHERE role = 'admin'
    )
  );
