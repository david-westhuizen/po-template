# `types` — shared TypeScript types

App-wide domain types that aren't owned by a single feature or generated.
Database row types come from `src/integrations/supabase/types.ts` (generated) —
re-export or compose them here rather than hand-writing DB shapes.
