-- ========================================
-- SCRIPT DE DEBUG - Vérifier l'état de Melanie Trahin
-- ========================================
-- Ce script affiche toutes les informations pertinentes sur le profil de Melanie

-- 1. Informations complètes sur Melanie
SELECT 
  id,
  email,
  full_name,
  auth_id,
  rsvp_status,
  invitation_sent,
  invitation_code,
  managed_by_id,
  is_child,
  present_saturday,
  present_sunday,
  created_at,
  updated_at
FROM public.guests 
WHERE email = 'melanie.douge@gmail.com' 
   OR full_name ILIKE '%melanie%trahin%';

-- 2. Vérifier si un compte Auth existe
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'melanie.douge@gmail.com';

-- 3. Vérifier qui gère Melanie (si managed_by_id est rempli)
SELECT 
  g1.full_name as melanie,
  g1.email as melanie_email,
  g1.managed_by_id,
  g1.invitation_sent,
  g2.full_name as managed_by,
  g2.email as managed_by_email
FROM public.guests g1
LEFT JOIN public.guests g2 ON g1.managed_by_id = g2.id
WHERE g1.email = 'melanie.douge@gmail.com';

-- 4. Vérifier les invités gérés PAR Melanie (si elle a ajouté quelqu'un)
SELECT 
  id,
  full_name,
  email,
  rsvp_status,
  invitation_sent,
  managed_by_id
FROM public.guests 
WHERE managed_by_id IN (
  SELECT id FROM public.guests WHERE email = 'melanie.douge@gmail.com'
);
