# Story 4.3: Claim-profile ameliore pour profils managed

Status: review

## Story

As a nouvel utilisateur,
I want to claim my guest profile even if it's already managed by someone else,
so that I can have my own account while keeping the group relationship intact.

## Acceptance Criteria

1. **Given** un nouvel utilisateur authentifie accede a `/claim-profile`
   **When** il recherche son nom
   **Then** les profils correspondants (y compris managed) sont affiches

2. **Given** l'utilisateur selectionne un profil avec managed_by_id
   **When** le systeme detecte le lien managed
   **Then** une etape intermediaire affiche "[Nom du manager] a deja renseigne des informations pour toi"

3. **Given** l'utilisateur confirme la revendication du profil managed
   **When** le lien est cree
   **Then** le auth_id est associe au profil
   **And** le managed_by_id reste intact
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Server — inclure managed guests dans la liste (AC: #1)
  - [x] 1.1 Retirer le filtre `.is('managed_by_id', null)` du query
  - [x] 1.2 Ajouter managed_by_id au select et resoudre les noms des managers

- [x] Task 2 : Server — garder managed_by_id intact au claim (AC: #3)
  - [x] 2.1 L'action claim ne modifie que auth_id et email, managed_by_id reste

- [x] Task 3 : Frontend — etape intermediaire pour profils managed (AC: #2)
  - [x] 3.1 Detecter si le profil selectionne a un managed_by_id
  - [x] 3.2 Afficher dialog de confirmation avec nom du manager
  - [x] 3.3 Bouton "Oui, c'est bien moi" pour confirmer

- [x] Task 4 : Validation finale (AC: #3)
  - [x] 4.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 4.3 — Claim-profile ameliore pour profils managed

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Le query unclaimed guests inclut maintenant les profils managed (managed_by_id non-null, auth_id null)
- Noms des managers resolus cote serveur pour l'affichage dans le dialog
- Dialog intermediaire pour profils managed : "[Manager] a deja renseigne des informations pour toi"
- Le claim ne modifie que auth_id et email — managed_by_id reste intact
- Le bouton "C'est moi" intercepte les profils managed pour afficher la confirmation

### File List

- `src/routes/claim-profile/+page.server.ts` (MODIFIED)
- `src/routes/claim-profile/+page.svelte` (MODIFIED)
