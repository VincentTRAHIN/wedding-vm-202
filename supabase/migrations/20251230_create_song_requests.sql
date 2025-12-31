-- Create song_requests table (DJ collaboratif)
CREATE TABLE public.song_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  track_name TEXT NOT NULL,
  artist TEXT,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_song_requests_created_at ON public.song_requests (created_at DESC);

ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

-- Read for all authenticated users
CREATE POLICY "Authenticated can view song requests" ON public.song_requests
  FOR SELECT TO authenticated USING (true);

-- Insert only for self
CREATE POLICY "Authenticated can create own song request" ON public.song_requests
  FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());
