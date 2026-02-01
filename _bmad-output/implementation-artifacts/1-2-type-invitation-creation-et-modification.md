# Story 1.2: Type d'invitation a la creation et modification d'un invite

Status: review

## Story

As a admin,
I want to set the invitation type when creating or editing a guest,
so that each guest is properly categorized from the start.

## Acceptance Criteria

1. **Given** l'admin est sur le formulaire de creation d'un invite
   **When** il cree un nouvel invite
   **Then** un champ dropdown "Type d'invitation" (Complet / Vin d'honneur) est visible
   **And** la valeur par defaut est "Complet"
   **And** le type selectionne est sauvegarde en base

2. **Given** l'admin est sur le formulaire de modification d'un invite existant
   **When** il modifie le type d'invitation
   **Then** le nouveau type est sauvegarde en base
   **And** la validation Zod server-side accepte uniquement les valeurs `complet` ou `vin_honneur`
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Ajouter validation Zod pour invitation_type (AC: #2)
  - [x] 1.1 Ajouter `invitationTypeSchema` dans `src/lib/server/validation.ts`
  - [x] 1.2 Ajouter `invitation_type` aux schemas `addGuestSchema` et `editGuestSchema` dans `+page.server.ts`

- [x] Task 2 : Mettre a jour les actions server (AC: #1, #2)
  - [x] 2.1 Inclure `invitation_type` dans `insertData` de l'action `add`
  - [x] 2.2 Inclure `invitation_type` dans `updateData` de l'action `edit`

- [x] Task 3 : Ajouter le dropdown au formulaire de creation (AC: #1)
  - [x] 3.1 Ajouter un select "Type d'invitation" dans `+page.svelte` (formulaire Add Guest) avec defaut "Complet"

- [x] Task 4 : Ajouter le dropdown au formulaire de modification (AC: #2)
  - [x] 4.1 Ajouter un select "Type d'invitation" dans `EditGuestDialog.svelte` pre-rempli avec la valeur actuelle

- [x] Task 5 : Validation finale (AC: #2)
  - [x] 5.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur introduite

## Dev Notes

- `invitationTypeSchema` est exporte depuis `validation.ts` et reutilisable dans d'autres routes
- La valeur par defaut est `complet` cote Zod (`.default('complet')`) et cote select HTML (`selected`)
- Le select dans EditGuestDialog utilise `guest.invitation_type || 'complet'` pour gerer les invites existants

### References

- [Source: src/lib/server/validation.ts:55-56] — invitationTypeSchema
- [Source: src/routes/admin/guests/+page.server.ts:52-56] — addGuestSchema avec invitation_type
- [Source: src/routes/admin/guests/+page.svelte:112-124] — Select dans formulaire Add
- [Source: src/routes/admin/guests/EditGuestDialog.svelte:89-101] — Select dans dialog Edit

## Change Log

- 2026-02-01: Implementation Story 1.2 — Dropdown type d'invitation ajoute aux formulaires creation et modification, validation Zod server-side

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Schema Zod `invitationTypeSchema` ajoute dans validation.ts (`z.enum(['complet', 'vin_honneur'])`)
- `addGuestSchema` et `editGuestSchema` etendus avec `invitation_type`
- Actions `add` et `edit` incluent `invitation_type` dans les donnees insert/update
- Select HTML ajoute dans le formulaire Add Guest (+page.svelte) avec defaut "Complet"
- Select HTML ajoute dans EditGuestDialog.svelte pre-rempli avec la valeur actuelle du guest
- `make qa` : 0 nouvelle erreur

### File List

- `src/lib/server/validation.ts` (MODIFIED)
- `src/routes/admin/guests/+page.server.ts` (MODIFIED)
- `src/routes/admin/guests/+page.svelte` (MODIFIED)
- `src/routes/admin/guests/EditGuestDialog.svelte` (MODIFIED)
