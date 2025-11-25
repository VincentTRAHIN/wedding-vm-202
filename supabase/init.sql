-- Reset Database
DROP TABLE IF EXISTS public.photos CASCADE;
DROP TABLE IF EXISTS public.guests CASCADE;

-- Create guests table
CREATE TABLE public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  "role" TEXT DEFAULT 'guest',
  auth_id UUID REFERENCES auth.users(id),
  rsvp_status TEXT DEFAULT 'pending',
  adults_count INT DEFAULT 1,
  children_count INT DEFAULT 0,
  dietary_restrictions TEXT,
  expected_count INT DEFAULT 1,
  CONSTRAINT guests_role_check CHECK ("role" IN ('admin', 'guest')),
  CONSTRAINT guests_rsvp_status_check CHECK (rsvp_status IN ('pending', 'present', 'absent'))
);

-- Create photos table
CREATE TABLE public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  storage_path TEXT NOT NULL,
  guest_id UUID REFERENCES public.guests(id) NOT NULL,
  owner_id UUID DEFAULT auth.uid() REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  caption TEXT
);

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Guests Policies
CREATE POLICY "Users can view own profile" ON public.guests
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all profiles" ON public.guests
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE "role" = 'admin'));

CREATE POLICY "Users can update own RSVP" ON public.guests
  FOR UPDATE USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Admins can update all profiles" ON public.guests
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE "role" = 'admin'));

-- Photos Policies
CREATE POLICY "Users can view own photos" ON public.photos
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view approved photos" ON public.photos
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can insert own photos" ON public.photos
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can insert own profile" ON public.guests
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Admins can view all photos" ON public.photos
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE "role" = 'admin'));

CREATE POLICY "Admins can update all photos" ON public.photos
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE "role" = 'admin'));

-- Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', false) ON CONFLICT DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
CREATE POLICY "Authenticated users can view photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
CREATE POLICY "Admins can delete photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'photos' AND auth.uid() IN (SELECT auth_id FROM public.guests WHERE "role" = 'admin'));

-- Insert Admins
INSERT INTO public.guests (email, full_name, "role", rsvp_status, expected_count)
VALUES
  ('vincent.trahin@gmail.com', 'Vincent TRAHIN', 'admin', 'present', 1),
  ('melanie.douge@gmail.com', 'Mélanie TRAHIN', 'admin', 'present', 1);
