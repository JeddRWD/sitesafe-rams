# SiteSafe RAMS

A Next.js + Supabase + Vercel starter app for site specific RAMS.

## Features

- Site-specific public RAMS pages
- Access code required before RAMS can be viewed
- Collapsible RAMS sections
- Admin dashboard
- Add and edit sites
- Add, edit and delete RAMS sections
- RAMS version tracking
- Operative signature capture
- Time/date stamped acknowledgements
- Start and expiry/review dates

## Setup

1. Upload this folder to a new GitHub repository.
2. Create a Supabase project.
3. In Supabase, open SQL Editor and run `supabase-schema.sql`.
4. In Vercel, import the GitHub repository.
5. Add these Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_CODE=choose-your-admin-code
```

6. Deploy.

## Test Page

After deployment, open:

```text
/site/bingham-gate
```

Access code:

```text
BG2026
```

## Important Security Note

This starter uses a simple admin code and public Supabase policies so you can get moving quickly.
Before using this commercially or with live RAMS records, upgrade the admin area to Supabase Auth and tighten Row Level Security policies.
