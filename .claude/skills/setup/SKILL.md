---
name: setup
description: Interactive first-time setup wizard for this po-template repo. Guides a non-technical user (a product owner used to Lovable, not a developer) through naming the project, defining their apps/roles, connecting their own Supabase project, creating the database, setting brand colors, running the app for the first time, and putting it online (deploying to Vercel with auto-deploy on every push). Invoke when the user says "set up", "get started", "/setup", "help me configure this", "connect Supabase", "deploy", "publish", "put it online", "connect Vercel", or opens the repo for the first time and doesn't know what to do.
---

# Setup Wizard

You are guiding a **non-technical product owner** through setting up this template
for a brand-new project. They are comfortable describing what they want (like in
Lovable) but are **not developers**. Your job is to do all the technical work for
them and only ask for decisions and information a human must provide.

## Rules of engagement

- **Plain language, no jargon.** Say "the address of your database" not "the
  Postgres connection string." Explain the *why* in one short sentence.
- **One step at a time.** Do a step, confirm it worked, then move on. Never dump
  the whole checklist at once.
- **You do the edits.** When a step means changing a file (`portals.ts`, `.env`,
  `index.css`, `package.json`, `index.html`), make the edit yourself with the
  Edit/Write tools. Don't ask them to edit files.
- **Copy-paste for the dashboard.** Some steps happen in the Supabase website,
  which you can't do for them. For those, give an exact, numbered click-path and
  a ready-to-paste block. Wait for them to confirm before continuing.
- **Use AskUserQuestion** for choices (how many apps, brand color, etc.) so they
  pick from options instead of typing.
- **Check in.** After each phase, tell them what you just did in one sentence.

Run these phases in order. Skip a phase only if the user says it's already done.

---

## Phase 0 — Welcome

Greet them and set expectations, e.g.:

> "Hi! I'll get this app set up for you — no coding needed. It'll take about 10
> minutes. I'll ask you a few questions and handle the technical bits. At the
> end you'll have a running app with sign-in and three sub-apps. Ready?"

Briefly explain in Lovable terms: *this is a starter project (like a Lovable
remix) that already has login, user accounts, organizations, and three separate
apps built in. We'll make it yours.*

## Phase 1 — Name the project

Ask what they want to call the project (one short name). Then edit:
- `package.json` → `"name"` (kebab-case version of it)
- `index.html` → `<title>` and the meta description
- `src/config/portals.ts` → `STORAGE_KEY_PREFIX` (kebab-case, e.g. `sb-acme`) so
  their login sessions are namespaced to this project

Confirm: "Done — your project is now called X."

## Phase 1.5 — Make this your own copy (disconnect from the template)

This project was cloned from a shared **template**. Before building anything,
disconnect it so their work can never accidentally push back to (or overwrite)
the template. Say it plainly, then do it for them:

> "This started as a copy of a shared template. I'll disconnect it so your
> changes stay yours and can never touch the template. When you're ready to save
> your project online, we'll connect it to your own space."

1. Look at the current remote: `git remote -v`.
2. If an `origin` points at the **po-template** template (the URL contains
   `po-template`), detach it. Offer the two paths with AskUserQuestion:
   - **Fresh start (recommended for most):** they won't pull future template
     updates. Remove the link so there's no push target until they add their own:
     `git remote remove origin`. (For a completely clean history you may instead
     `rm -rf .git && git init && git add -A && git commit -m "Initial commit"`.)
   - **Keep template updates:** rename it read-only so it can't be a push target
     by accident: `git remote rename origin template`. They can later run
     `git pull template main` to pull in template improvements.
3. **Turn on the safety guard** so a push can never reach the template even by
   mistake: `git config core.hooksPath .githooks`. (This repo ships a `pre-push`
   hook that blocks pushing to any `po-template` remote.)
4. When they're ready to publish to **their own** repo, connect it — only then
   does `git push` work, and only to their repo:
   `git remote add origin <their-repo-url>` (or `git remote set-url origin …`).

Confirm: "Done — this is now your own copy, safely disconnected from the
template."

> **Folder name — do this LAST, after the whole wizard finishes** (renaming the
> folder now would pull the ground out from under this session). At the end,
> print this for them to run in their terminal from the *parent* folder, using
> the kebab project name from Phase 1:
> ```
> mv "<current-folder-name>" "<kebab-project-name>"
> ```

## Phase 2 — Define the apps

This template ships **three apps** (portals): a back-office **Web App** and two
**Mobile Apps**. Explain that and ask if that fits, or if they want to rename
them / change how many.

**Web vs mobile is more than a label — it decides the *look*.** Say it plainly:

> "Two kinds of app come built in. The **Web App** is a desktop back-office —
> sidebars, tables, that 'admin dashboard' feel. The **Mobile Apps** look like
> real phone apps, and can show an **iPhone (iOS)** or **Android** style. Which
> of your apps are desktop, and which are phone apps?"

Use AskUserQuestion to gather, for each app they want:
- its name (e.g. "Admin", "Customer App", "Partner App")
- **web (desktop) or mobile (phone)** — this picks its design system
- who uses it → which **role** grants access (e.g. `admin`, `customer`,
  `partner`)

Then edit `src/config/portals.ts`:
- rename/add/remove entries in `PORTALS`
- update `label`, `description`, `basePath`, `storageKey`, `allowedRoles`
- if they change the number of portals, also update the `PortalId` type and the
  routes in `src/App.tsx` and the page folders under `src/pages/` to match.
  **Copy the pair that matches the app's kind:**
  - **web app** → copy the `web/` pages (shadcn desktop shell)
  - **mobile app** → copy the `app1/` pages, which wrap the screen in
    `<MobileApp>` + `MobileDashboard` (the Konsta UI phone shell)

Keep it simple: if they're unsure, keep the three defaults (one web + two
mobile) and just rename them.

Confirm what the apps are now called, their web addresses (`/web`, etc.), and
which are desktop vs phone.

## Phase 3 — Connect Supabase (their database + login)

Explain: *Supabase is the free service that stores your users and data. You need
your own project.*

**First, check for automation.** This repo ships a Supabase MCP connection
(`.mcp.json`). Check whether Supabase MCP tools are available to you (e.g.
`list_projects`, `apply_migration`, `get_project_url`, `get_anon_key`,
`generate_typescript_types`).

### Path A — Supabase MCP is available (preferred, fully automated)

The MCP needs a **personal access token** once — no terminal required.

1. Send them to https://supabase.com/dashboard/account/tokens → **Generate new
   token** → copy it.
2. Ask them to paste it here. Tell them plainly: *this lets me talk to your
   Supabase account on your behalf. I'll save it in a private file on your
   machine (`.claude/settings.local.json`) that is gitignored and never
   committed. You can delete the token in Supabase anytime.* (Also note: pasting
   it here puts it in this chat transcript — that's fine for a token you can
   rotate, and they can revoke it after setup.)
3. Write it into `.claude/settings.local.json`, **merging** with any existing
   JSON there, under an `env` key:
   ```json
   {
     "env": { "SUPABASE_ACCESS_TOKEN": "<their token>" }
   }
   ```
   (`.mcp.json` reads `${SUPABASE_ACCESS_TOKEN}` from this.)
4. Tell them to **restart Claude Code** (quit and reopen) so the connection picks
   up the token, then say "continue setup" — resume from here.

(Terminal-comfortable users can instead
`export SUPABASE_ACCESS_TOKEN=<token>` and restart, skipping the file.)

Once the MCP tools respond:
1. Ask if they already have a project. If not, either use `create_project` (ask
   for a name + let them confirm the org/region) or have them create one in the
   dashboard, then `list_projects` to find it. Confirm which project to use.
2. `get_project_url` and `get_anon_key` for that project → write `.env` (from
   `.env.example`):
   ```
   VITE_SUPABASE_URL=<url>
   VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
   VITE_SUPABASE_PROJECT_ID=<ref>
   ```
   and set `project_id` in `supabase/config.toml`.

Then go straight to Phase 4 (Path A) — you'll apply the migrations yourself.

### Path B — no MCP token (manual, still fine)

Give this click-path and wait:
1. https://supabase.com → sign in → **New project** (name it, set a strong DB
   password, pick the nearest region). Wait ~2 min.
2. Open **Project Settings → API** and copy back to me: **Project URL**, the
   **anon / public** key, and the **Project ref** (the id in the URL).

Write the same `.env` + `supabase/config.toml` from those values.

Confirm: "Connected to your Supabase project."

## Phase 4 — Create the database tables

The app needs its tables (`profiles`, `organizations`, `organization_members`).

### Path A — via the MCP (automated)

Read the two files in `supabase/migrations/` in filename order and, for each,
call `apply_migration` with a descriptive `name` and the file's SQL as `query`
(apply them in order). Then `list_tables` to confirm the tables exist. Report
success.

### Path B — via the SQL Editor (manual)

1. Read both files in `supabase/migrations/` (in order) and combine them into ONE
   SQL block.
2. Tell the user:
   > "In your Supabase project, open **SQL Editor → New query**, paste the block
   > below, and click **Run**."
3. Paste the combined SQL in a single code block.
4. Ask them to confirm it ran (green "Success"). If there's an error, read it and
   help fix.

(Terminal-comfortable users can instead run
`npx supabase link --project-ref <ref>` then `npx supabase db push`.)

Confirm: "Your database is ready."

## Phase 5 — Make signup instant (email confirmation)

By default Supabase makes new users confirm their email before they can log in,
which interrupts the first-run experience. For getting started, recommend turning
it off:

> "In Supabase, open **Authentication → Sign In / Providers → Email** (or
> **Authentication → Settings**), and turn **OFF** 'Confirm email'. This lets you
> sign in immediately. You can turn it back on before launch."

Note you can't verify this for them — ask them to confirm they toggled it.

## Phase 6 — Design system & brand

This is where they decide how the app *looks*. Explain the setup in plain
language first — the app comes with **two matching design systems**, one per
kind of app, so each app looks native to its platform:

> "Your **desktop** app uses a clean, professional back-office style. Your
> **phone** apps look like real mobile apps — and can show an **iPhone (iOS)**
> or **Android** look. They all share one brand color so everything feels like
> one product."

You don't need them to choose component libraries — that's handled. You need two
decisions from them:

### 6a — The phone look (iOS vs Android)

If they have any mobile apps, use AskUserQuestion:

> "For your phone apps, which look should be the **default** — **iPhone (iOS)**
> or **Android**? (Both are always available — there's a switch in the app to
> preview the other — this just sets which one opens first.)"

- **iPhone (iOS)** — the default; leave it as is.
- **Android (Material)** — edit `src/components/mobile/MobileApp.tsx`: change the
  `readStored()` fallback from `"ios"` to `"material"` (the value returned when
  nothing is saved yet) so the mobile apps open in Material by default.

Skip this step entirely if they kept only web apps.

### 6b — Brand color

Ask for their main brand color (offer a few friendly options + "I'll paste a hex
code"). Then set it in **both** places so web and mobile match:

1. **Web tokens** — convert the hex to `H S% L%` and edit `src/index.css`: set
   `--primary` (and `--primary-foreground` to white or near-black for contrast).
2. **Mobile (Konsta)** — edit `tailwind.config.ts`: set
   `konsta.colors.primary` to the **hex** value.

Explain the whole app — desktop and phone — restyles from this one color, and
they can refine other colors later. Keep it to the primary color for now unless
they ask for more.

Confirm: "Your apps now use your brand color, with an [iOS/Android] default for
the phone apps."

## Phase 7 — Run it

Run these for them (in the background where appropriate) and report the result:
```
npm install
npm run dev
```
Give them the local URL it prints (e.g. http://localhost:8080) and tell them to
open it. They should see the **Hub** with their apps.

If types feel out of date later: if the Supabase MCP is available, call
`generate_typescript_types` and write the result to
`src/integrations/supabase/types.ts`; otherwise run
`npx supabase gen types typescript --project-id <ref> > src/integrations/supabase/types.ts`.

## Phase 8 — Create the first admin account

Walk them through it live:
1. Open the **Web App** (`/web`) from the Hub.
2. Click **Sign up**, enter an email + password.
3. You'll be asked to **create an organization** — enter a name. You are now its
   **admin**.
4. The Web App opens. 🎉

Explain: other people join an organization by invitation with a role (member /
partner) — that's a feature they can ask you to build next.

## Phase 9 — Put it online (deploy to Vercel)

So far the app runs only on their computer. **Vercel** gives it a real web
address and — once set up — **re-publishes automatically every time anyone saves
changes**. Say it plainly:

> "Right now your app only runs on your computer. Vercel puts it on the internet
> with a real link, and once we connect it, the live site updates **by itself**
> every time you (or a teammate) save changes. It's free to start."

Good news: this project **already ships** the deploy setup — a
`.github/workflows/deploy.yml` and a `vercel.json`. You just connect their
accounts. Do these steps in order, one at a time.

### 9.0 — Make sure the app is on their own GitHub repo

Auto-deploy watches their GitHub repo, so the code must live there first.
- Run `git remote -v`. If there's no `origin` pointing at **their own** GitHub
  (Phase 1.5 may have removed the template link), help them publish it:
  - Easiest (if `gh` is installed): `gh repo create <name> --private --source=. --remote=origin --push`.
  - Or: they create an empty repo on github.com, then you run
    `git remote add origin <their-repo-url> && git push -u origin main`.
- Confirm the push to their repo succeeds.

### 9.1 — Create a Vercel project from their repo (dashboard — human only)

Read their `.env` first and have the three Supabase values ready to show them.
Then give this click-path and wait:
1. Go to https://vercel.com → **Sign up** → **Continue with GitHub** (easiest).
2. **Add New… → Project** → find their repo → **Import**.
3. It auto-detects **Vite**. Before deploying, open **Environment Variables**
   and add the same three from their `.env` (Phase 3) — paste the values you just
   read out:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

   > "The live site needs these to reach your database — without them it'll load
   > but can't log anyone in."
4. Click **Deploy** and let the first build finish.

### 9.2 — Get a deploy token (dashboard — human only)

1. Vercel → your avatar (top-right) → **Settings → Tokens → Create Token**.
   Name it "GitHub Actions", scope it to their account/team.
2. Copy it and paste it here. Tell them plainly: *this lets the auto-deploy
   publish on your behalf. I'll store it as an encrypted **GitHub secret** — it
   never appears in your code, and you can delete the token in Vercel anytime.*

### 9.3 — Wire up auto-deploy (you do this for them)

Once they paste the token:
1. Link the project to fetch its IDs:
   `npx vercel link --yes --token <token>` — pick the project they just imported.
   This writes `.vercel/project.json` containing `orgId` and `projectId`.
2. Read those two IDs from `.vercel/project.json`.
3. Set the three GitHub secrets on their repo (add `-R <owner>/<repo>` if there
   are multiple remotes):
   ```
   gh secret set VERCEL_TOKEN      --body "<token>"
   gh secret set VERCEL_ORG_ID     --body "<orgId>"
   gh secret set VERCEL_PROJECT_ID --body "<projectId>"
   ```

### 9.4 — Turn off Vercel's own auto-deploy (important)

Explain the *why* in one sentence:

> "Vercel has its own built-in publishing, but on a team it only lets **paid**
> members publish that way — a teammate's save would get blocked. Our setup
> avoids that (anyone can publish, no extra accounts), so we switch Vercel's
> built-in one off."

- Human path: Vercel → the project → **Settings → Git → Disconnect**.
- Or do it for them with the token:
  `curl -X DELETE "https://api.vercel.com/v9/projects/<projectId>/link?teamId=<orgId>" -H "Authorization: Bearer <token>"`
  (expect HTTP 200). **Don't reconnect it later** — that brings the blocking back.

### 9.5 — Test it

Trigger a deploy and watch it go green:
```
git commit --allow-empty -m "test deploy" && git push origin main
```
Watch the repo's **Actions** tab (or `gh run watch`). Within a minute the live
URL (Vercel → the project → **Domains**) shows the update.

Confirm: "Your app is live, and it re-publishes automatically every time anyone
saves changes — no extra Vercel accounts needed for your team."

## Phase 10 — What's next

Tell them how to keep going, in their words:
> "From here, just tell me what you want to build — e.g. 'add a bookings page to
> the customer app' — and I'll build it following this project's structure. See
> ARCHITECTURE.md for how it's organized."

Point out the key files they might name: `src/config/portals.ts` (their apps),
`src/index.css` (web colors) + `tailwind.config.ts` (mobile brand color),
`src/components/mobile/` (the phone-app look), `supabase/migrations/` (their
data). Note that the web apps use shadcn components and the phone apps use
Konsta UI (iOS/Material) — see ARCHITECTURE.md → "Design systems".

---

## About the Supabase access token (security)

- The token is read from the `SUPABASE_ACCESS_TOKEN` environment variable via
  `.mcp.json`. The wizard stores it in `.claude/settings.local.json`, which is
  **gitignored** — it is never committed. (Terminal users can `export` it
  instead and skip the file.)
- It grants access to the user's Supabase account, so treat it like a password.
  Prefer an account that only holds their own projects; they can **delete the
  token** in the Supabase dashboard once setup is done.
- The MCP here is scoped to `account,database,development,docs` features. For
  ongoing use against a project with real data, recommend re-scoping to a single
  project and read-only (`--project-ref=<ref> --read-only`).

## If something breaks

- **App won't start / blank page:** check `.env` has all three values and the dev
  server was restarted after editing `.env` (Vite reads env at startup).
- **"Missing Supabase env vars":** `.env` isn't filled in — redo Phase 3.
- **Can sign up but bounced back to sign-in:** email confirmation is still on
  (Phase 5) — turn it off, or confirm the email then sign in.
- **"No access" after login:** they have no organization yet — the create-org
  screen should show; if they're on a Mobile App, that role is invite-only.
