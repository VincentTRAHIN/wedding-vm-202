-- Create photo_likes table
CREATE TABLE public.photo_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, photo_id)
);

-- Enable RLS for photo_likes
ALTER TABLE public.photo_likes ENABLE ROW LEVEL SECURITY;

-- Policies for photo_likes
CREATE POLICY "Anyone can view likes" ON public.photo_likes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own likes" ON public.photo_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.photo_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- Create photo_comments table
CREATE TABLE public.photo_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for photo_comments
ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;

-- Policies for photo_comments
CREATE POLICY "Anyone can view comments" ON public.photo_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert comments" ON public.photo_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.photo_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment" ON public.photo_comments
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.guests 
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
