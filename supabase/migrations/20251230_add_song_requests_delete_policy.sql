-- Allow authenticated users to delete their own song requests

CREATE POLICY "Authenticated can delete own song request" ON public.song_requests
  FOR DELETE TO authenticated
  USING (requested_by = auth.uid());
