# Feature Specification: MVP Core Features

**Feature Branch**: `001-mvp-core-features`
**Created**: 2025-11-23
**Status**: Draft
**Input**: User description: "Génère la spécification fonctionnelle pour le MVP. Concentre-toi sur : 1. Auth Hybride (Google + Whitelist). 2. Accueil perso + RSVP. 3. Upload photos mobile-first. 4. Admin basique. Ignore la V2. Assure-toi que la spec reflète le besoin de confidentialité et le design 'Mobile First'."

## Clarifications

### Session 2025-11-23

- Q: Should we include Magic Link auth in MVP? → A: **Yes (Option B)**. Implement Magic Link alongside Google OAuth immediately to ensure 100% accessibility.
- Q: What are the photo storage limits? → A: **Unrestricted (Option C)**. Allow original quality uploads.
- Q: How to handle RSVP guest counts? → A: **Flexible (Option B)**. User enters any number, but Admin receives a warning flag if it exceeds the "Expected" count.
- Q: Photo visibility policy? → A: **Moderated (Option C)**. Guests see their own uploads immediately. Others' photos are visible in the gallery only after Admin approval.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Guest Authentication (Priority: P1)

As a guest, I want to log in using my Google account OR a secure email link so that I can access the wedding details securely without remembering a new password.

**Why this priority**: Access control is the foundation of the application. Without authentication and whitelist verification, no other features can be securely accessed.

**Independent Test**: Can be tested by attempting login with a whitelisted email via Google AND via Magic Link (success), and a non-whitelisted email (access denied).

**Acceptance Scenarios**:

1. **Given** a guest with an email in the whitelist, **When** they click "Sign in with Google" and authenticate, **Then** they are redirected to the personalized home page.
2. **Given** a guest with an email in the whitelist, **When** they enter their email and click "Send Magic Link", **Then** they receive a login link via email that redirects to the home page.
3. **Given** a user with an email NOT in the whitelist, **When** they authenticate, **Then** they see an access denied message instructing them to contact the hosts.
4. **Given** a guest who is not logged in, **When** they attempt to access any protected route (e.g., `/rsvp`), **Then** they are redirected to the login page.

---

### User Story 2 - Personalized Home & RSVP (Priority: P1)

As a guest, I want to see a welcome message with my name and be able to confirm my attendance so that the hosts can plan accordingly.

**Why this priority**: Collecting RSVPs is a primary business goal of the wedding website.

**Independent Test**: Can be tested by logging in as a guest and submitting the RSVP form, then verifying the data persistence.

**Acceptance Scenarios**:

1. **Given** a logged-in guest, **When** they visit the home page, **Then** they see "Bienvenue [First Name]" (retrieved from Google profile or database).
2. **Given** a logged-in guest on the RSVP page, **When** they select "Present", enter guest counts (adults/children), dietary restrictions, and submit, **Then** the information is saved to the database and a success message is shown.
3. **Given** a guest who has already RSVP'd, **When** they return to the RSVP page, **Then** the form is pre-filled with their previous answers.

---

### User Story 3 - Mobile Photo Upload & Gallery (Priority: P2)

As a guest at the wedding, I want to upload photos and see photos shared by others so that I can participate in the collective memory of the event.

**Why this priority**: Live photo sharing is a key engagement feature for the event day.

**Independent Test**: Can be tested by uploading a photo (visible to self immediately) and verifying it is NOT visible to another user until an Admin approves it.

**Acceptance Scenarios**:

1. **Given** a logged-in guest on the Gallery page, **When** they tap the "Upload" button and select a photo, **Then** the photo is uploaded and appears in their "My Uploads" view immediately.
2. **Given** a photo uploaded by Guest A, **When** Guest B visits the gallery, **Then** they DO NOT see the photo if it is still "Pending".
3. **Given** a pending photo, **When** an Admin approves it via the Dashboard, **Then** it becomes visible to all guests in the main gallery.
4. **Given** a photo upload in progress, **When** the network is slow, **Then** a progress indicator is displayed.

---

### User Story 4 - Basic Administration (Priority: P2)

As a host (Admin), I want to manage the guest list and moderate photos so that I can control access and content.

**Why this priority**: Essential for managing access and ensuring content safety.

**Independent Test**: Can be tested by logging in as an admin, approving a pending photo, and verifying it becomes visible to other users.

**Acceptance Scenarios**:

1. **Given** a logged-in admin user, **When** they visit the Admin Dashboard, **Then** they see a list of all guests and a "Photo Moderation" queue.
2. **Given** a pending photo in the moderation queue, **When** the Admin clicks "Approve", **Then** the photo status changes to "Approved" and it appears in the public gallery.
3. **Given** a logged-in admin, **When** they enter a new email address and name into the "Add Guest" form, **Then** a new record is created in the `guests` table.

---

### Edge Cases

- What happens when a user's Google email doesn't match the whitelist email exactly (case sensitivity)? -> System should handle case-insensitive comparison.
- What happens when a user uploads a non-image file? -> System should reject it client-side and server-side.
- What happens if the database is unreachable during RSVP? -> User should see a friendly error message and be asked to try again.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST authenticate users via Google OAuth OR Magic Link (Email).
- **FR-002**: System MUST verify the authenticated email against the guest whitelist before granting access.
- **FR-003**: System MUST redirect non-whitelisted users to an error page with contact instructions.
- **FR-004**: System MUST persist user sessions securely.
- **FR-005**: System MUST enforce strict data access policies (users see only their own private data).
- **FR-006**: System MUST display a personalized greeting on the home page using the guest's name.
- **FR-007**: System MUST provide an RSVP form capturing: Attendance (Yes/No), Adults Count, Children Count, Dietary Restrictions.
- **FR-008**: System MUST pre-fill the RSVP form with existing data if the guest has already responded.
- **FR-009**: System MUST validate RSVP inputs (e.g., counts cannot be negative) and flag discrepancies between expected and actual counts for Admins.
- **FR-010**: System MUST allow guests to upload photos to a secure gallery.
- **FR-011**: System MUST associate uploaded photos with the uploader's identity.
- **FR-012**: System MUST support image file formats.
- **FR-013**: System MUST store uploaded images in their original quality (no server-side compression).
- **FR-014**: System MUST display a gallery of "Approved" photos to all guests.
- **FR-015**: System MUST display "Pending" photos ONLY to the guest who uploaded them.
- **FR-016**: System MUST provide an Admin Dashboard accessible only to users with administrative privileges.
- **FR-017**: Admin Dashboard MUST allow adding new guest emails to the whitelist.
- **FR-018**: Admin Dashboard MUST display a list of guests with their RSVP status.
- **FR-019**: Admin Dashboard MUST provide a moderation interface to Approve or Reject pending photos.

### Key Entities

- **Guest**: Represents an invited person. Attributes: `email`, `full_name`, `rsvp_status`, `adults_count`, `children_count`, `dietary_restrictions`, `role`.
- **Photo**: Represents an uploaded image. Attributes: `url`, `owner_id`, `status`, `created_at`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of non-whitelisted login attempts are blocked by the system.
- **SC-002**: Mobile page load time (LCP) is under 2.5 seconds on 4G networks.
- **SC-003**: RSVP form submission takes less than 1 minute for an average user.
- **SC-004**: Photo upload works successfully on both iOS (Safari) and Android (Chrome) mobile browsers.
- **SC-005**: 100% of guest data access is protected by authorization policies (verified by tests).
- **SC-006**: Admin moderation actions (Approve/Reject) are reflected in the public gallery within 5 seconds.
