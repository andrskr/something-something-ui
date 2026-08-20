<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Something Something UI

A minimal Vite+ monorepo: one app, one design-system package.

## Ownership map

- `apps/web/` (`@acme/web`): the TanStack Start application. File routes live under `src/routes/`;
  framework composition (document shell, providers, router-link) lives under `src/app/`. Has its own
  `apps/web/AGENTS.md` for Astryx-specific guidance — read it before building any UI there.
- `packages/ui/` (`@acme/ui`): the workspace's design-system boundary. Wraps `@astryxdesign/core` and
  `@astryxdesign/theme-neutral` and re-exports the exact primitives apps may use, plus owns the
  reset/base/theme CSS bootstrap via the `./styles.css` export.

## Operating contract

- Use pnpm only through Vite+ (`vp`), and run workspace commands from the repository root.
- `apps/web` must consume Astryx exclusively through `@acme/ui` — never import `@astryxdesign/core`
  directly in application code.
- This file holds workspace-wide conventions only. Package-specific guidance (tooling that only
  applies inside one package, like Astryx's CLI docs for `apps/web`) belongs in that package's own
  `AGENTS.md`, not here.

## Workflow

- After cloning or pulling, run `vp run setup`.
- Before handoff, run `vp run verify` (format check, lint, build). `vp run dev` starts the app's dev
  server; `vp run build` builds the client + SSR server bundles.

## Known workarounds

- `pnpm-workspace.yaml` pins `@types/node` and `typescript` under `overrides` (alongside the
  pre-existing `vite` override). Without this, pnpm installs multiple physical copies of
  `@voidzero-dev/vite-plus-core` (it peer-depends on both), one per distinct `@types/node`/`typescript`
  combination pulled in transitively. `apps/web`'s own `vite.config.ts` and
  `@tanstack/react-start`'s internal `@tanstack/start-plugin-core` can then resolve to _different_
  `vite` module instances, so an `instanceof RunnableDevEnvironment` check inside TanStack Start's dev
  middleware fails silently — `vp dev` serves a bare "Cannot GET /" with no error logged, even though
  `vp build` + `vp preview` work fine. If `vp dev` ever regresses to "Cannot GET /", check
  `find node_modules/.pnpm -maxdepth 1 -iname "@voidzero-dev+vite-plus-core@*"` for more than one
  directory.
- The root `vite.config.ts` sets `fmt.ignorePatterns: ["**/routeTree.gen.ts"]`. TanStack Router
  regenerates that file; without the ignore, `vp fmt --check` fails on a generated file no one should
  hand-edit.
