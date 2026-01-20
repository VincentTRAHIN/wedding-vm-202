-- ========================================
-- SCRIPT DE NETTOYAGE - RESET DES TESTS
-- ========================================
-- Ce script remet à zéro tous les liens entre utilisateurs Auth et invités
-- À utiliser pour nettoyer les données de test avant la mise en production

-- 1. Remettre à zéro tous les auth_id (délie tous les invités des comptes Auth)
UPDATE public.guests 
SET auth_id = NULL, invitation_sent = FALSE
WHERE auth_id IS NOT NULL;

-- 2. Optionnel : Supprimer tous les utilisateurs Auth créés pendant les tests
-- ⚠️ ATTENTION : Ceci supprime DÉFINITIVEMENT les comptes utilisateurs
-- Décommenter la ligne suivante uniquement si tu veux supprimer les comptes de test
-- DELETE FROM auth.users WHERE email LIKE '%@example.com%' OR email = 'ton-email-de-test@gmail.com';

-- 3. Vérifier le résultat
SELECT 
  COUNT(*) as total_guests,
  COUNT(auth_id) as guests_with_auth,
  COUNT(*) - COUNT(auth_id) as guests_without_auth
FROM public.guests;

-- Devrait afficher :
-- total_guests: X (nombre total d'invités)
-- guests_with_auth: 0 (plus personne n'est lié)
-- guests_without_auth: X (tous les invités sont disponibles)
