# Story 2.3: Templates email adaptes au type d'invitation

Status: review

## Story

As a invite,
I want to receive emails that accurately reflect my invitation type,
so that the confirmation and information I receive matches what I'm actually invited to.

## Acceptance Criteria

1. **Given** un invite complet soumet son RSVP
   **When** l'email de confirmation est envoye
   **Then** l'email recapitule la presence pour tous les evenements (ceremonie, vin d'honneur, diner, brunch) avec les restrictions alimentaires

2. **Given** un invite vin d'honneur soumet son RSVP
   **When** l'email de confirmation est envoye
   **Then** l'email recapitule uniquement la presence a la ceremonie et au vin d'honneur
   **And** aucune mention du diner ou du brunch n'apparait

3. **Given** un invite est ajoute par l'admin
   **When** l'email d'invitation est envoye
   **Then** le contenu reflete le type d'invitation de l'invite

4. **Given** un RSVP est soumis
   **When** l'email d'alerte admin est envoye
   **Then** le type d'invitation de l'invite est mentionne dans l'alerte
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Email RSVP confirmation adapte (AC: #1, #2)
  - [x] 1.1 Ajout prop `invitationType` a RsvpConfirmation.svelte
  - [x] 1.2 Complet : recapitulatif avec jours enrichis (Ceremonie, VH, Diner & Soiree / Brunch)
  - [x] 1.3 Vin d'honneur : recapitulatif "Ceremonie & Vin d'honneur — Samedi 18 juillet"
  - [x] 1.4 Footer adapte : "18 & 19 juillet" vs "18 juillet"

- [x] Task 2 : Email invitation adapte (AC: #3)
  - [x] 2.1 Ajout prop `invitationType` a GuestInvitation.svelte
  - [x] 2.2 Texte adapte : "a notre mariage" vs "a notre ceremonie et vin d'honneur"

- [x] Task 3 : Email alerte admin avec type (AC: #4)
  - [x] 3.1 Ajout prop `invitationType` a AdminNewRsvp.svelte
  - [x] 3.2 Badge colore type d'invitation a cote du nom (vert Complet / orange VH)
  - [x] 3.3 Section evenements adaptee : jours enrichis pour complet, "Ceremonie & VH" pour vin_honneur

- [x] Task 4 : Propagation invitation_type dans les appels email (AC: #1-#4)
  - [x] 4.1 Mise a jour signatures email.ts (sendRsvpConfirmation, sendGuestInvitation, sendAdminAlert)
  - [x] 4.2 Passage invitation_type dans tous les appels depuis +page.server.ts (update, addManagedGuest)
  - [x] 4.3 Ajout invitation_type au select query des guests dans l'action update
  - [x] 4.4 Ajout invitation_type au select retour de l'update dans addManagedGuest

- [x] Task 5 : Validation finale (AC: #4)
  - [x] 5.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 2.3 — Templates email adaptes au type d'invitation

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- RsvpConfirmation : prop invitationType, jours enrichis pour complet, "Ceremonie & VH" pour vin_honneur, footer adapte
- GuestInvitation : prop invitationType, texte "a notre mariage" vs "a notre ceremonie et vin d'honneur"
- AdminNewRsvp : prop invitationType, badge colore type (vert/orange), section evenements adaptee
- email.ts : 3 fonctions mises a jour avec parametre invitationType (defaut 'complet')
- +page.server.ts : invitation_type propagee dans tous les appels email (update + addManagedGuest)
- invitation_type ajoutee au select query des guests et au select retour de addManagedGuest

### File List

- `src/lib/emails/RsvpConfirmation.svelte` (MODIFIED)
- `src/lib/emails/AdminNewRsvp.svelte` (MODIFIED)
- `src/lib/emails/GuestInvitation.svelte` (MODIFIED)
- `src/lib/server/email.ts` (MODIFIED)
- `src/routes/rsvp/+page.server.ts` (MODIFIED)
