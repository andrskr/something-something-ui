# web

A minimal TanStack Start app. UI is built with Astryx via `@acme/ui`, not plain CSS/hand-written
markup — see `AGENTS.md` in this directory before adding to `src/routes/index.tsx` or any new route.

```bash
pnpm install
pnpm dev
```

Add route files under `src/routes`; TanStack Router updates `src/routeTree.gen.ts` for you.

Build the production app with:

```bash
pnpm build
```
