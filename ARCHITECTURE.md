# Architecture

This template reproduces the architecture of the **raimonland** Lovable app —
including its **multi-app auth** — with all Lovable-specific tooling removed and
all domain terminology genericized. Same shape, your own Supabase, your own
design system, reusable across projects.

## Stack

- **React 18 + Vite** (`@vitejs/plugin-react-swc`)
- **TypeScript**, path alias `@/* → src/*`
- **Tailwind CSS** with CSS-variable design tokens (shadcn-compatible)
- **Two design systems, one bundle** — shadcn/ui for the **web** back-office,
  **Konsta UI** (switchable iOS / Material look) for the **mobile** apps (see
  [Design systems](#design-systems))
- **Supabase** (`@supabase/supabase-js`) — auth, Postgres, Realtime
- **React Query** (`@tanstack/react-query`)
- **React Router** — routing, lazy-loaded pages

## The three portals

raimonland ships three apps from one codebase (an admin web portal + two
end-user apps) against one Supabase project. This template keeps that exactly,
but generic:

| Portal | id | Route | Self-signup | Allowed roles |
| --- | --- | --- | --- | --- |
| Web App (back-office) | `web` | `/web` | on (bootstrap → create org) | `admin`, `manager` |
| Mobile App 1 | `app1` | `/app1` | on | `member` |
| Mobile App 2 | `app2` | `/app2` | on | `partner` |

Roles are **per-organization** (see below), so a portal admits a user when *any*
of their org memberships holds one of the portal's allowed roles.

Everything about the portals is driven by one file — **`src/config/portals.ts`**.
Rename/add/remove a portal there and the storage-key isolation, guards, routing,
and Hub switcher all follow.

### Session isolation (the key trick)

Each portal has its **own Supabase auth `storageKey`**
(`integrations/supabase/clientConfig.ts`), so signing into the Web App and
Mobile App 1 in the same browser doesn't clobber each other. The key is chosen
once at module init from the URL, so **switching portals is a full page reload**
(`window.location.assign` in `Hub.tsx`) — that's deliberate, not a bug.

### The auth engine

`src/hooks/useAuth.tsx` is ported faithfully from raimonland, including the part
that matters most in production: the `onAuthStateChange` handler distinguishes a
**genuine identity change** (first load / sign-in / user switch → `hydrateIdentity`,
shows the loading gate) from a **same-user token refresh** (tab refocus →
`refreshSessionSilently`, no loading gate). This is what stops the app from
blanking + refetching every time you switch browser tabs. It also uses a
monotonic sequence guard against overlapping fetches and retries the
roles/profile read a few times to survive the post-signup hydration gap.

### The guards

- **`ProtectedRoute`** — authentication gate: loader while auth resolves,
  redirect to the portal's sign-in when logged out.
- **`PortalAccessGuard`** — access gate (runs inside `ProtectedRoute`): allows
  the portal when a membership grants an allowed role; shows the create-org
  onboarding when the user has no org; shows a "no access" screen otherwise.
- **`RoleGuard`** — gate a section/route by role (the vanilla equivalent of
  raimonland's `ModuleGuard` / `SettingsGuard`).

## Organizations (multi-tenancy)

Tenancy is organization-based with **per-org roles**:

- **`organizations`** — one row per tenant/company.
- **`organization_members`** — `(org_id, user_id, role)`; a user can be `admin`
  of one org and `member` of another.
- **RLS** is scoped by membership via `SECURITY DEFINER` helpers
  (`is_org_member(org_id)`, `has_org_role(org_id, role)`) so policies never
  recurse. Every domain table you add should carry an `org_id` and use
  `using (public.is_org_member(org_id))`.
- **`create_organization(name)`** RPC creates the org + the creator's `admin`
  membership atomically (the only sanctioned way to become an admin; solves the
  first-admin chicken-and-egg).
- **`ActiveOrganizationContext`** holds the active org + your role in it, and is
  the client-side tenancy scope — filter queries by `activeOrg.orgId`, stamp
  inserts with it. It's persisted per-portal and switchable via `OrgSwitcher`.

**Bootstrap flow:** sign up on the Web App → no org yet → `PortalAccessGuard`
shows `CreateOrgPrompt` → create an org → you're its `admin` → Web App opens.
End-user app roles (`member`/`partner`) are granted by **invite** — left as an
extension (add an `add_org_member` RPC + email flow).

**Scaling note:** for large tenants, move membership/role into the JWT via a
`custom_access_token` auth hook so RLS reads `auth.jwt()` instead of a subquery.
Start without it.

## How your system-design concepts map

| Concept | Realized as | Where |
| --- | --- | --- |
| **Ports & Adapters** | The Supabase client is the one adapter; nothing else imports `@supabase/supabase-js`. The generated `Database` type is the port contract. | `src/integrations/supabase/` |
| **Feature-based** | Vertical slices: domain logic in `lib/<feature>/`, UI in `components/<feature>/`, screens in `pages/<portal>/`, data hooks in `hooks/`. | `src/lib`, `src/components`, `src/pages`, `src/hooks` |
| **Event Bus** | DB is source of truth; Supabase Realtime is the event stream; `useRealtimeSync` invalidates React Query keys on change. | `src/hooks/useRealtimeSync.ts` + `App.tsx` |
| **Composition root** | Providers + routes wired in one place. | `src/App.tsx`, `src/main.tsx` |
| **Design system** | Web: CSS-variable tokens + shadcn primitives. Mobile: Konsta UI (iOS/Material). | `src/index.css`, `tailwind.config.ts`, `src/components/ui`, `src/components/mobile` |

## Design systems

The web and mobile portals deliberately use **different** component toolkits,
because they're different kinds of product:

| Portal(s) | Toolkit | Look | Lives in |
| --- | --- | --- | --- |
| Web (`/web`) | shadcn/ui + Tailwind | Desktop back-office | `src/components/ui/`, tokens in `src/index.css` |
| Mobile (`/app1`, `/app2`) | **Konsta UI** | **iOS** (default) or **Material** (Android) | `src/components/mobile/` |

Both toolkits share the one Tailwind build and the one brand color — Konsta's
`primary` is set in `tailwind.config.ts` (`konsta.colors.primary`) to mirror
`--primary` in `src/index.css`, so web and mobile read as one brand. The
`/setup` wizard keeps the two in sync when the PO picks a color.

**The iOS ⇄ Material switch.** Konsta renders both looks from the same code via
the `theme` prop on its `<App>`. `src/components/mobile/MobileApp.tsx` wraps each
mobile portal in `<App theme={...}>`, holds the choice (persisted to
localStorage), and exposes `useMobilePlatform()`. The dashboard shows a segmented
control to flip the preview live — handy for checking both platforms without a
rebuild. Default is **iOS**. Build mobile screens with Konsta components
(`Navbar`, `Block`, `List`, `Tabbar`, …); keep shadcn for the web app only.

**The phone frame.** On desktop the mobile apps render inside a realistic device
mockup (`src/components/mobile/DeviceFrame.tsx`) — an iPhone shell (bezel,
Dynamic Island, home indicator) for iOS, an Android shell (punch-hole) for
Material — with the iOS/Android switch on the surrounding "stage" (à la
Figma/Canva). Below `md` it renders full-bleed. To view it **without logging
in**, run `npm run dev` and open **`/preview/app1`** or **`/preview/app2`**
(dev-only routes, stripped from production builds).

## Directory layout

```
src/
  main.tsx                 bootstrap + render
  App.tsx                  composition root (providers + portal routes)
  index.css                design tokens (CSS variables)
  config/portals.ts        ← single source of truth for the 3 portals
  integrations/supabase/   the adapter: client, clientConfig (per-portal keys), types
  hooks/
    useAuth.tsx            faithful multi-portal auth engine (profile + memberships)
    useRealtimeSync.ts     the "event bus" (Realtime → React Query)
  contexts/
    ActiveOrganizationContext.tsx   active org + per-org role (tenancy scope)
  components/
    auth/                  ProtectedRoute, PortalAccessGuard, RoleGuard, PortalAuthForm
    org/                   CreateOrgPrompt, OrgSwitcher
    ui/                    shadcn primitives — WEB only (empty; add on demand)
    mobile/                Konsta UI shell for app1/app2 (MobileApp, MobileDashboard)
    PortalDashboard.tsx    generic web portal home
    <feature>/             feature components
  pages/
    Hub.tsx                portal switcher (full-reload navigation)
    web/                   WebAuth, WebDashboard, OrgsPage
    app1/ app2/            per-portal auth + dashboard screens
    NotFound.tsx
  config/ types/ lib/
supabase/
  config.toml              CLI config (set your project ref)
  migrations/*.sql         profiles + organizations + organization_members + RLS
```

## Database (vanilla)

Two migrations, no domain tables:
- `20240101000000_auth_baseline.sql` — `profiles` (auto-populated on signup by a
  trigger).
- `20240101000100_organizations.sql` — `organizations`, `organization_members`
  (per-org role), the `is_org_member` / `has_org_role` RLS helpers, and the
  `create_organization` RPC.

Add your own tables in new migrations, each with an `org_id` scoped by RLS.

## Adding a feature

1. **Schema** — add table(s) via a new `supabase/migrations/*.sql`, then
   regenerate `src/integrations/supabase/types.ts`.
2. **Domain logic** — `src/lib/<feature>/…` calls `supabase`, plus pure helpers
   + `*.test.ts`.
3. **Hook** — `src/hooks/use<Feature>.ts` wraps the API in React Query and calls
   `useRealtimeSync({ table, queryKeys })`.
4. **UI** — components in `src/components/<feature>/`, screen under the owning
   `pages/<portal>/`, route added in `App.tsx` (inside that portal's group,
   optionally wrapped in `RoleGuard`).

## What was stripped from raimonland

- `lovable-tagger`, `@lovable.dev/cloud-auth-js`, `src/integrations/lovable/`,
  `.lovable/`, `.agents/`, brandLab/theme bootstraps
- The heavy feature-dependency set (tiptap, dnd-kit, jspdf, exceljs, i18next,
  framer-motion, zxing…) — add back only what you need
- All shadcn `components/ui/*` files (regenerated on demand)
- Domain terminology (tenants/staff/properties/modules) — replaced with generic
  portals + roles

The structural conventions, the Supabase-adapter pattern, the
multi-portal session isolation, the faithful auth engine, the
Realtime-as-event-bus pattern, the token seam, and the 3-file tsconfig split are
all preserved.
