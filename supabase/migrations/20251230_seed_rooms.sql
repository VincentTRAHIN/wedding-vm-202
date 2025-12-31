-- Seed rooms (admin editable via /admin/rooms)
-- Note: access_code values are placeholders; update them to real codes as needed.

INSERT INTO public.rooms (name, description, capacity, building, amenities, image_url, access_code)
VALUES
  (
    'Chambre 01',
    'Chambre pour 2 personnes.',
    2,
    NULL,
    '["Lit double"]'::jsonb,
    NULL,
    'CHANGE_ME_01'
  ),
  (
    'Chambre 02',
    'Chambre pour 2 personnes.',
    2,
    NULL,
    '["Lit double"]'::jsonb,
    NULL,
    'CHANGE_ME_02'
  ),
  (
    'Chambre 03',
    'Chambre pour 3 personnes.',
    3,
    NULL,
    '["Lit double", "Lit simple"]'::jsonb,
    NULL,
    'CHANGE_ME_03'
  ),
  (
    'Chambre 04',
    'Chambre pour 4 personnes.',
    4,
    NULL,
    '["Lit double", "Canapé-lit"]'::jsonb,
    NULL,
    'CHANGE_ME_04'
  ),
  (
    'Chambre 05',
    'Chambre pour 2 personnes.',
    2,
    NULL,
    '["Lit double"]'::jsonb,
    NULL,
    'CHANGE_ME_05'
  )
ON CONFLICT (name) DO NOTHING;
