-- Create site_content table
CREATE TABLE public.site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  key TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  page TEXT
);

-- Trigger update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_content_updated
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated can view site_content" ON public.site_content
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage site_content" ON public.site_content
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE role = 'admin'));
