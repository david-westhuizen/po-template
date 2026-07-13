# `lib` — feature domain logic (the feature-based core)

This is the heart of the feature-based architecture. Each subfolder is one
feature and holds its **framework-agnostic** logic — pure functions,
calculations, formatters, export builders, Supabase query helpers — plus their
unit tests. In raimonland these are folders like `billing/`, `chat/`,
`visitor/`, `shuttle/`.

```
lib/
  utils.ts          cn() + shared helpers
  <feature>/
    <feature>Api.ts       calls the supabase adapter, returns typed data
    <calculation>.ts      pure domain logic
    <calculation>.test.ts vitest unit test
```

Rules of thumb:
- Import the Supabase adapter (`@/integrations/supabase/client`) here, not in
  components.
- Keep these functions pure/testable where possible — no React imports.
- A React Query hook in `src/hooks/` wraps these for the UI, and
  `useRealtimeSync` keeps the cache fresh.
