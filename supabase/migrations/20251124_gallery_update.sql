-- 1. Helper function to check admin status (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.guests
    WHERE auth_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Photos Table Policies

-- SELECT: Allow all authenticated users to view all photos (Collaborative Gallery)
DROP POLICY IF EXISTS "Users can view own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can view approved photos" ON public.photos;
DROP POLICY IF EXISTS "Admins can view all photos" ON public.photos;

CREATE POLICY "Authenticated users can view all photos" ON public.photos
  FOR SELECT TO authenticated USING (true);

-- DELETE: Allow owners and admins to delete
DROP POLICY IF EXISTS "Users can delete own photos" ON public.photos; -- Check if exists
-- We didn't have a specific delete policy for users before, only admins? 
-- Let's just create/replace the delete policy.
CREATE POLICY "Users and Admins can delete photos" ON public.photos
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR public.is_admin());


-- 3. Update Storage Policies

-- SELECT: Allow all authenticated users to view/download
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
CREATE POLICY "Authenticated users can view photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'photos');

-- DELETE: Allow owners and admins to delete files
DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
CREATE POLICY "Users and Admins can delete photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'photos' AND (auth.uid() = owner OR public.is_admin()));
