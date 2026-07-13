# `hooks` — shared React hooks

Cross-feature hooks live here (raimonland: `useAuth`, `usePermissions`,
`useRealtimeSync`, `useThemeMode`, …). A hook typically:

1. calls a `src/lib/<feature>` function that talks to the Supabase adapter,
2. wraps it in React Query (`useQuery` / `useMutation`),
3. calls `useRealtimeSync` so DB changes invalidate the cache automatically.

`useRealtimeSync.ts` is the shipped "event bus" hook — see its doc comment.
