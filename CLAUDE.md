# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wedding website for Vincent & Melanie built with SvelteKit 2 + Svelte 5, Supabase (auth + PostgreSQL + storage), and deployed as a Node.js server. The app handles guest RSVP management, photo gallery, admin panel, and email notifications via Resend.

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build (adapter-node → build/)
npm run start        # Run production build (node build)
npm run preview      # Preview production build
npm run check        # TypeScript + Svelte type checking
npm run lint         # ESLint
npm run format       # Prettier
make qa              # Lint + type check combined
make types           # Regenerate Supabase types from remote schema
make clean           # Remove .svelte-kit and build directories
```

## Architecture

### Tech Stack
- **Frontend**: Svelte 5 + SvelteKit 2, Tailwind CSS 3, Bits UI, Lucide icons
- **Backend**: SvelteKit server routes, Zod validation, Resend emails
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Auth**: Supabase Auth (Google OAuth + email/password), cookie-based sessions

### Key Architectural Patterns

**Authentication flow** (`src/hooks.server.ts`): Three sequenced handles — `supabase` (creates server client + `safeGetSession`), `authGuard` (protects routes), `securityHeaders` (CSP etc. in production). Public routes are explicitly allowlisted. Admin routes check `guests.role === 'admin'` via DB query.

**`event.locals`** exposes `supabase`, `safeGetSession()`, `session`, and `user` (typed in `src/app.d.ts`). Always use `safeGetSession()` which validates JWT via `getUser()`, never raw `getSession()`.

**Service role client**: Server-side code uses `SERVICE_ROLE_KEY` for admin operations (user registration, RSVP updates that bypass RLS). Separate from the user's session-scoped client.

**Managed guests pattern**: A guest can manage family members via `managed_by_id`. Group RSVP updates all managed guests at once. The `claim-profile` flow links a new auth user to their guest record.

**Form actions**: Routes use SvelteKit form actions (`+page.server.ts`) with Zod validation from `$lib/server/validation.ts`. Actions return `{ success, error }` objects.

**Email templates**: Svelte components in `src/lib/emails/` rendered via `svelte-email`, sent through Resend. Three templates: RSVP confirmation, guest invitation, admin alert.

### Source Layout

- `src/hooks.server.ts` — Global middleware (auth, security headers)
- `src/routes/` — File-based routing; each route has `+page.svelte` and optionally `+page.server.ts` for server load/actions
- `src/lib/server/` — Server-only code: `validation.ts` (Zod schemas, rate limiting, sanitization), `email.ts` (Resend), `supabase.ts` (service role client)
- `src/lib/components/ui/` — Reusable UI components (Bits UI based)
- `src/lib/emails/` — Svelte email templates
- `src/lib/types/supabase.ts` — Auto-generated DB types (regenerate with `make types`)
- `supabase/` — `schema.sql`, `init.sql`, and `migrations/` directory

### Route Protection

- **Public**: `/`, `/login`, `/register`, `/auth/callback`, `/logout`, `/forgot-password`, `/health`, `/legal`
- **Authenticated**: Everything else (redirects to `/login`)
- **Admin-only**: `/admin/*` (checks `guests.role` in DB)

### Database

PostgreSQL via Supabase with RLS policies. Two main tables: `guests` (profiles, RSVP data, roles) and `photos` (gallery with approval workflow). Types are auto-generated — run `make types` after schema changes.

### Styling

Tailwind with custom theme (Sage/Stone colors + Bordeaux variant). HSL-based CSS variables in `src/app.css`. Dark mode via class strategy. Fonts: Inter (sans) and Playfair Display (serif).

## Environment Variables

**Public** (prefixed `PUBLIC_`): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`

**Private**: `SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `SENDER_EMAIL`, `ADMIN_EMAILS`, `CRON_SECRET`, `ORIGIN`, `NODE_ENV`

See `.env.example` for the full template.
