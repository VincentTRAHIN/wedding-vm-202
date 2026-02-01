# Story 2.2: Conservation RSVP au changement de type d'invitation

Status: review

## Story

As a systeme,
I want to preserve existing RSVP data when the admin changes a guest's invitation type,
so that no guest responses are lost during type changes.

## Acceptance Criteria

1. **Given** un invite vin d'honneur a deja repondu "Present" a la ceremonie et au vin d'honneur
   **When** l'admin change son type de "vin_honneur" a "complet"
   **Then** la reponse existante (Present ceremonie + VH) est conservee
   **And** les nouvelles options (diner, brunch) apparaissent dans le formulaire RSVP sans reponse pre-remplie
   **And** l'invite peut completer son RSVP avec les nouvelles options

2. **Given** un invite complet a repondu pour samedi et dimanche
   **When** l'admin change son type de "complet" a "vin_honneur"
   **Then** la reponse pour la ceremonie et le vin d'honneur est conservee
   **And** les reponses pour le diner et le brunch ne sont plus affichees dans le formulaire
   **And** `make qa` passe sans erreur

## Tasks / Subtasks

- [x] Task 1 : Verifier la conservation des donnees RSVP (AC: #1, #2)
  - [x] 1.1 L'action admin `edit` ne touche que `invitation_type` — les champs RSVP sont preserves par defaut
  - [x] 1.2 L'action admin `bulkUpdateType` ne modifie que `invitation_type` — meme comportement
  - [x] 1.3 Aucun code supplementaire n'est necessaire : l'architecture existante conserve les RSVP

- [x] Task 2 : Verifier le comportement du formulaire RSVP apres changement (AC: #1, #2)
  - [x] 2.1 VH→Complet : present_saturday=true (conserve), present_sunday=false → le formulaire affiche les 2 checkboxes avec samedi coche et dimanche decoche
  - [x] 2.2 Complet→VH : les checkboxes jour sont masquees (Story 2.1), le server force present_saturday=true/present_sunday=false au prochain submit

- [x] Task 3 : Validation (AC: #2)
  - [x] 3.1 `make qa` — aucune modification de code, pas de regression

## Change Log

- 2026-02-01: Story 2.2 validee — conservation RSVP assuree par l'architecture existante (no code changes needed)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Aucune modification de code necessaire pour cette story
- L'architecture existante preserve deja les donnees RSVP lors du changement de type :
  - L'action admin `edit` ne met a jour que `invitation_type`, pas les champs RSVP
  - L'action admin `bulkUpdateType` ne modifie que `invitation_type`
  - Les donnees `rsvp_status`, `present_saturday`, `present_sunday`, `dietary_restrictions` restent intactes
- Le formulaire RSVP adaptatif (Story 2.1) gere l'affichage conditionnel correctement
- Le server-side (Story 2.1) force les bonnes valeurs pour vin_honneur au prochain submit

### File List

- Aucun fichier modifie (story de validation architecturale)
