# Plan: Production Configuration (Coolify/Node.js)

## Objectif
Finaliser la configuration du projet pour le déploiement en production sur un VPS Coolify avec Node.js.

## Architecture
- **Adapter**: `@sveltekit/adapter-node`
- **Environment**: Node.js (Coolify)
- **Security**: CSRF protection via `ORIGIN` env var.
- **Healthcheck**: `/health` endpoint for uptime monitoring.

## Files to Modify/Create
- `svelte.config.js`: Verify adapter.
- `src/hooks.server.ts`: Verify CSRF/Origin handling.
- `src/routes/health/+server.ts`: Create healthcheck endpoint.
- `src/lib/server/email.ts` (and others): Verify env var usage.
