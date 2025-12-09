# Plan: Global Password Wall

## Goal
Secure the entire website (Front and Back) behind a global password wall to prevent public access and indexing.

## Architecture
- **Middleware**: `src/hooks.server.ts` will intercept all requests.
- **Unlock Page**: `/routes/unlock` to enter the password.
- **Cookie**: `wedding_pass` cookie to store authentication status.
- **SEO**: `noindex` meta tag globally.

## Tech Stack
- SvelteKit (Server Hooks, Actions, Cookies)
- TailwindCSS (UI)

## File Structure
- `src/routes/unlock/+page.svelte`
- `src/routes/unlock/+page.server.ts`
- `src/hooks.server.ts` (modify)
- `src/app.html` (modify)
