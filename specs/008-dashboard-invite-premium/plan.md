
# Implementation Plan: Dashboard Invité Premium (/dashboard)

**Branch**: `008-dashboard-invite-premium` | **Date**: 2025-12-30 | **Spec**: `specs/008-dashboard-invite-premium/spec.md`
**Input**: Feature specification from `specs/008-dashboard-invite-premium/spec.md`

## Summary

Enrichir la page existante `/dashboard` avec 5 sections “Premium” (Logistique & GPS, Hébergement, Ambiance & Participation, Contacts & SOS, Lendemain & Brunch) en respectant:

- SSR-first (JS minimal)
- Mutations via SvelteKit Form Actions
- Typage strict basé sur types Supabase
- Données éditables via `site_content` quand pertinent

Livrables docs déjà produits par ce plan:

- `specs/008-dashboard-invite-premium/research.md`
- `specs/008-dashboard-invite-premium/data-model.md`
- `specs/008-dashboard-invite-premium/quickstart.md`
- `specs/008-dashboard-invite-premium/contracts/openapi.yaml`

## Technical Context

**Language/Version**: TypeScript (SvelteKit), Node `>=20` (see `package.json`)  
**Primary Dependencies**: SvelteKit, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Tailwind CSS, Shadcn-Svelte (bits-ui), lucide-svelte  
**Storage**: Supabase Postgres (RLS obligatoire) + `site_content` (JSONB)  
**Testing/Checks**: `npm run lint`, `npm run check`, `npm run build`  
**Target Platform**: Node SSR (adapter-node présent), déploiement VPS/Coolify  
**Project Type**: Web application (SvelteKit monorepo single app)

**Performance Goals**:

- Dashboard mobile rapide (SSR), pas de fetch client inutile.

**Constraints**:

- Pas de nouveaux écrans non demandés.
- Pas de `any`; updates du type Supabase si nouvelles tables/colonnes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I. Stack: OK (SvelteKit + Supabase + Tailwind + Shadcn-Svelte).
- II. Form Actions: OK (création `song_requests` via Form Actions; pas d’API fetch côté client).
- III. Typage strict: OK (types Supabase; zod si validation input).
- IV. Mobile first / Tailwind + `cn()`: OK (cards Shadcn; classes via `cn()` si besoin).
- V. RLS obligatoire: OK (policies SELECT/INSERT pour `song_requests`; rooms/site_content restent sous règles existantes).
- VI. Documentation source de vérité: OK (mise à jour `docs/PRODUCTION_ROADMAP.md`).
- VII. Performance: OK (SSR; météo fetch serveur uniquement; limiter payload).

## Project Structure

### Documentation (this feature)

```text
specs/008-dashboard-invite-premium/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md  # Created by /speckit.tasks (not part of this run)
```

### Source Code (repository root)

```text
src/
├── routes/
│   └── dashboard/
│       ├── +page.server.ts
│       ├── +page.svelte
│       └── components/
│           ├── RecapCard.svelte
│           ├── RoomCard.svelte
│           ├── LocalGuideSection.svelte
│           └── (new premium components)
├── lib/
│   ├── server/   # server helpers
│   └── types/    # supabase Database typing

supabase/
└── migrations/
```

**Structure Decision**: SvelteKit monolith (routes SSR + Form Actions + Supabase Postgres).

## Phase 0: Outline & Research

Référence: `specs/008-dashboard-invite-premium/research.md`.

Décisions clés (résumé):

- Coordonnées/adresse du lieu: constantes côté serveur.
- Contacts/Taxis/Brunch: `site_content` (admin éditable).
- Météo: Open-Meteo, affichage seulement quand la date est dans l’horizon.
- DJ: table `song_requests` + RLS.

## Phase 1: Design & Contracts

### Data Model

Référence: `specs/008-dashboard-invite-premium/data-model.md`.

- `rooms`: ajouter `access_code`.
- `song_requests`: nouvelle table.
- `site_content`: nouvelles clés (`contacts_sos`, `taxis`, `brunch_info`, optionnel `dress_code`).

### Contracts

Référence: `specs/008-dashboard-invite-premium/contracts/openapi.yaml`.

Note: le code implémentera les mutations via Form Actions (constitution). L’OpenAPI sert surtout de documentation fonctionnelle.

### Quickstart

Référence: `specs/008-dashboard-invite-premium/quickstart.md`.

## Phase 2: Implementation Planning (no code changes in this phase)

### Docs

- Mettre à jour `docs/PRODUCTION_ROADMAP.md` avec les 5 sections et aligner la route `/dashboard`.

### Database

- Migration: `rooms.access_code`.
- Migration: `song_requests` + policies RLS:
  - SELECT pour `authenticated`
  - INSERT pour `authenticated` avec `requested_by = auth.uid()`
- Seed `site_content`:
  - `contacts_sos`
  - `taxis`
  - `brunch_info`

### Types

- Mettre à jour `src/lib/types/supabase.ts` pour inclure:
  - Colonne `rooms.access_code`
  - Table `song_requests`

### Dashboard SSR + UI

- `+page.server.ts`:
  - Charger `guest` + `room` (si assignée)
  - Charger `site_content` nécessaire (contacts/taxis/brunch)
  - Charger `song_requests` (3 dernières)
  - Fetch météo Open-Meteo côté serveur si date dans l’horizon

- `+page.svelte`:
  - Ajouter composants “Premium” en gardant layout mobile-first en colonne

### Form Actions

- Action `createSongRequest`:
  - Validation input (zod)
  - Insert en DB
  - Re-render SSR (pas de fetch client manuel)

### Verification

- `npm run lint`
- `npm run check`
- `npm run build`
