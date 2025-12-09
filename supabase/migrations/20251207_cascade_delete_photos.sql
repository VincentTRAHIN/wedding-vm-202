-- Drop the existing foreign key constraint
ALTER TABLE public.photos
DROP CONSTRAINT photos_guest_id_fkey;

-- Re-add the foreign key constraint with ON DELETE CASCADE
ALTER TABLE public.photos
ADD CONSTRAINT photos_guest_id_fkey
FOREIGN KEY (guest_id)
REFERENCES public.guests(id)
ON DELETE CASCADE;
