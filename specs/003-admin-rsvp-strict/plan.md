# Plan: Admin Back-Office & Strict RSVP

## Goal

Implement a strict RSVP flow where users must select from a pre-existing list of guests, and an Admin Back-Office for manual management.

## Tech Stack

- **Frontend**: SvelteKit, Tailwind CSS
- **UI Library**: Shadcn UI (specifically Combobox/Command)
- **Backend**: Supabase (PostgreSQL, Auth, RLS)

## Architecture

### Database Changes

- Ensure `guests` table has `managed_by_id` (UUID, FK to guests.id or auth.users? - likely `guests.id` or just linked via `auth_id` ownership).
- Actually, `managed_by_id` usually points to the `guests.id` of the "head of household" or the `auth_id` of the user managing them. The prompt says "managed_by_id = ID de l'utilisateur connecté". So `auth_id`.

### Components

- `GuestSelector.svelte`: A reusable Combobox component to search and select guests.
  - Props: `guests` (list), `onSelect` (callback), `excludeIds` (optional).
  - Behavior: Filter by name, show "Aucun invité trouvé" if no match.

### Pages & Flows

1.  **Self-Claiming (`/claim-profile`)**
    - Accessible only if logged in but `guests.auth_id` is NULL.
    - Uses `GuestSelector` to find self.
    - Action: `claimProfile` -> updates `guests.auth_id`.

2.  **RSVP Page (`/rsvp`)**
    - Existing RSVP form for self.
    - New section: "Gérer d'autres invités".
    - Uses `GuestSelector` to find family members (criteria: `rsvp_status != 'present'` AND `auth_id IS NULL` AND `managed_by_id IS NULL`).
    - Action: `addManagedGuest` -> updates `guests.managed_by_id`.

3.  **Admin Guests (`/admin/guests`)**
    - Table of all guests.
    - Columns: Name, Email, RSVP Status, Adult/Child, Managed By.
    - Action: "Add Guest" (Modal).
    - Action: Edit/Delete (optional but good).

## Security (RLS)

- `guests` table:
  - Read: Public (or authenticated) to allow searching names? Or restricted to `claim-profile` logic?
  - Update:
    - Self-claim: User can update `auth_id` if it's currently NULL (needs careful RLS or a server-side action bypassing RLS).
    - Group RSVP: User can update `managed_by_id` if NULL.
    - Admin: Full access.

**Note**: Since we are using SvelteKit Actions, we can use `SERVICE_ROLE_KEY` or `supabaseAdmin` client in `+page.server.ts` to bypass RLS for these specific "claiming" operations, which is safer than opening up RLS too much.
