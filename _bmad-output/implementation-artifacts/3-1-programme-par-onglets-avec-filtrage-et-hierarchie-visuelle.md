# Story 3.1: Programme par onglets avec filtrage et hierarchie visuelle

Status: review

## Story

As a invite,
I want to see my event programme organized by day with only the events I'm invited to,
so that I know exactly when to arrive and what to expect.

## Acceptance Criteria

1. **Given** un invite complet accede a la page programme
   **When** la page se charge
   **Then** deux onglets sont affiches : "Samedi 18 Juillet" et "Dimanche 19 Juillet"
   **And** tous les evenements sont visibles
   **And** les evenements majeurs sont affiches avec des cartes grandes/prominentes
   **And** les evenements secondaires sont affiches avec des cartes plus petites/discretes

2. **Given** un invite vin d'honneur accede a la page programme
   **When** la page se charge
   **Then** seul l'onglet "Samedi 18 Juillet" est affiche
   **And** seuls les evenements auxquels il est invite sont visibles (ouverture, ceremonie, VH)
   **And** le titre affiche "Ton programme"

3. **Given** un invite change d'onglet
   **When** il clique sur un autre onglet
   **Then** le contenu se charge sans delai (donnees deja presentes cote client)
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Server-side — passer invitation_type (AC: #1, #2)
  - [x] 1.1 Fetch invitation_type du guest dans +page.server.ts

- [x] Task 2 : Onglets samedi/dimanche (AC: #1, #2, #3)
  - [x] 2.1 Composant onglets avec activeTab state
  - [x] 2.2 Complet : 2 onglets, vin_honneur : 1 seul onglet
  - [x] 2.3 Changement instantane (donnees client-side)

- [x] Task 3 : Filtrage par type d'invitation (AC: #1, #2)
  - [x] 3.1 Tag forType sur chaque evenement ('all' vs 'complet_only')
  - [x] 3.2 Vin_honneur : seuls ouverture, ceremonie, VH affiches

- [x] Task 4 : Hierarchie visuelle (AC: #1)
  - [x] 4.1 Evenements majeurs (ceremonie, diner, brunch) : cartes plus grandes, icones plus grosses, bordure accent
  - [x] 4.2 Evenements secondaires : cartes standard

- [x] Task 5 : Validation finale (AC: #3)
  - [x] 5.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 3.1 — Programme par onglets avec filtrage et hierarchie visuelle

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Onglets samedi/dimanche : boutons stylises avec activeTab state, changement instantane
- Vin d'honneur : seul l'onglet samedi visible, evenements filtres (ouverture, ceremonie, VH uniquement)
- Hierarchie visuelle : evenements major ont cartes plus grandes (p-8), icones plus grosses (h-20 w-20), bordure primary/20, noeud central accentue
- Titre "Ton Programme" pour tous les types, sous-titre adapte
- Chaque evenement tague 'all' ou 'complet_only' pour le filtrage
- Server fetch invitation_type via auth_id

### File List

- `src/routes/programme/+page.server.ts` (MODIFIED)
- `src/routes/programme/+page.svelte` (MODIFIED)
