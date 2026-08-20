# Something Something UI

A minimal [Vite+](https://viteplus.dev) monorepo with one TanStack Start application
(`apps/web`, `@acme/web`) and one design-system package (`packages/ui`, `@acme/ui`) that wraps
[Astryx](https://github.com/facebook/astryx). It exists to prove the stack — Vite+, TanStack Start,
and Astryx's StyleX-based theme build — works end to end.

See [AGENTS.md](./AGENTS.md) for the repository's operating contract.

## Development

Install the pinned workspace:

```bash
vp run setup
```

Start the app's dev server:

```bash
vp run dev
```

Run the normal validation gate (format check, lint, build):

```bash
vp run verify
```

Build just the app:

```bash
vp run build
```
