# PM Intelligence Hub – Web App

Next.js 16 portal for PMI Training that talks to Supabase (auth + Postgres) via Prisma. This readme replaces the default create-next-app boilerplate so new contributors can actually get running.

## Stack
- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4
- **Auth:** Supabase Auth helpers (`@supabase/auth-helpers-nextjs`)
- **Database:** Supabase Postgres (Prisma ORM)
- **Billing:** Square (not wired yet – coming next)

## Local development
```bash
cd web
cp .env.example .env.local   # fill in Supabase + database creds
npm install
npm run dev -- --port 4000
```

The dev server binds to `0.0.0.0:4000` to match production. Adjust the port via `APP_PORT` if needed.

## Environment variables
| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (safe to expose to browser) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for client-side auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Service key (never ship to browser) – used for Admin scripts/webhooks |
| `DATABASE_URL` | Postgres connection string (Supabase or a local Postgres) |
| `SQUARE_ENV` | `production` or `sandbox` |
| `APP_HOST` / `APP_PORT` | Used by deployment scripts/systemd |

## Prisma & database
We are on Prisma 7 with `prisma.config.ts` feeding the datasource, so the CLI reads `DATABASE_URL` from there.

Common commands:
```bash
# Format + validate schema
npx prisma format

# Regenerate the Prisma client (outputs to src/generated/prisma)
npx prisma generate

# Apply new schema changes
npx prisma migrate dev --name <migration_name>
```

The latest migration (`20260331193634_rbac_guardrails`) introduces:
- `AccountRole` enum
- `UserProfile` table (links Supabase user IDs to internal data)
- `AccountMembership` table (user ↔ account role assignments)

## Auth helpers
- **Client:** `src/lib/supabase-client.ts`
- **Server:** `src/lib/supabase-server.ts` (new) exposes `supabaseServer`, `getServerSession`, and `requireServerSession` for use in server components, actions, or API routes.

Routes under `/dashboard`, `/profile`, `/admin`, `/billing`, and `/app/*` are protected by middleware. Auth pages auto-redirect to `/dashboard` when a session already exists.

## Deployment quick notes
- Systemd unit: `portal-app.service` runs `npm run start -- --port 4000`
- Reverse proxy: Caddy should forward `app.pmintelligencehub.com` → `127.0.0.1:4000`
- Add security headers (CSP, `frame-ancestors`, HSTS, `Permissions-Policy`) in the Caddy config. See `/README.md` for the ops overview.

## Next steps
1. Finish Supabase signup/login polish and land the auth commit.
2. Run the PMP workbook importer once auth is stable.
3. Wire Square invoicing + webhooks (requires server-side `SUPABASE_SERVICE_ROLE_KEY`).
4. Add API routes/server actions that enforce account membership using the new Prisma models.
