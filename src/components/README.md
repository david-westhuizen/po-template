# `components` — feature-grouped React components

`ui/` holds design-system primitives (shadcn); `auth/` holds the auth guards and
shared sign-in form; every other subfolder is a feature slice.

```
components/
  ui/            design-system primitives (shadcn)
  auth/          ProtectedRoute, PortalAccessGuard, RoleGuard, PortalAuthForm
  <feature>/     one folder per feature
```

Business logic for a feature lives in `src/lib/<feature>/`; data-fetching lives
in a hook in `src/hooks/`. Components stay thin.
