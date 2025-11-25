# API Contracts (SvelteKit Server Actions)

## 1. Authentication

### `POST /auth/login` (Supabase Client)

- **Input**: `{ provider: 'google' }` OR `{ email: string }`
- **Output**: Redirect to Google OAuth OR Magic Link sent.

### `GET /auth/callback`

- **Query Params**: `code` (OAuth code)
- **Behavior**:
  - Exchange code for session.
  - **Hook**: Check whitelist.
  - **Success**: Redirect to `/`.
  - **Failure**: Redirect to `/access-denied`.

## 2. RSVP

### `POST /rsvp?/update`

- **Input (FormData)**:
  - `rsvp_status`: `'present' | 'absent'`
  - `adults_count`: `number`
  - `children_count`: `number`
  - `dietary_restrictions`: `string`
- **Validation (Zod)**:
  - `adults_count >= 1` if present.
  - `children_count >= 0`.
- **Output**:
  - **Success**: `{ success: true, message: 'RSVP updated' }`
  - **Error**: `{ success: false, errors: { field: message } }`

## 3. Photos

### `POST /gallery?/upload`

- **Input (FormData)**:
  - `file`: `File` (Image)
  - `caption`: `string` (optional)
- **Behavior**:
  - Upload file to Supabase Storage `photos/{uid}/{timestamp}_{filename}`.
  - Insert record into `photos` table.
- **Output**:
  - **Success**: `{ success: true, photo: PhotoObject }`
  - **Error**: `{ success: false, message: string }`

## 4. Admin

### `POST /admin/guests?/add`

- **Input (FormData)**:
  - `email`: `string` (email)
  - `full_name`: `string` (optional)
  - `expected_count`: `number` (default 1)
- **Output**:
  - **Success**: `{ success: true, guest: GuestObject }`
  - **Error**: `{ success: false, message: string }`

### `POST /admin/photos?/moderate`

- **Input (FormData)**:
  - `photo_id`: `uuid`
  - `action`: `'approve' | 'reject'`
- **Output**:
  - **Success**: `{ success: true, status: new_status }`
