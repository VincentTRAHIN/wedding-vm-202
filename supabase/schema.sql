-- Create guests table
CREATE TABLE public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'guest' CHECK (role IN ('admin', 'guest')),
  auth_id UUID REFERENCES auth.users(id),
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'present', 'absent')),
  adults_count INT DEFAULT 1,
  children_count INT DEFAULT 0,
  dietary_restrictions TEXT,
  expected_count INT DEFAULT 1
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
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE role = 'admin'));

CREATE POLICY "Users can update own RSVP" ON public.guests
  FOR UPDATE USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Admins can update all profiles" ON public.guests
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE role = 'admin'));

-- Photos Policies
CREATE POLICY "Users can view own photos" ON public.photos
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view approved photos" ON public.photos
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can insert own photos" ON public.photos
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can view all photos" ON public.photos
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE role = 'admin'));

CREATE POLICY "Admins can update all photos" ON public.photos
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE role = 'admin'));

-- Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', false);

-- Storage Policies
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos' AND auth.uid() = owner);

CREATE POLICY "Authenticated users can view photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'photos');

CREATE POLICY "Admins can delete photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'photos' AND auth.uid() IN (SELECT auth_id FROM public.guests WHERE role = 'admin'));
