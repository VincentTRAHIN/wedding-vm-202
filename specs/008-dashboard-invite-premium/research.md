# Research: Dashboard Invité Premium (/dashboard)

## Decisions

### 1) Source of truth for venue coordinates/address

**Decision:** Keep venue coordinates/address as server-side constants (in the dashboard server load) for now.

**Rationale:**

- Minimizes complexity and avoids needing admin UX for rarely-changing data.
- Keeps SSR-first behavior and avoids runtime JSON parsing failure scenarios.

**Alternatives considered:**

- Store in `site_content` as JSON (admin-editable), but increases risk of malformed JSON breaking the dashboard unless validated + robust fallbacks.

### 2) Editable content (Contacts, Taxis, Brunch, Dress code)

**Decision:** Store these as JSON blobs in `site_content` (admin-editable).

**Rationale:**

- Matches the existing pattern for `local_guide`.
- Allows updating phone numbers / brunch details without redeploy.

**Alternatives considered:**

- Dedicated tables for each content type; more schema + RLS + admin CRUD for low-entropy content.

### 3) Weather provider and availability window

**Decision:** Use Open-Meteo daily forecast; only display actual forecast when the wedding date is within Open-Meteo’s forecast horizon.

**Rationale:**

- Open-Meteo forecasts are limited (typically up to ~16 days). The wedding is far in the future most of the year.
- UX stays clean: show “Prévision disponible à J-3” until it becomes meaningful.

**Alternatives considered:**

- Always calling Open-Meteo and showing near-term weather (not tied to wedding), but requirement is “à J-3 sur le lieu”.

### 4) DJ collaborative data model

**Decision:** Create a `song_requests` table.

**Rationale:**

- Persistent audit trail, easy moderation later.
- Simple SSR query for last 3 requests.

**Alternatives considered:**

- Store in `site_content` (JSON array). Rejected because concurrent edits are messy and require optimistic locking.

### 5) Rooms schema delta

**Decision:** Keep the existing `rooms` table and add `access_code` (and any missing columns) via migrations.

**Rationale:**

- The project already implemented `rooms(name, capacity, description, ...)`.
- Adding a column is minimal and safe.

**Alternatives considered:**

- Recreate / rename tables. Rejected due to migration risk.
