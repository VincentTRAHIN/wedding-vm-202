-- Migration: Add invitation_type enum, remove invitation_code
-- Story 1.1: Migration BDD et nettoyage invitation_code

-- Step 1: Create the invitation_type enum
CREATE TYPE public.invitation_type_enum AS ENUM ('complet', 'vin_honneur');

-- Step 2: Add invitation_type column with default 'complet'
ALTER TABLE public.guests
  ADD COLUMN invitation_type public.invitation_type_enum NOT NULL DEFAULT 'complet';

-- Step 3: Remove the unused invitation_code column
ALTER TABLE public.guests
  DROP COLUMN IF EXISTS invitation_code;
