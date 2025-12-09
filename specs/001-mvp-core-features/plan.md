# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementation of the MVP core features for the wedding website, focusing on a secure, mobile-first experience. Key components include Hybrid Authentication (Google + Magic Link) with strict whitelist enforcement, a personalized Guest Home page, a comprehensive RSVP system, and a Photo Gallery with upload capabilities and moderation. The stack is SvelteKit + Supabase + Tailwind.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+
**Primary Dependencies**: SvelteKit 2.x, Supabase JS Client, Tailwind CSS, Shadcn-Svelte, Zod.
**Storage**: Supabase (PostgreSQL for data, Storage for photos).
**Testing**: Vitest (Unit), Playwright (E2E).
**Target Platform**: Vercel (Edge/Serverless).
**Project Type**: Web Application (PWA-ready).
**Performance Goals**: Mobile LCP < 2.5s, TTI < 3.5s.
**Constraints**: Strict RLS, Mobile First Design, Whitelist Auth.
**Scale/Scope**: ~150 guests, ~500 photos.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Stack Technique Strict**: SvelteKit, Supabase, Tailwind, Shadcn. (Pass)
- **II. Architecture Serveur**: Form Actions used for RSVP/Upload. (Pass)
- **III. Typage Strict**: TypeScript enforced. (Pass)
- **IV. Style & UX**: Mobile First design tokens defined. (Pass)
- **V. Sécurité & Données**: RLS policies defined in `data-model.md`. (Pass)
- **VI. Conventions & Documentation**: Specs and docs structure followed. (Pass)
- **VII. Performance**: SSR utilized, image optimization planned (client-side resize if possible, else server). (Pass)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
