# Plan Quality Checklist: MVP Core Features

**Purpose**: Self-verification of technical plan quality before implementation
**Created**: 2025-11-23
**Feature**: [Link to plan.md](../plan.md)

## Security & Data Integrity

- [ ] Are RLS policies explicitly defined for ALL tables (`guests`, `photos`)? [Data Model]
- [ ] Is the whitelist verification logic defined in the auth callback/hook? [Contracts]
- [ ] Are Supabase Storage bucket policies defined (Public: false, Insert: Auth only)? [Data Model]
- [ ] Are environment variables for Supabase keys (Anon, Service Role) listed? [Quickstart]
- [ ] Is the Google OAuth provider configuration mentioned? [Quickstart]
- [ ] Is the "Magic Link" fallback flow defined securely? [Contracts]

## Mobile UX & Accessibility

- [ ] Is the design explicitly "Mobile First" (min touch targets 44px)? [Research]
- [ ] Are form inputs defined with mobile-friendly types (e.g., `type="number"` for counts)? [Contracts]
- [ ] Is the RSVP form layout optimized for small screens (vertical stacking)? [Research]
- [ ] Are loading states (toasts/progress) defined for slow networks (3G)? [Research]
- [ ] Is the photo upload flow defined for mobile file selection? [Contracts]

## SvelteKit Architecture

- [ ] Are all data mutations defined as Form Actions (`?/action`)? [Contracts]
- [ ] Is data fetching defined via `load` functions (`+page.server.ts`)? [Research]
- [ ] Is the directory structure consistent with SvelteKit routing (routes/)? [Plan]
- [ ] Are server-side validation libraries (Zod) specified? [Plan]
- [ ] Is the use of `hooks.server.ts` for auth protection defined? [Research]

## Completeness & Consistency

- [ ] Do the API contracts match the functional requirements in `spec.md`?
- [ ] Are all database columns in `data-model.md` mapped to form inputs in `contracts/api.md`?
- [ ] Is the "Admin" role logic consistent across RLS and UI access?
- [ ] Are the "Summer Natural & Chic" design tokens (colors/fonts) defined? [Research]
