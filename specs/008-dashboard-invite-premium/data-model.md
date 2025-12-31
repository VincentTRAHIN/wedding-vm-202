# Data Model: Dashboard Invité Premium

## Entities

### 1) guests (existing)

**Key fields (relevant):**

- `id` (uuid)
- `auth_id` (text/uuid): Supabase Auth user id
- `full_name` (text)
- `room_id` (uuid, nullable) → FK to `rooms.id`
- `check_in_date` (date, nullable)
- `check_out_date` (date, nullable)
- `room_notes` (text, nullable)

**Relationships:**

- `guests.room_id` → `rooms.id` (many guests → one room)

**Validation / rules:**

- `room_id` can be null.
- If `room_id` is set, `check_in_date` / `check_out_date` are optional but recommended.

### 2) rooms (existing; needs schema delta)

**Current fields in repo:** name/capacity/description/etc.

**Required by feature:**

- `id` (uuid)
- `name` (text)
- `capacity` (int)
- `access_code` (text, nullable) — NEW
- `description` (text, nullable)

**Relationships:**

- `rooms.id` referenced by `guests.room_id`

**Validation / rules:**

- `name` required and unique.
- `capacity` must be >= 1.

### 3) song_requests (new)

**Fields:**

- `id` (uuid, PK)
- `created_at` (timestamptz)
- `track_name` (text)
- `artist` (text)
- `requested_by` (uuid/text) — auth uid

**Relationships:**

- Logical link `song_requests.requested_by` → `auth.users.id`.
- Optional enrichment for UI: join to `guests` by `guests.auth_id = requested_by` (to display who requested).

**Validation / rules:**

- `track_name` required, min length 1.
- `artist` optional (but recommended).
- `requested_by` must equal `auth.uid()` for insert.

### 4) site_content (existing)

Used as admin-editable JSON for “Contacts & SOS” and “Brunch”.

**Keys introduced:**

- `contacts_sos` (JSON)
- `taxis` (JSON)
- `brunch_info` (JSON)
- (optional) `dress_code` (JSON/string)

**Validation / rules:**

- Content must be valid JSON.
- UI should tolerate missing keys (graceful empty state).

## RLS Summary (must be enforced in Supabase)

- `rooms`: SELECT for authenticated; admin-only inserts/updates/deletes.
- `song_requests`: SELECT for authenticated; INSERT for authenticated where `requested_by = auth.uid()`; UPDATE/DELETE admin-only (or disallowed).
- `site_content`: SELECT for authenticated; admin-only writes.
