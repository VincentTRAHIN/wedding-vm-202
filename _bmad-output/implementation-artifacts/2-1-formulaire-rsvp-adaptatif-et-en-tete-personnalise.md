# Story 2.1: Formulaire RSVP adaptatif et en-tete personnalise

Status: review

## Story

As a invite,
I want to see a RSVP form adapted to my invitation type with a personalized header,
so that I know exactly which events I'm invited to and can respond accordingly.

## Acceptance Criteria

1. **Given** un invite complet accede a la page RSVP
   **When** le formulaire se charge
   **Then** un en-tete personnalise affiche "Tu es invite(e) a celebrer notre mariage le samedi 18 et dimanche 19 juillet — ceremonie, vin d'honneur, diner, soiree et brunch !"
   **And** le formulaire affiche des checkboxes par jour/bloc : "Samedi 18 — Ceremonie, Vin d'honneur, Diner & Soiree" et "Dimanche 19 — Brunch"
   **And** l'invite peut ajouter des accompagnants (adultes et enfants)
   **And** l'invite peut specifier des restrictions alimentaires pour chaque personne

2. **Given** un invite vin d'honneur accede a la page RSVP
   **When** le formulaire se charge
   **Then** un en-tete personnalise affiche "Tu es invite(e) a notre ceremonie et vin d'honneur le samedi 18 juillet !"
   **And** le formulaire affiche un choix simplifie "Present / Absent" sans checkbox par jour
   **And** l'invite peut ajouter des accompagnants et restrictions alimentaires

3. **Given** un invite gerant un groupe (managed guests)
   **When** il soumet le RSVP
   **Then** le RSVP est soumis pour lui-meme et tous ses membres manages en une seule action

4. **Given** un invite managed_by qui a son propre compte
   **When** il accede a la page RSVP
   **Then** il peut modifier individuellement son propre RSVP
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : En-tete personnalise selon le type d'invitation (AC: #1, #2)
  - [x] 1.1 En-tete complet : "Tu es invite(e) a celebrer notre mariage le samedi 18 et dimanche 19 juillet..."
  - [x] 1.2 En-tete vin d'honneur : "Tu es invite(e) a notre ceremonie et vin d'honneur le samedi 18 juillet !"

- [x] Task 2 : Formulaire adaptatif dans RsvpFormItem (AC: #1, #2)
  - [x] 2.1 Passer `invitationType` en prop a RsvpFormItem
  - [x] 2.2 Complet : afficher checkboxes jour (samedi + dimanche) avec description enrichie
  - [x] 2.3 Vin d'honneur : masquer les checkboxes jour, Present/Absent simplifie

- [x] Task 3 : Vue resume adaptative (AC: #1, #2)
  - [x] 3.1 Resume complet : afficher jours de presence
  - [x] 3.2 Resume vin d'honneur : pas de jours, juste Present/Absent

- [x] Task 4 : Server-side — forcer present_saturday=true pour vin_honneur (AC: #2)
  - [x] 4.1 Dans l'action update, si invitation_type === 'vin_honneur', forcer present_saturday=true et present_sunday=false

- [x] Task 5 : Validation finale (AC: #4)
  - [x] 5.1 `make qa` — 13 erreurs pre-existantes, 0 nouvelle erreur

## Change Log

- 2026-02-01: Implementation Story 2.1 — Formulaire RSVP adaptatif avec en-tete personnalise et server-side type handling

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- En-tete personnalise : complet montre tous les evenements (samedi+dimanche), vin_honneur montre ceremonie+VH samedi
- RsvpFormItem : nouvelle prop `invitationType`, `isComplet` derived — checkboxes jour masquees pour vin_honneur
- Description checkboxes enrichie : "Ceremonie, Vin d'honneur, Diner & Soiree" au lieu de "Ceremonie & Soiree"
- Vue resume : jours de presence masques pour vin_honneur (Present/Absent seulement)
- Server-side : invitation_type ajoutee au select, logique vin_honneur force present_saturday=true et present_sunday=false
- Group RSVP et RSVP individuel managed fonctionnent sans changement (existant)

### File List

- `src/routes/rsvp/+page.svelte` (MODIFIED)
- `src/routes/rsvp/RsvpFormItem.svelte` (MODIFIED)
- `src/routes/rsvp/+page.server.ts` (MODIFIED)
