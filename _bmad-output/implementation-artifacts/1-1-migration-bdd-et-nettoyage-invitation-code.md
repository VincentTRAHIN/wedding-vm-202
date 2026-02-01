# Story 1.1: Migration BDD et nettoyage invitation_code

Status: review

## Story

As a admin,
I want the database to support invitation types and remove the unused invitation_code system,
so that the foundation is ready for differentiated guest management.

## Acceptance Criteria

1. **Given** la table `guests` existe avec la colonne `invitation_code`
   **When** la migration est executee
   **Then** une colonne `invitation_type` de type enum (`complet`, `vin_honneur`) avec defaut `complet` est ajoutee a la table `guests`

2. **Given** la migration est executee
   **Then** la colonne `invitation_code` est supprimee de la table `guests`

3. **Given** le codebase contient des references a `invitation_code`
   **When** le nettoyage est termine
   **Then** toutes les references a `invitation_code` sont supprimees du codebase (composants, server code, validation, types)

4. **Given** les RLS policies existent sur la table `guests`
   **When** la migration est executee
   **Then** les RLS policies existantes restent valides et fonctionnelles (aucune policy ne reference `invitation_code`)

5. **Given** la migration et le nettoyage sont termines
   **When** les types sont regeneres
   **Then** les types TypeScript sont regeneres via `make types` et incluent `invitation_type`

6. **Given** toutes les modifications sont terminees
   **When** `make qa` est execute
   **Then** le lint et le type check passent sans erreur

## Tasks / Subtasks

- [x] Task 1 : Creer la migration SQL (AC: #1, #2, #4)
  - [x] 1.1 Creer un fichier `supabase/migrations/20260201_add_invitation_type_remove_code.sql`
  - [x] 1.2 Creer le type enum `invitation_type_enum` avec valeurs `complet` et `vin_honneur`
  - [x] 1.3 Ajouter la colonne `invitation_type` (type `invitation_type_enum`, NOT NULL, DEFAULT `complet`) sur `guests`
  - [x] 1.4 Supprimer la colonne `invitation_code` de `guests`
  - [x] 1.5 Verifier que les RLS policies existantes ne referencent pas `invitation_code` (confirmation : aucune ne le reference)

- [ ] Task 2 : Regenerer les types TypeScript (AC: #5)
  - [ ] 2.1 Executer `make types` pour regenerer `src/lib/types/supabase.ts` — BLOQUE: necessite migration appliquee sur Supabase remote
  - [ ] 2.2 Verifier que `invitation_type` apparait dans les types Row, Insert, Update
  - [ ] 2.3 Verifier que `invitation_code` a disparu des types

- [x] Task 3 : Nettoyer le code RSVP (AC: #3)
  - [x] 3.1 `src/routes/rsvp/+page.server.ts` — Supprimer `invitation_code` du select
  - [x] 3.2 `src/routes/rsvp/+page.server.ts` — Supprimer la generation de `invitationCode` pour les managed guests
  - [x] 3.3 `src/routes/rsvp/+page.server.ts` — Supprimer le reset de `invitation_code: null` lors de la suppression d'un managed guest

- [x] Task 4 : Nettoyer la validation Zod (AC: #3)
  - [x] 4.1 `src/lib/server/validation.ts` — Supprimer `invitationCodeSchema`

- [x] Task 5 : Nettoyer le code email (AC: #3)
  - [x] 5.1 `src/lib/server/email.ts` — Supprimer le commentaire deprecated et la fonction `sendInvitationEmail` (code mort)

- [x] Task 6 : Mettre a jour la documentation (AC: #3)
  - [x] 6.1 `docs/DEPLOYMENT.md` — Ajouter la nouvelle migration dans l'ordre de deploiement
  - [x] 6.2 `supabase/migrations/CHECK_MELANIE_STATUS.sql` — Supprimer reference `invitation_code` du script de debug

- [x] Task 7 : Validation finale (AC: #6)
  - [x] 7.1 Executer `make qa` — 13 erreurs pre-existantes, aucune nouvelle erreur introduite par nos modifications
  - [x] 7.2 Verifier qu'aucune reference a `invitation_code` ne subsiste dans le code applicatif (grep) — confirme : zero reference dans src/ (hors types auto-generes)

## Dev Notes

- **Migration non-destructive** : La colonne `invitation_type` a un DEFAULT `complet`, donc tous les invites existants recoivent automatiquement le type `complet` sans action manuelle.
- **Aucune donnee a preserver** dans `invitation_code` : le champ etait utilise pour generer des codes guest-XXXX lors de l'ajout de managed guests, mais cette logique est obsolete.
- **RLS safe** : Aucune des 8 RLS policies existantes (SELECT/INSERT/UPDATE pour users, admins, managed_by) ne reference `invitation_code`. La migration ne casse aucune policy.
- **Pas de rollback complexe** : Si necessaire, la migration inverse serait `DROP COLUMN invitation_type` + `ADD COLUMN invitation_code TEXT UNIQUE`.
- **Task 2 bloquee** : `make types` necessite que la migration soit appliquee sur le Supabase remote. A executer apres deploiement de la migration.
- **Nettoyage bonus** : Suppression de la fonction deprecated `sendInvitationEmail` (code mort) et nettoyage du script debug `CHECK_MELANIE_STATUS.sql`.

### Project Structure Notes

- Le pattern de migration est : fichiers SQL incrementaux dans `supabase/migrations/` nommes `YYYYMMDD_description.sql`
- Les types sont auto-generes depuis le schema Supabase remote via `make types` → `src/lib/types/supabase.ts`
- La validation Zod est centralisee dans `src/lib/server/validation.ts`
- Les form actions SvelteKit sont dans les fichiers `+page.server.ts` de chaque route

### References

- [Source: supabase/migrations/20251202_add_invitation_code.sql] — Migration originale de `invitation_code`
- [Source: src/routes/rsvp/+page.server.ts:101] — Select incluant `invitation_code` (supprime)
- [Source: src/routes/rsvp/+page.server.ts:313-321] — Generation de code pour managed guests (supprime)
- [Source: src/routes/rsvp/+page.server.ts:429] — Reset `invitation_code` a null (supprime)
- [Source: src/lib/server/validation.ts:59-60] — Schema Zod `invitationCodeSchema` (supprime)
- [Source: src/lib/server/email.ts:163-166] — Fonction deprecated `sendInvitationEmail` (supprimee)
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — Acceptance criteria source
- [Source: _bmad-output/planning-artifacts/prd.md#Nettoyage technique] — FR39

### Fichiers impactes

| Fichier | Action |
|---------|--------|
| `supabase/migrations/20260201_add_invitation_type_remove_code.sql` | CREER — migration SQL |
| `src/lib/types/supabase.ts` | REGENERER — via `make types` apres deploiement migration |
| `src/routes/rsvp/+page.server.ts` | MODIFIER — supprimer 3 blocs referençant `invitation_code` |
| `src/lib/server/validation.ts` | MODIFIER — supprimer `invitationCodeSchema` |
| `src/lib/server/email.ts` | MODIFIER — supprimer fonction deprecated `sendInvitationEmail` |
| `docs/DEPLOYMENT.md` | MODIFIER — ajouter nouvelle migration |

## Change Log

- 2026-02-01: Implementation Story 1.1 — Migration SQL creee, code applicatif nettoye de toutes references a invitation_code, documentation mise a jour. Task 2 (make types) en attente de deploiement migration.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

- Migration SQL cree avec enum `invitation_type_enum` (complet, vin_honneur), colonne `invitation_type` NOT NULL DEFAULT 'complet', et DROP de `invitation_code`
- Code RSVP nettoye : select, generation de code managed guests, reset lors du remove
- Validation Zod : `invitationCodeSchema` supprime
- Email : fonction deprecated `sendInvitationEmail` supprimee (code mort confirme par grep)
- Script debug CHECK_MELANIE_STATUS.sql nettoye
- Documentation DEPLOYMENT.md mise a jour avec les 3 migrations manquantes (19-21)
- `make qa` : 13 erreurs pre-existantes, 0 nouvelle erreur introduite
- Grep final : 0 reference a `invitation_code` dans le code applicatif (src/ hors types auto-generes)

### File List

- `supabase/migrations/20260201_add_invitation_type_remove_code.sql` (CREATED)
- `src/routes/rsvp/+page.server.ts` (MODIFIED)
- `src/lib/server/validation.ts` (MODIFIED)
- `src/lib/server/email.ts` (MODIFIED)
- `docs/DEPLOYMENT.md` (MODIFIED)
- `supabase/migrations/CHECK_MELANIE_STATUS.sql` (MODIFIED)
