# PM Intelligence Hub Portal

Next.js + Tailwind + Prisma portal for PMI Training. Supabase provides auth/database, Square handles billing.

## Local dev

```bash
cd web
cp .env.example .env.local    # fill with real Supabase + Square creds
npm install
npm run dev
```

## Production service (VPS)
- Env file: `/root/.openclaw/workspace/portal-claw-portal_PMIHUB/web/.env.local`
- Build once: `npm run build`
- Systemd unit: `portal-app.service` (runs `npm run start` on port 4000)
- Front door: Caddy proxies `app.pmintelligencehub.com` → `127.0.0.1:4000`

## Next steps
- Connect Prisma schema to Supabase Postgres (crm + learner models)
- Build auth/tenant scaffolding
- Wire Square invoicing + CRM dashboards
