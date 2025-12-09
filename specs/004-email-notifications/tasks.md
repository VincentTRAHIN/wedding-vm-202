# Tasks: Email Notifications

## Phase 1: Setup & Configuration

- [x] 1.1 Install `resend` and `svelte-email` packages. <!-- id: 1.1 -->
- [x] 1.2 Configure environment variables (`RESEND_API_KEY`, `ADMIN_EMAILS`, `SENDER_EMAIL`). <!-- id: 1.2 -->
- [x] 1.3 Create `src/lib/server/email.ts` for Resend client initialization. <!-- id: 1.3 -->

## Phase 2: Email Templates

- [x] 2.1 Create `src/lib/emails/RsvpConfirmation.svelte` (Main Guest Receipt). <!-- id: 2.1 -->
- [x] 2.2 Create `src/lib/emails/GuestInvitation.svelte` (Secondary Guest Invite). <!-- id: 2.2 -->
- [x] 2.3 Create `src/lib/emails/AdminNewRsvp.svelte` (Admin Alert). <!-- id: 2.3 -->

## Phase 3: Integration

- [x] 3.1 Update `src/routes/rsvp/+page.server.ts` to trigger emails on successful update. <!-- id: 3.1 -->
- [x] 3.2 Implement logic to send Confirmation email to main guest. <!-- id: 3.2 -->
- [x] 3.3 Implement logic to send Invitation emails to new secondary guests. <!-- id: 3.3 -->
- [x] 3.4 Implement logic to send Alert email to admins. <!-- id: 3.4 -->
- [x] 3.5 Ensure error handling is robust (non-blocking). <!-- id: 3.5 -->
