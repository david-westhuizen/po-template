# `pages` — routed screens

One file per route, lazy-loaded from `App.tsx`. Screens are grouped by portal:

```
pages/
  Hub.tsx        portal switcher at "/"
  NotFound.tsx
  web/           /web/*   (Web App portal)
  app1/          /app1/*  (Mobile App 1)
  app2/          /app2/*  (Mobile App 2)
```

Pages compose feature components + hooks and hold routing/layout concerns, not
business logic. Portals are defined in `src/config/portals.ts`.
