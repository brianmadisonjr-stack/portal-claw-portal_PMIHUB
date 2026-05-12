# Deployment (PM Intelligence Hub Portal)

This repo contains the **portal** Next.js app in `web/`.

## Topology (srv1420493)

- `pmintelligencehub.com` / `www.pmintelligencehub.com`
  - static site from `/var/www/pmintelligencehub`
- `app.pmintelligencehub.com`
  - Caddy `reverse_proxy` → `127.0.0.1:4000`
  - Next.js runs via `portal-app.service`
- `api.pmintelligencehub.com`
  - Caddy `reverse_proxy` → `127.0.0.1:54321`
  - Supabase Kong container (`supabase_kong_supabase`, host port 54321 → container 8000)
- `studio.pmintelligencehub.com`
  - Caddy `reverse_proxy` → `127.0.0.1:54323`
  - Supabase Studio container (`supabase_studio_supabase`, host port 54323 → container 3000)

## Portal app (systemd)

Service:
- `/etc/systemd/system/portal-app.service`

Deploy:
```bash
