# Revio — Admin Dashboard

The internal dashboard behind the [Revio car finance website](https://github.com/hanianawazkhan001-ops/revio-website). Staff use it to manage dealerships, car inventory and admin users, and to review reported issues.

## Features

- **Secure admin login**, with routes protected by middleware
- **Invite-only admin accounts:** existing admins send an invite, and the new admin accepts it and sets a password
- **Dealer management:** add, view and edit partner dealerships
- **Inventory management:** add, edit and browse cars, with automatic vehicle details lookup by registration
- **Issues view** for tracking problems with listings
- **Admin user management:** see and manage who has access
- **Light/dark theme toggle** and a mobile-friendly navigation menu

## Tech stack

- **Next.js** (App Router) and **TypeScript**
- **Supabase**: PostgreSQL database and authentication
- **Next.js API routes** for admin actions (cars, dealers, admins)
- **Next.js middleware** for route protection
- **DVLA VES API** for vehicle lookups

## Project structure

```
src/
  app/admin/(auth)/        → login and accept-invite pages
  app/admin/(dashboard)/   → dashboard, dealers, inventory, issues, admins
  app/api/admin/           → admin API routes
  components/admin/        → tables, forms, navigation, theme toggle
  lib/                     → admin auth, Supabase clients, helpers
  middleware.ts            → protects /admin routes
supabase/                  → SQL for database tables
```

## Running locally

```bash
npm install
npm run dev
```

Create a `.env.local` file with your own keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DVLA_VES_API_KEY=
```

Then open http://localhost:3000/admin.

---

Built by **Hania**.
