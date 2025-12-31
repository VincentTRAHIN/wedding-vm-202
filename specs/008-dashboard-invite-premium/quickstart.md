# Quickstart: Dashboard Invité Premium

## Prerequisites

- Node.js 20+
- Supabase project configured (env vars in `.env` or hosting env)

## Local dev

1) Install deps

```bash
npm install
```

1) Run dev server

```bash
npm run dev
```

1) Open app

- `http://localhost:5173`
- Login, then go to `/dashboard`

## Database changes (planned)

This feature introduces / updates the following schema:

- Add `rooms.access_code` (migration)
- Create `song_requests` table + RLS policies
- Add new `site_content` keys (`contacts_sos`, `taxis`, `brunch_info`)

Apply migrations using your current workflow (Supabase CLI / SQL migrations folder).

## Admin setup

- Use `/admin/content` to edit JSON for contacts/taxis/brunch once the keys exist.
- Use `/admin/guests` to assign a room to an invited guest.

## Notes

- Weather uses Open-Meteo (no API key). Forecast is only meaningful close to the wedding date; UI should display a “Disponible à J-3” placeholder until then.
