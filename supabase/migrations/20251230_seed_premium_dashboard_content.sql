-- Seed premium dashboard content keys (admin editable via site_content)

INSERT INTO public.site_content (key, content, page)
VALUES
  (
    'contacts_sos',
    '{"contacts":[{"name":"Témoin 1","role":"Témoin","phone":"+33600000001"},{"name":"Témoin 2","role":"Témoin","phone":"+33600000002"}]}'::jsonb,
    'dashboard'
  ),
  (
    'taxis',
    '{"taxis":[{"name":"Taxi Vergèze","phone":"+336...","available_24h":true}]}'::jsonb,
    'dashboard'
  ),
  (
    'brunch_info',
    '{"start_time":"11:00","location":"","menu":"Café, jus, viennoiseries, brunch"}'::jsonb,
    'dashboard'
  ),
  (
    'dress_code',
    '{"text":"Chic & Vert"}'::jsonb,
    'dashboard'
  )
ON CONFLICT (key) DO NOTHING;
