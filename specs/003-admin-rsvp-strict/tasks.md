# Tasks: Admin Back-Office & Strict RSVP

## Phase 1: Setup & UI Components

- [ ] 1.1 Install Shadcn Combobox/Command dependencies if missing. <!-- id: 1.1 -->
- [ ] 1.2 Create `GuestSelector.svelte` component using Shadcn Combobox. <!-- id: 1.2 -->

## Phase 2: Self-Claiming Workflow

- [ ] 2.1 Create `/claim-profile` route (page + server). <!-- id: 2.1 -->
- [ ] 2.2 Implement `load` function to fetch unclaimed guests. <!-- id: 2.2 -->
- [ ] 2.3 Implement `claim` action to link auth_id. <!-- id: 2.3 -->
- [ ] 2.4 Add redirection logic in `hooks.server.ts` or `+layout.server.ts` to force claiming if unlinked. <!-- id: 2.4 -->

## Phase 3: Group RSVP

- [x] 3.1 Update `/rsvp` load function to fetch managed guests and eligible guests for addition. <!-- id: 3.1 -->
- [x] 3.2 Add "Manage other guests" section to `/rsvp` UI using `GuestSelector`. <!-- id: 3.2 -->
- [x] 3.3 Implement `addManagedGuest` action. <!-- id: 3.3 -->
- [x] 3.4 Ensure managed guests appear in the RSVP form for status updates. <!-- id: 3.4 -->

## Phase 4: Admin Dashboard

- [ ] 4.1 Update `/admin/guests` to show comprehensive table (RSVP, Managed By, etc.). <!-- id: 4.1 -->
- [ ] 4.2 Create "Add Guest" Dialog/Modal. <!-- id: 4.2 -->
- [ ] 4.3 Implement `createGuest` action. <!-- id: 4.3 -->
