# Story 4.2: Changement de profil "Ce n'est pas moi"

Status: review

## Story

As a invite,
I want to correct a profile claim error by switching to my real profile,
so that I can fix a mistake without contacting the couple.

## Acceptance Criteria

1. **Given** un invite connecte accede a `/profile/settings`
   **When** il regarde la section "Mon profil invite"
   **Then** son nom de profil lie est affiche
   **And** un lien "Ce n'est pas moi ? Changer de profil" est visible

2. **Given** l'invite clique sur "Ce n'est pas moi"
   **When** la page s'ouvre
   **Then** un message affiche "Tu es actuellement lie a [nom]. Choisis ton vrai profil :"
   **And** la liste des profils disponibles est affichee

3. **Given** l'invite selectionne un nouveau profil et confirme
   **When** le changement est effectue
   **Then** un avertissement RSVP reinitialise est affiche avant confirmation
   **And** le lien auth_id est transfere
   **And** l'ancien profil est reinitialise
   **And** les managed guests sont transferes
   **And** l'operation est atomique
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Route /profile/settings/change-profile (AC: #2, #3)
  - [x] 1.1 Server load : fetch current guest et available profiles (non revendiques)
  - [x] 1.2 Action changeProfile : transfert managed guests, reset ancien profil, lier nouveau
  - [x] 1.3 Validation Zod UUID

- [x] Task 2 : Frontend change-profile (AC: #1, #2, #3)
  - [x] 2.1 Affichage profil actuel et selecteur nouveau profil
  - [x] 2.2 Dialog de confirmation avec avertissement RSVP reinitialise
  - [x] 2.3 Lien depuis /profile/settings "Ce n'est pas moi ? Changer de profil"

- [x] Task 3 : Validation finale (AC: #3)
  - [x] 3.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 4.2 — Changement de profil avec confirmation et transfert

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Nouvelle route /profile/settings/change-profile
- Transfert atomique : managed guests migres, ancien profil reset (auth_id=null, RSVP=pending), nouveau profil lie
- Dialog de confirmation avec avertissement clair avant le changement
- GuestSelector reutilise pour la selection du nouveau profil
- Redirect vers /rsvp apres changement pour re-remplir le RSVP

### File List

- `src/routes/profile/settings/change-profile/+page.server.ts` (CREATED)
- `src/routes/profile/settings/change-profile/+page.svelte` (CREATED)
