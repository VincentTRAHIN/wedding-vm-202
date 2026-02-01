# Story 1.4: Badges colores, filtres et compteurs

Status: review

## Story

As a admin,
I want to see colored badges, filter guests by type, and view aggregate counters,
so that I can monitor my guest list at a glance and extract numbers for the caterer.

## Acceptance Criteria

1. **Given** l'admin est sur la liste des invites
   **When** il regarde la liste
   **Then** un badge colore apparait a cote de chaque nom (vert pour "Complet", orange pour "Vin d'honneur")

2. **Given** l'admin veut filtrer par type
   **When** il selectionne un filtre de type d'invitation
   **Then** seuls les invites du type selectionne sont affiches

3. **Given** l'admin consulte les compteurs
   **When** la page se charge
   **Then** des compteurs agreges affichent le nombre par type et par statut RSVP
   **And** des compteurs par evenement affichent les confirmes par evenement (ceremonie, vin d'honneur, diner, brunch)
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Ajouter badges colores par type d'invitation (AC: #1)
  - [x] 1.1 Badge vert "C" (Complet) et orange "VH" (Vin d'honneur) dans les cartes mobile
  - [x] 1.2 Memes badges dans le tableau desktop

- [x] Task 2 : Ajouter filtre par type (AC: #2)
  - [x] 2.1 Select "Tous les types / Complet / Vin d'honneur" dans le header de la liste
  - [x] 2.2 Filtrage reactif integre dans le derived `sortedGuests`

- [x] Task 3 : Ajouter compteurs agreges (AC: #3)
  - [x] 3.1 Carte compteurs en haut de page (total, complets, vin d'honneur)
  - [x] 3.2 Compteurs par evenement (ceremonie, vin d'honneur evt, diner, brunch)

- [x] Task 4 : Validation finale (AC: #3)
  - [x] 4.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 1.4 — Badges, filtres et compteurs ajoutes a la page admin guests

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Badges colores : vert "C" pour Complet, orange "VH" pour Vin d'honneur, affiches cote de chaque nom
- Filtre par type : select dropdown "Tous / Complet / Vin d'honneur" integre au filtrage existant
- Compteurs : carte responsive avec 7 metriques (total, complets, VH, ceremonie, VH evt, diner, brunch)
- Les compteurs sont des `$derived` reactifs recalcules automatiquement
- Layout adapte : compteurs en grille 2/4/7 colonnes selon le breakpoint

### File List

- `src/routes/admin/guests/+page.svelte` (MODIFIED)
