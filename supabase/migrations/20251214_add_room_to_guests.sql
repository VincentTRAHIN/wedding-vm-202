ALTER TABLE public.guests
  ADD COLUMN room_id UUID REFERENCES public.rooms(id),
  ADD COLUMN check_in_date DATE,
  ADD COLUMN check_out_date DATE,
  ADD COLUMN room_notes TEXT;
