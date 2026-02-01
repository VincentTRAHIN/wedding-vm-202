# Story 4.1: Page profil settings — email et mot de passe

Status: review

## Story

As a invite,
I want to manage my email and password from my profile settings,
so that I can update my credentials without contacting the couple.

## Acceptance Criteria

1. **Given** un invite connecte par email/mot de passe accede a `/profile/settings`
   **When** il modifie son adresse email
   **Then** l'email est mis a jour dans `auth.users` ET `guests.email` de maniere atomique
   **And** un message de confirmation s'affiche

2. **Given** un invite connecte par email/mot de passe accede a `/profile/settings`
   **When** il modifie son mot de passe
   **Then** le mot de passe est mis a jour dans Supabase Auth
   **And** la validation exige l'ancien mot de passe

3. **Given** un invite connecte via Google OAuth accede a `/profile/settings`
   **When** il souhaite creer un mot de passe
   **Then** un formulaire de creation est affiche (sans ancien mot de passe)
   **And** la validation Zod server-side est appliquee
   **And** le rate limiting est actif
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Server-side +page.server.ts (AC: #1, #2, #3)
  - [x] 1.1 Load : fetch guest (full_name, email), detecter OAuth vs email/password
  - [x] 1.2 Action updateEmail : validation Zod, mise a jour atomique auth.users + guests.email
  - [x] 1.3 Action updatePassword : validation ancien mot de passe, mise a jour Supabase Auth
  - [x] 1.4 Action createPassword : pour OAuth users, sans ancien mot de passe
  - [x] 1.5 Rate limiting sur les 3 actions

- [x] Task 2 : Frontend +page.svelte (AC: #1, #2, #3)
  - [x] 2.1 Section profil invite (nom, lien "Ce n'est pas moi")
  - [x] 2.2 Section email avec formulaire
  - [x] 2.3 Section mot de passe : modification (email/pwd) ou creation (OAuth)
  - [x] 2.4 Toggle visibility mot de passe, feedback toast

- [x] Task 3 : Validation finale (AC: #3)
  - [x] 3.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 4.1 — Page profil settings avec email et mot de passe

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Nouvelle route /profile/settings avec 3 form actions (updateEmail, updatePassword, createPassword)
- Detection OAuth via app_metadata.provider et app_metadata.providers
- Mise a jour email atomique : auth.users via admin API + guests.email, rollback en cas d'erreur
- Verification ancien mot de passe via signInWithPassword avant update
- Rate limiting (5/min) sur les 3 actions
- UI : 3 cartes (profil, email, mot de passe) avec toggle visibility et feedback toast

### File List

- `src/routes/profile/settings/+page.server.ts` (CREATED)
- `src/routes/profile/settings/+page.svelte` (CREATED)
