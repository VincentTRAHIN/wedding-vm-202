# Tasks: Nouvelle Feature "Tableau de Bord Invité"

## Phase 1: Database & Backend Setup

- [x] A1-01: Créer migration SQL `rooms` <!-- id: 0 -->
- [x] A1-02: Créer migration SQL `guests.room_id` <!-- id: 1 -->
- [x] A1-03: Mettre à jour types Supabase (`npx supabase gen types`) <!-- id: 2 -->
- [x] A1-13: Créer migration `site_content` <!-- id: 3 -->
- [x] A1-14: Seed données initiales guide local <!-- id: 4 -->

## Phase 2: Admin Features

- [x] A1-04: Créer page admin `/admin/rooms` (CRUD chambres) <!-- id: 5 -->
- [x] A1-05: Ajouter sélecteur chambre dans `/admin/guests` <!-- id: 6 -->
- [x] A1-16: Créer page admin `/admin/content` (éditeur JSONB) <!-- id: 7 -->

## Phase 3: Dashboard UI Components

- [x] A1-06: Créer composant `RoomCard.svelte` <!-- id: 8 -->
- [x] A1-10: Créer composant `RecapCard.svelte` <!-- id: 9 -->
- [x] A1-11: Intégrer boutons navigation (Waze/Maps) <!-- id: 10 -->
- [x] A1-15: Créer composant `LocalGuideSection.svelte` <!-- id: 11 -->

## Phase 4: Dashboard Page Integration

- [x] A1-08: Créer route `/dashboard/+page.svelte` <!-- id: 12 -->
- [x] A1-09: Créer `+page.server.ts` avec chargement données invité <!-- id: 13 -->
- [x] A1-07: Créer section "Votre Hébergement" dans dashboard <!-- id: 14 -->
- [x] A1-17: Intégrer guide local dans `/dashboard` <!-- id: 15 -->
- [x] A1-12: Ajouter lien Dashboard dans navigation principale <!-- id: 16 -->
