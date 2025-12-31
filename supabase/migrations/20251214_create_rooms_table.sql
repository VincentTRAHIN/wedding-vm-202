-- Create rooms table
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL UNIQUE,
  lol_region TEXT,
  description TEXT,
  capacity INT NOT NULL DEFAULT 2,
  price_per_night DECIMAL(10,2),
  building TEXT,
  amenities JSONB DEFAULT '[]',
  image_url TEXT
);

-- Index for fast lookup
CREATE INDEX idx_rooms_name ON public.rooms(name);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated can view rooms" ON public.rooms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage rooms" ON public.rooms
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE role = 'admin'));
