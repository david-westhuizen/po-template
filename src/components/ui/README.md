# `components/ui` — design-system primitives

This is where shadcn/ui primitives live (Button, Dialog, Input, …), exactly as
in raimonland. It ships **empty** so no component library is baked in — add only
what you use:

```bash
npx shadcn@latest add button dialog input
```

The `components.json`, `tailwind.config.ts`, and the tokens in `src/index.css`
are already wired for this. Swapping in your own design system means either
restyling these primitives or replacing this folder wholesale — nothing else in
the app imports a UI library directly, so the seam is here.
