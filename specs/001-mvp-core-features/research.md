# Research & Technical Decisions

## 1. Design System (Mobile First)

Based on `docs/maquette/v&m_2026_gallery_upload/code.html`:

### Color Palette "Été Naturel & Chic"

- **Primary**: `#556B2F` (Olive Green) - Buttons, Highlights
- **Background Light**: `#F5F5DC` (Beige/Cream) - Main Background
- **Background Dark**: `#1F2923` (Dark Green) - Dark Mode Background
- **Text Light**: `#36454F` (Charcoal) - Primary Text
- **Text Dark**: `#EAE8E1` (Off-white) - Dark Mode Text
- **Accent**: `#B87333` (Copper/Bronze) - Secondary Actions

### Typography

- **Headings**: `Playfair Display` (Serif)
- **Body**: `Inter` (Sans-serif)

### UI Components (Shadcn-Svelte)

- **Button**: Custom variant using Primary color.
- **Input/Form**: Standard Shadcn with focus rings in Primary.
- **Toast**: For feedback (RSVP success, Upload progress).
- **Card**: For Guest details and Photo grid items.

## 2. Authentication Strategy (Hybrid)

### Provider: Google OAuth

- **Scope**: `email`, `profile`.
- **Flow**:
  1. User clicks "Sign in with Google".
  2. Supabase Auth handles OAuth flow.
  3. **Server Hook (`hooks.server.ts`)**:
     - Intercepts session validation.
     - Checks `session.user.email` against `public.guests` table.
     - If email NOT in `guests`: Sign out user & redirect to `/access-denied`.
     - If email IN `guests`:
       - Update `guests.auth_id` if null.
       - Allow access.

### Fallback: Magic Link

- **Flow**:
  1. User enters email.
  2. Supabase sends Magic Link.
  3. Same Server Hook validation applies.

## 3. Database & Security (RLS)

### Table: `guests`

- **RLS Policies**:
  - `SELECT`: Users can see their OWN row (`auth.uid() = auth_id`). Admins can see ALL.
  - `UPDATE`: Users can update their OWN RSVP fields. Admins can update ALL.
  - `INSERT`: Admins ONLY.

### Table: `photos`

- **RLS Policies**:
  - `SELECT`: Users can see their OWN photos (`owner_id = auth.uid()`).
  - `SELECT (Public)`: Users can see photos where `status = 'approved'`.
  - `INSERT`: Authenticated users can insert (linked to their `guest_id`).
  - `UPDATE`: Admins ONLY (Moderation).

### Storage: `photos` Bucket

- **Policies**:
  - `INSERT`: Authenticated users.
  - `SELECT`: Authenticated users.
  - `DELETE`: Admins only.

## 4. Server Architecture (SvelteKit)

- **Load Functions (`+page.server.ts`)**: Fetch data (Guest profile, RSVP status, Photo list).
- **Form Actions (`+page.server.ts`)**: Handle mutations (Submit RSVP, Upload Photo metadata).
- **Hooks (`hooks.server.ts`)**: Auth protection & Whitelist enforcement.
