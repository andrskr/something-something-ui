<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>`
  before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer
  the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are
  changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown,
Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend
tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through
`vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for
information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a
`vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do
different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the
project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+ release. Add a tool name
to select part of the graph. For example, run `vp toolchain vite`. Use `--global` to ignore the
local `vite-plus` package. Use `vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation,
      run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include
      its output when asking for help.

<!--VITE PLUS END-->

# Something Something UI

A minimal Vite+ monorepo: one app, no design-system package right now.

## Communication style

**Always write in ASD-STE100 Simplified Technical English** — short sentences, one instruction per
sentence, approved/plain vocabulary, active voice. This applies to chat responses, commit messages,
PR descriptions, and code comments in this repo.

## Ownership map

- `apps/web/` (`@acme/web`): the TanStack Start application. File routes live under `src/routes/`;
  framework composition (document shell, providers, router-link) lives under `src/app/`. Has its own
  `apps/web/AGENTS.md` for Astryx-specific guidance — read it before building any UI there.
- There is no `packages/ui` design-system wrapper right now (removed 2026-08-24; a prior `@acme/ui`
  package existed briefly). `apps/web` consumes `@astryxdesign/core` and
  `@astryxdesign/theme-neutral` directly. If a real custom-component need comes up again,
  re-introduce a wrapper package then — don't build one speculatively.

## Operating contract

- Use pnpm only through Vite+ (`vp`), and run workspace commands from the repository root.
- `apps/web` imports `@astryxdesign/core`/`@astryxdesign/theme-neutral` directly — there is no
  wrapper package to route through.
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
  `@voidzero-dev/vite-plus-core` (it peer-depends on both), one per distinct
  `@types/node`/`typescript` combination pulled in transitively. `apps/web`'s own `vite.config.ts`
  and `@tanstack/react-start`'s internal `@tanstack/start-plugin-core` can then resolve to
  _different_ `vite` module instances, so an `instanceof RunnableDevEnvironment` check inside
  TanStack Start's dev middleware fails silently — `vp dev` serves a bare "Cannot GET /" with no
  error logged, even though `vp build` + `vp preview` work fine. If `vp dev` ever regresses to
  "Cannot GET /", check
  `find node_modules/.pnpm -maxdepth 1 -iname "@voidzero-dev+vite-plus-core@*"` for more than one
  directory.
- The root `vite.config.ts` sets `fmt.ignorePatterns: ["**/routeTree.gen.ts"]`. TanStack Router
  regenerates that file; without the ignore, `vp fmt --check` fails on a generated file no one
  should hand-edit.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `andrskr/something-something-ui`. Use the `gh` CLI. See
`docs/agents/issue-tracker.md`.

### Triage labels

The five default labels apply. Each label string equals its role name. See
`docs/agents/triage-labels.md`.

### Domain docs

Single-context: one root `CONTEXT.md` plus `docs/adr/`. See `docs/agents/domain.md`.
