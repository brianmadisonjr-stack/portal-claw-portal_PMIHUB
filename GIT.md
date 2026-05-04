# GIT.md

Quick operational notes for this repository: branches, release flow, and where changes landed.

## Default branches

- `main` — production/stable
- Feature/work branches should be short-lived and merged via PR

## Recent branch notes (2026-05-04)

### `arch/ui-refresh-rebased`

- **Purpose:** MVP UI + auth/build fixes collected for merge into `main`.
- **Source:** pushed from the OpenClaw container using a GitHub **deploy key** (write-enabled) after SSH auth was configured.
- **Create PR:**
  - Base: `main`
  - Compare: `arch/ui-refresh-rebased`
  - URL: https://github.com/brianmadisonjr-stack/portal-claw-portal_PMIHUB/pull/new/arch/ui-refresh-rebased

#### Contents (high level)

- UI refresh updates (landing page / metadata / font)
- Cohorts UI hidden (dashboard card + route redirect removal)
- Next/Supabase/auth routing adjustments to unblock builds:
  - supabase server client + suspense-related fixes
  - `force-dynamic` for auth pages
  - middleware migration to proxy

#### Known lint note

- `web/scripts/import-pmp-questions.mjs`: `stableQuestionKey` is currently unused (warning only)

## Deploy key note

A repo deploy key was added on GitHub to enable pushes from the container.
If you rotate/remove deploy keys later, pushes from this environment will fail until reconfigured.
