-- ========================================
-- SCRIPT DE RESET - Melanie Trahin
-- ========================================
-- Ce script supprime complètement le profil de Melanie Trahin
-- pour permettre de refaire un test en tant qu'invité d'un invité
-- Email: melanie.douge@gmail.com

-- 1. Trouver et afficher les informations actuelles
SELECT 
  id,
  email,
  full_name,
  auth_id,
  rsvp_status,
  invitation_sent,
  managed_by
FROM public.guests 
WHERE email = 'melanie.douge@gmail.com';

-- 2. Supprimer le compte Auth associé (si existant)
-- ⚠️ ATTENTION : Ceci supprime DÉFINITIVEMENT le compte utilisateur Auth
DELETE FROM auth.users 
WHERE email = 'melanie.douge@gmail.com';

-- 3. Remettre à zéro les données de l'invité dans la table guests
-- On garde l'entrée mais on reset toutes les données liées au compte
UPDATE public.guests 
SET 
  auth_id = NULL,
  invitation_sent = FALSE,
  rsvp_status = 'pending',
  present_saturday = NULL,
  present_sunday = NULL,
  message_for_couple = NULL,
  managed_by = NULL
WHERE email = 'melanie.douge@gmail.com';

-- 4. Supprimer tous les invités gérés par Melanie (si elle en a ajouté)
-- Ceci supprime complètement les lignes des invités qu'elle aurait pu ajouter
DELETE FROM public.guests 
WHERE managed_by IN (
  SELECT id FROM public.guests WHERE email = 'melanie.douge@gmail.com'
);

-- 5. Vérifier le résultat final
SELECT 
  id,
  email,
  full_name,
  auth_id,
  rsvp_status,
  invitation_sent,
  managed_by
FROM public.guests 
WHERE email = 'melanie.douge@gmail.com';

-- Résultat attendu :
-- - auth_id: NULL (plus de compte Auth lié)
-- - invitation_sent: FALSE (pas encore invitée)
-- - rsvp_status: 'pending' (pas encore répondu)
-- - managed_by: NULL (pas gérée par quelqu'un d'autre)
-- - Tous les autres champs liés à la RSVP remis à NULL

