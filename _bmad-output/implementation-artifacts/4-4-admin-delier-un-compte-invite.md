# Story 4.4: Admin delier un compte invite

Status: review

## Story

As a admin,
I want to unlink a guest's account from their profile,
so that I can fix claim errors reported by guests.

## Acceptance Criteria

1. **Given** l'admin est sur la page de detail d'un invite dans `/admin/guests`
   **When** il clique sur "Delier le compte"
   **Then** le auth_id du profil est reinitialise a null
   **And** le RSVP du profil est reinitialise
   **And** l'invite, a sa prochaine connexion, est redirige vers `/claim-profile`
   **And** le profil redevient disponible dans la liste de claim
   **And** un feedback visuel confirme le succes
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Server action unlinkAccount (AC: #1)
  - [x] 1.1 Verifier que le guest a un auth_id
  - [x] 1.2 Reset auth_id=null, rsvp_status='pending', present_saturday/sunday=null, dietary/message=null

- [x] Task 2 : UI bouton "Delier le compte" (AC: #1)
  - [x] 2.1 Bouton dans EditGuestDialog, visible uniquement si auth_id present
  - [x] 2.2 Feedback toast apres succes

- [x] Task 3 : Validation finale (AC: #1)
  - [x] 3.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 4.4 — Admin delier un compte invite

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Nouvelle action `unlinkAccount` dans admin/guests/+page.server.ts
- Reset complet : auth_id=null, rsvp_status='pending', present_saturday/sunday=null, dietary/message=null
- Bouton "Delier le compte" dans EditGuestDialog, visible seulement si guest.auth_id est present
- Feedback toast de confirmation apres succes
- Le guest sera redirige vers /claim-profile a sa prochaine connexion (gere par hooks existant)

### File List

- `src/routes/admin/guests/+page.server.ts` (MODIFIED)
- `src/routes/admin/guests/EditGuestDialog.svelte` (MODIFIED)
