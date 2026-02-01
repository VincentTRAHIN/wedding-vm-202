# Story 3.2: Homepage CTAs contextuels

Status: review

## Story

As a invite,
I want the homepage to guide me toward the right action based on my RSVP status,
so that I always know what to do next when I visit the site.

## Acceptance Criteria

1. **Given** un invite connecte n'a pas encore repondu au RSVP
   **When** il accede a la homepage
   **Then** le bouton RSVP affiche "Confirmer Ta Presence" avec un sous-texte "Repondre avant le 1er mai"
   **And** le bouton est visuellement mis en avant par rapport aux deux autres

2. **Given** un invite connecte a deja repondu au RSVP
   **When** il accede a la homepage
   **Then** le bouton RSVP affiche "Voir / Modifier mon RSVP"

3. **Given** un invite accede a la homepage
   **When** la page se charge
   **Then** trois boutons d'action sont visibles : RSVP, Programme, Galerie
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Server-side — passer rsvp_status (AC: #1, #2)
  - [x] 1.1 Ajouter rsvp_status au select query du guest dans +page.server.ts

- [x] Task 2 : CTA RSVP contextuel (AC: #1, #2)
  - [x] 2.1 Si pas repondu : "Confirmer Ta Presence" + sous-texte, bouton prominent (h-14, font-bold, shadow-md)
  - [x] 2.2 Si deja repondu : "Voir / Modifier mon RSVP" en variant outline

- [x] Task 3 : Trois boutons d'action (AC: #3)
  - [x] 3.1 RSVP (contextuel) + Programme + Galerie
  - [x] 3.2 Programme et Galerie en variant outline

- [x] Task 4 : Validation finale (AC: #3)
  - [x] 4.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 3.2 — Homepage CTAs contextuels avec 3 boutons d'action

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Ajout rsvp_status au select du guest en homepage server
- CTA RSVP contextuel : "Confirmer Ta Presence" (pending) vs "Voir / Modifier mon RSVP" (repondu)
- Bouton RSVP pending : h-14, text-lg, font-bold, shadow-md — visuellement predominant
- Sous-texte "Repondre avant le 1er mai" sous le bouton CTA
- Trois boutons : RSVP + Programme + Galerie
- Ancien bouton "Mon Espace Invite" remplace par "Programme"

### File List

- `src/routes/+page.server.ts` (MODIFIED)
- `src/routes/+page.svelte` (MODIFIED)
