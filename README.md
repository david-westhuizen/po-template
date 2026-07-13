# po-template

> **👋 Not a developer? Start here.** Open this folder in **Claude Code** and
> type **`/setup`**. A guided wizard will name your project, set up your apps,
> connect your Supabase, and get the app running — no coding, ~10 minutes. The
> rest of this README is the manual/developer path.
>
> The repo includes the official **Supabase MCP** (`.mcp.json`), so — if you
> paste a one-time Supabase access token when asked — the wizard can create your
> database tables and fill in your keys **automatically** (no copy-pasting SQL,
> no terminal). It saves the token to `.claude/settings.local.json`, which is
> gitignored and never committed. Skip it and the wizard falls back to a guided
> copy-paste path.

A React 18 + Vite + Supabase starter that mirrors the **raimonland** (Lovable)
architecture — **multi-app auth** (three portals from one codebase, per-portal
session isolation) plus **organization-based multi-tenancy** with per-org roles
— with all Lovable tooling removed and all domain terminology genericized. Bring
your own Supabase project and design system; reuse across projects.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full breakdown.

## The three portals

| Portal | Route | Allowed roles |
| --- | --- | --- |
| Web App (back-office) | `/web` | `admin`, `manager` |
| Mobile App 1 | `/app1` | `member` |
| Mobile App 2 | `/app2` | `partner` |

All defined in one place: [`src/config/portals.ts`](./src/config/portals.ts).
The Hub at `/` switches between them. Roles are **per-organization** — access is
granted when a membership holds an allowed role.

## Getting started

```bash
npm install
cp .env.example .env          # fill in your Supabase URL + publishable key

# create the auth tables in YOUR project:
npx supabase link --project-ref <your-ref>
npx supabase db push          # applies supabase/migrations/*
# then regenerate types:
npx supabase gen types typescript --project-id <your-ref> > src/integrations/supabase/types.ts

npm run dev                   # http://localhost:8080
```

To try the flow end-to-end: open `/web`, sign up → you'll be prompted to
**create an organization** (you become its `admin`) → the Web App opens. Manage
orgs at `/web/orgs`. (End-user apps `/app1` `/app2` are joined by invite — an
`add_org_member` RPC + email flow is the documented extension.)

Add design-system primitives on demand (tokens are pre-wired):

```bash
npx shadcn@latest add button input
```

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Vite dev server (port 8080) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Layout

`src/config/portals.ts` (portal source of truth) ·
`src/integrations/supabase` (adapter + per-portal keys) ·
`src/hooks/useAuth.tsx` (auth engine) · `src/contexts/ActiveOrganizationContext.tsx`
(tenancy) · `src/components/auth` (guards + form) · `src/components/org`
(org UI) · `src/pages/{web,app1,app2}` (portal screens) ·
`src/hooks/useRealtimeSync.ts` (event bus) · `supabase/migrations`
(`profiles` + `organizations` + `organization_members`).
