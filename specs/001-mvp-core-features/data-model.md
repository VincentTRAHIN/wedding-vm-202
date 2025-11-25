# Data Model

## Tables

### `guests`

| Column                 | Type          | Default             | Description                          |
| ---------------------- | ------------- | ------------------- | ------------------------------------ |
| `id`                   | `uuid`        | `gen_random_uuid()` | Primary Key                          |
| `created_at`           | `timestamptz` | `now()`             | Creation timestamp                   |
| `email`                | `text`        | -                   | Unique, Whitelist Key                |
| `full_name`            | `text`        | -                   | Guest Name                           |
| `avatar_url`           | `text`        | -                   | From Google                          |
| `role`                 | `text`        | `'guest'`           | `'admin'` or `'guest'`               |
| `auth_id`              | `uuid`        | `null`              | FK to `auth.users.id`                |
| `rsvp_status`          | `text`        | `'pending'`         | `'present'`, `'absent'`, `'pending'` |
| `adults_count`         | `int`         | `1`                 | Number of adults                     |
| `children_count`       | `int`         | `0`                 | Number of children                   |
| `dietary_restrictions` | `text`        | `null`              | Allergies etc.                       |
| `expected_count`       | `int`         | `1`                 | Max allowed guests (for warning)     |

### `photos`

| Column         | Type          | Default             | Description                             |
| -------------- | ------------- | ------------------- | --------------------------------------- |
| `id`           | `uuid`        | `gen_random_uuid()` | Primary Key                             |
| `created_at`   | `timestamptz` | `now()`             | Creation timestamp                      |
| `storage_path` | `text`        | -                   | Path in bucket                          |
| `guest_id`     | `uuid`        | -                   | FK to `guests.id`                       |
| `owner_id`     | `uuid`        | `auth.uid()`        | FK to `auth.users.id` (for RLS)         |
| `status`       | `text`        | `'pending'`         | `'pending'`, `'approved'`, `'rejected'` |
| `caption`      | `text`        | `null`              | Optional caption                        |

## RLS Policies

### `guests` Policies

- **Enable RLS**: `true`
- **Policy "Users can view own profile"**:
  - `USING (auth.uid() = auth_id)`
- **Policy "Admins can view all profiles"**:
  - `USING (auth.uid() IN (SELECT auth_id FROM guests WHERE role = 'admin'))`
- **Policy "Users can update own RSVP"**:
  - `USING (auth.uid() = auth_id)`
  - `WITH CHECK (auth.uid() = auth_id)`
- **Policy "Admins can update all profiles"**:
  - `USING (auth.uid() IN (SELECT auth_id FROM guests WHERE role = 'admin'))`

### `photos` Policies

- **Enable RLS**: `true`
- **Policy "Users can view own photos"**:
  - `USING (auth.uid() = owner_id)`
- **Policy "Users can view approved photos"**:
  - `USING (status = 'approved')`
- **Policy "Users can insert own photos"**:
  - `WITH CHECK (auth.uid() = owner_id)`
- **Policy "Admins can view all photos"**:
  - `USING (auth.uid() IN (SELECT auth_id FROM guests WHERE role = 'admin'))`
- **Policy "Admins can update all photos"**:
  - `USING (auth.uid() IN (SELECT auth_id FROM guests WHERE role = 'admin'))`

## Storage Buckets

### `photos` Bucket

- **Public**: `false`
- **File Size Limit**: `None` (as per Option C)
- **Allowed MIME Types**: `image/*`
