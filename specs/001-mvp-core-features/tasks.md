# Tasks: MVP Core Features

**Feature Branch**: `001-mvp-core-features`
**Status**: Completed

## Phase 1: Setup (Project Initialization)

- [x] T001 Initialize SvelteKit project with TypeScript `npm create svelte@latest`
- [x] T002 Install dependencies: `npm install @supabase/supabase-js @supabase/ssr tailwindcss postcss autoprefixer bits-ui clsx tailwind-merge lucide-svelte zod`
- [x] T003 Configure Tailwind CSS with "Été Naturel & Chic" palette in `tailwind.config.js`
- [x] T004 Initialize Shadcn-Svelte and add base components (Button, Input, Card, Toast) in `src/lib/components/ui`
- [x] T005 Configure Supabase client in `src/lib/supabase.ts` and environment variables in `.env`
- [x] T006 Create database schema (tables `guests`, `photos`) and RLS policies in Supabase SQL Editor (refer to `data-model.md`)
- [x] T007 Create Storage bucket `photos` with policies in Supabase (refer to `data-model.md`)

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T008 Implement `hooks.server.ts` to handle session validation and whitelist check
- [x] T009 Create `src/routes/+layout.svelte` with responsive navigation (Mobile First)
- [x] T010 Create `src/routes/access-denied/+page.svelte` for non-whitelisted users
- [x] T011 Create `src/lib/utils.ts` with `cn` helper for Tailwind classes

## Phase 3: User Story 1 - Guest Authentication (P1)

**Goal**: Guests can log in via Google or Magic Link and are verified against the whitelist.

- [x] T012 [US1] Create Login page UI in `src/routes/login/+page.svelte`
- [x] T013 [US1] Implement Google OAuth sign-in logic in `src/routes/login/+page.server.ts`
- [x] T014 [US1] Implement Magic Link sign-in logic in `src/routes/login/+page.server.ts`
- [x] T015 [US1] Implement Auth callback route in `src/routes/auth/callback/+server.ts` with whitelist verification hook
- [x] T016 [US1] Add "Sign Out" action in `src/routes/logout/+server.ts`

## Phase 4: User Story 2 - Personalized Home & RSVP (P1)

**Goal**: Guests see a welcome message and can RSVP.

- [x] T017 [US2] Create Home page `src/routes/+page.svelte` displaying guest name from `locals.session`
- [x] T018 [US2] Create RSVP page layout in `src/routes/rsvp/+page.svelte`
- [x] T019 [US2] Implement `load` function in `src/routes/rsvp/+page.server.ts` to fetch existing RSVP data
- [x] T020 [US2] Implement RSVP form with Zod validation (Adults, Children, Diet) in `src/routes/rsvp/rsvp-form.svelte`
- [x] T021 [US2] Implement `update` form action in `src/routes/rsvp/+page.server.ts` to save data to `guests` table
- [x] T022 [US2] Add Toast notification for successful RSVP submission

## Phase 5: User Story 3 - Mobile Photo Upload & Gallery (P2)

**Goal**: Guests can upload photos and view their own/approved photos.

- [x] T023 [US3] Create Gallery page layout in `src/routes/gallery/+page.svelte`
- [x] T024 [US3] Implement `load` function in `src/routes/gallery/+page.server.ts` to fetch photos (Own + Approved)
- [x] T025 [US3] Create Photo Upload component `src/routes/gallery/upload-button.svelte` (Mobile optimized)
- [x] T026 [US3] Implement `upload` form action in `src/routes/gallery/+page.server.ts` (Upload to Storage + Insert to DB)
- [x] T027 [US3] Create Photo Grid component `src/routes/gallery/photo-grid.svelte` to display images
- [x] T028 [US3] Add progress indicator for uploads

## Phase 6: User Story 4 - Basic Administration (P2)

**Goal**: Admins can manage guests and moderate photos.

- [x] T029 [US4] Create Admin layout `src/routes/admin/+layout.svelte` with role protection check
- [x] T030 [US4] Create Guest List view `src/routes/admin/guests/+page.svelte`
- [x] T031 [US4] Implement `add` form action in `src/routes/admin/guests/+page.server.ts` to add emails to whitelist
- [x] T032 [US4] Create Photo Moderation view `src/routes/admin/photos/+page.svelte` (List pending photos)
- [x] T033 [US4] Implement `moderate` form action in `src/routes/admin/photos/+page.server.ts` (Approve/Reject)

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T034 Verify mobile responsiveness on all pages (Login, Home, RSVP, Gallery, Admin)
- [x] T035 Test error handling (Database offline, Network errors)
- [x] T036 Audit RLS policies by attempting unauthorized access via Supabase client
- [x] T037 Run Lighthouse performance audit (Target > 90 on Mobile)

## Dependencies

- **Phase 1 & 2** must be completed before any User Story.
- **Phase 3 (Auth)** is a prerequisite for Phase 4, 5, and 6.
- **Phase 4, 5, 6** can be executed in parallel after Phase 3.

## Implementation Strategy

1. **Setup & Foundation**: Get the skeleton running and connected to Supabase.
2. **Auth Loop**: Ensure we can log in and out, and that the whitelist works.
3. **Core Features**: Build RSVP and Gallery.
4. **Admin**: Build the tools to manage the event.
