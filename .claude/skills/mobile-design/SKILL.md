---
name: mobile-design
description: Mobile UI/UX design guidance for this template's phone apps (app1 / app2, built with Konsta UI). Use WHENEVER creating or editing any screen, component, feature, or layout under src/pages/app1, src/pages/app2, or src/components/mobile — or any Konsta-based mobile UI. It makes screens read like a real mobile product (information architecture, navigation, touch targets, states) instead of a shrunk-down web page. Triggers: "add a screen/feature to the customer/partner app", "build the mobile …", "design the app1/app2 …", "a page for the mobile app", or any work on the mobile portals.
---

# Mobile design (Konsta UI apps)

You are designing for a **phone app**, not a web page. Konsta gives you
native-looking iOS/Material components — it does **not** make design decisions.
Composition, navigation, hierarchy, and states are on you. Design each screen
the way a senior mobile product designer would: one clear job per screen,
reachable actions, honest states.

> The web back-office (`/web`) uses shadcn — a different discipline. **Never**
> use shadcn primitives or web patterns (data tables, hover menus, dense
> toolbars) in the mobile apps, and never the reverse.

## 1. The architecture you must build within

Every mobile screen lives inside the phone shell and the Konsta theme:

- `src/components/mobile/MobileApp.tsx` — supplies the Konsta `<App theme>` +
  the device frame + the iOS/Android switch. Screens render **inside** it.
- Layout is a **flex column**: a top bar (`Navbar`), a **scrollable content
  area** (`min-h-0 flex-1 overflow-y-auto`), and a bottom `Tabbar`. Never let
  the whole screen scroll the body — scroll the content region only.
- `src/components/mobile/MobileDashboard.tsx` is the reference screen. Copy its
  shape.

**Adding more than one screen?** Introduce a mobile layout route that renders
`<MobileApp>` **once** with an `<Outlet/>`, and give it the shared `Tabbar`
wired to the router (see §3). Each screen then renders its own `Navbar` +
content. Don't wrap every screen in its own `MobileApp` (you'd get nested
frames).

## 2. Information architecture — decide this first

Before writing JSX, answer:
- **What is the ONE job of this screen?** If there are two, it's probably two
  screens (or a screen + a sheet).
- **Where does it sit?** A top-level destination (gets a `Tabbar` slot, max
  3–5 total) or a **detail** pushed on top of one (gets a back button, keeps or
  hides the tab bar)?
- **Does it need a full screen?** Quick, focused tasks (confirm, pick, a short
  form) belong in a **Sheet / Dialog / Actions**, not a new route.

## 3. Navigation model

- **Bottom `Tabbar`** — 3–5 top-level sections only. Icons + short labels. Wire
  `TabbarLink` `active`/`onClick` to the router (`useLocation` + `navigate`),
  not local state, once there's real routing.
- **Push / detail** — a screen opened from a list/action. Use a `Navbar` with a
  `NavbarBackLink` (left) + short title. **One header per screen** — never
  render a second header inside the page (it stacks into a double bar).
- **Sheet** (bottom sheet) — contextual quick tasks, filters, short forms.
- **Dialog** — confirmations and destructive-action prompts.
- **Actions** (action sheet) — a short menu of choices tied to an item.
- Keep titles short; the app is already scoped to the user's org — don't repeat
  the org/property name in every header.

## 4. Layout & hierarchy

- **Single column.** No side-by-side columns, no horizontal scrolling.
- **Lists, not tables.** Use `List`/`ListItem` (and `ListInput` for forms).
  `Table` exists but is almost never right on a phone.
- **Group with `Block` / `BlockTitle` / `Card`.** A `BlockTitle` labels a
  section; a `Card` groups related content.
- **Thumb reachability.** Primary actions go at the **bottom** (a `Fab`, a
  bottom `Button`, or a Tabbar action) — not the top corners. Top bar is for
  back/title and at most one secondary action.
- **Touch targets ≥ 44px.** Don't cram tiny tap targets; give rows real height.
- **Vertical rhythm & breathing room.** Generous spacing; let content lead,
  keep chrome minimal.

## 5. Konsta component catalog — reach for these

| Need | Component(s) |
|---|---|
| Screen container | `Page` |
| Top bar | `Navbar` (+ `NavbarBackLink`) |
| Bottom nav | `Tabbar` + `TabbarLink` |
| Sections / grouping | `Block`, `BlockTitle`, `BlockHeader`, `BlockFooter`, `Card` |
| Lists & rows | `List`, `ListItem`, `ListGroup`, `ListButton` |
| Forms & inputs | `ListInput`, `Checkbox`, `Radio`, `Toggle`, `Stepper`, `Range`, `Searchbar` |
| Actions | `Button`, `Fab`, `Segmented`/`SegmentedButton`, `Link` |
| Overlays | `Sheet`, `Popup`, `Dialog`, `Popover`, `Actions`, `Toast`, `Notification` |
| Status / meta | `Chip`, `Badge`, `Preloader`, `Progressbar` |
| Chat | `Messages`, `Message`, `Messagebar` |

Import from `konsta/react`. Icons come from `lucide-react` (already a dep) —
pass them to `icon` props.

**Overlays (`Sheet`, `Dialog`, `Popup`, `Toast`) are `position: fixed`.** They
stay inside the phone frame because `DeviceFrame` puts a `transform` on the
device body (a transformed ancestor becomes the containing block for `fixed`
children). Use them freely — just don't strip that transform, and expect the
backdrop to dim the **device**, not the browser.

## 6. States — design all of them

Never ship only the happy path. For any screen that loads or submits data:
- **Loading** — `Preloader` / skeletons, not a blank screen.
- **Empty** — a friendly empty state with a clear next action, not a bare list.
- **Error** — a readable message + retry.
- **Feedback** — confirm success (`Toast`/`Notification`); guard destructive
  actions with a `Dialog`.

Data is scoped by the active org — read it via `useActiveOrg()` and filter/stamp
by `activeOrg.orgId`.

## 7. Theming rules (don't undo the setup)

- Both looks ship from one codebase; the `<App theme>` prop (iOS/Material) is
  driven by `MobileApp`. Build once — don't fork per platform.
- Colors come from the Konsta tokens (brand primary + neutral surfaces set in
  `src/index.css`). **Don't** hardcode hex colors or reintroduce brand-tinted
  surfaces; use `bg-primary`, `text-primary`, and Konsta's surface classes so
  iOS and Android stay consistent. See ARCHITECTURE.md → "Design systems".
- Let platform-native differences stand (centered vs left title, tab pill vs
  flat, button casing). Don't try to force them identical — that's the point of
  Konsta. Only remove *unnecessary* differences (stray colors/tints).

## 8. Anti-patterns (web habits to kill)

- ❌ A data table, a dense toolbar, or hover-only affordances.
- ❌ Two headers / a custom `<header>` inside a page that already has a `Navbar`.
- ❌ Primary action stuck in the top-right corner.
- ❌ The whole body scrolling (breaks the fixed Navbar/Tabbar).
- ❌ shadcn/`components/ui` imports in a mobile screen.
- ❌ Tiny tap targets; walls of text; multi-column layouts.

## 9. Pre-ship checklist

- [ ] Screen has one clear job; extra tasks moved to sheets/detail screens.
- [ ] Correct navigation slot (tab vs push vs sheet/dialog); one header only.
- [ ] Single column; lists not tables; no horizontal scroll.
- [ ] Primary action reachable at the bottom; targets ≥ 44px.
- [ ] Loading, empty, error, and success states all handled.
- [ ] Only Konsta components (no shadcn); colors via tokens (no hardcoded hex).
- [ ] Looks right in **both** iOS and Android (`/preview/app1`, toggle both).
- [ ] Data scoped by `activeOrg`.

## 10. The throughline

Good mobile design here = **native components (Konsta) + real design judgment**.
When a screen is uncertain, fall back to the fundamentals: one job per screen; an
obvious primary action within thumb reach; honest loading/empty/error states;
minimal chrome; single-column, list-based layout; and let each OS render in its
own native idiom. When in doubt, simplify and cut, don't add.
