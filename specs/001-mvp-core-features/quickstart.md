# Quickstart Guide

## Prerequisites

- Node.js 20+
- Supabase CLI (optional, for local dev)
- Vercel CLI (optional, for deployment)

## Environment Variables

Create a `.env` file:

```bash
PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SERVICE_ROLE_KEY="your-service-role-key" # For admin scripts only
```

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

## Database Setup (Supabase)

1. Go to Supabase Dashboard > SQL Editor.
2. Run the schema creation scripts (see `data-model.md`).
3. Enable Storage and create `photos` bucket.
4. Set up Google OAuth provider in Authentication > Providers.

## Deployment (Vercel)

1. Push to GitHub.
2. Import project in Vercel.
3. Add Environment Variables.
4. Deploy.
