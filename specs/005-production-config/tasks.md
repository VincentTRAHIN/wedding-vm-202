# Tasks: Production Configuration

## Phase 1: Adapter & Server Config

- [x] 1.1 Verify `svelte.config.js` uses `@sveltekit/adapter-node`. <!-- id: 1.1 -->
- [x] 1.2 Verify/Create `src/hooks.server.ts` for Origin/CSRF handling. <!-- id: 1.2 -->

## Phase 2: Security & Environment

- [x] 2.1 Audit environment variable usage (Private vs Public). <!-- id: 2.1 -->
- [x] 2.2 Ensure sensitive keys are not leaked to client. <!-- id: 2.2 -->

## Phase 3: Monitoring

- [x] 3.1 Create `src/routes/health/+server.ts` endpoint. <!-- id: 3.1 -->
