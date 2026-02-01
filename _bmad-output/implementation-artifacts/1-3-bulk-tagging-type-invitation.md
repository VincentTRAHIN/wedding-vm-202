# Story 1.3: Bulk tagging type d'invitation

Status: review

## Story

As a admin,
I want to assign an invitation type to multiple guests at once,
so that I can efficiently tag groups of guests without editing them one by one.

## Acceptance Criteria

1. **Given** l'admin est sur la liste des invites `/admin/guests`
   **When** il selectionne plusieurs invites via des checkboxes
   **Then** une action groupee "Definir le type d'invitation" est disponible
   **And** il peut choisir "Complet" ou "Vin d'honneur" dans un dropdown

2. **Given** l'admin a selectionne 15 invites et choisi "Vin d'honneur"
   **When** il valide l'action groupee
   **Then** les 15 invites ont leur `invitation_type` mis a jour en base
   **And** un feedback visuel confirme le succes de l'operation
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Ajouter action server bulk update (AC: #2)
  - [x] 1.1 Ajouter action `bulkUpdateType` dans `+page.server.ts` avec Supabase `.in()` query
  - [x] 1.2 Validation Zod : array d'UUIDs + invitationTypeSchema

- [x] Task 2 : Ajouter UI selection multiple (AC: #1)
  - [x] 2.1 Ajouter checkboxes de selection (mobile cards + desktop table) avec SvelteSet reactif
  - [x] 2.2 Ajouter barre d'actions groupees avec select type + bouton Appliquer + Annuler
  - [x] 2.3 Feedback visuel toast apres succes avec nombre d'invites mis a jour

- [x] Task 3 : Validation finale (AC: #2)
  - [x] 3.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 1.3 — Selection multiple et bulk update du type d'invitation

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Action server `bulkUpdateType` ajoutee avec validation Zod (array UUIDs + invitationTypeSchema)
- Utilise `SvelteSet` (Svelte 5 reactivity) pour la selection
- Barre d'actions groupees conditionnelle (apparait seulement quand >= 1 invite selectionne)
- Checkboxes ajoutees aux cartes mobile et au tableau desktop
- Toast de confirmation avec nombre d'invites mis a jour
- Bouton Annuler pour deselectionner tout

### File List

- `src/routes/admin/guests/+page.server.ts` (MODIFIED)
- `src/routes/admin/guests/+page.svelte` (MODIFIED)
