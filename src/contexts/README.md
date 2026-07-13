# `contexts` — global React context providers

App-wide state that many features read. Prefer React Query for server state; use
context for genuinely global session/UI state.

Shipped:
- **`ActiveOrganizationContext`** — the active organization + the user's role in
  it, plus `setActiveOrg` and `createOrganization`. This is the multi-tenant
  scope: filter feature queries by `activeOrg.orgId` and stamp inserts with it.
  Mounted in `App.tsx` inside `AuthProvider`.
