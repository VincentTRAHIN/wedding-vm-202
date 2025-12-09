# Plan: Email Notifications

## Objectif

Implémenter le système d'envoi d'emails transactionnels (Invitations, Confirmations, Alertes Admin).

## Stack

- **SDK**: `resend`
- **Templating**: `svelte-email`
- **Styling**: Tailwind CSS (Vert Sauge #5E7E66, Fond Crème #FAF9F6, Police Serif)

## Architecture

### 1. Configuration

- Packages: `resend`, `svelte-email`
- Env Vars: `RESEND_API_KEY`, `ADMIN_EMAILS`, `SENDER_EMAIL`

### 2. Templates (`src/lib/emails/`)

- `RsvpConfirmation.svelte`: Reçu pour l'invité principal.
- `GuestInvitation.svelte`: Notification pour les accompagnants (parrainage).
- `AdminNewRsvp.svelte`: Alerte pour les mariés.

### 3. Logique d'Envoi (`src/routes/rsvp/+page.server.ts`)

- Intégration dans l'action `update` (ou `saveRsvp`).
- Envoi asynchrone (ne doit pas bloquer la réponse).
- Gestion d'erreurs silencieuse (log only).

## Flux de Données

1.  User submits RSVP.
2.  Server updates DB.
3.  Server triggers Email Service.
4.  Email Service renders templates.
5.  Email Service sends via Resend API.
