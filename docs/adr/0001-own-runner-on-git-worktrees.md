# Build our own Run orchestration on git worktrees, not `@vercel/agent-eval`

`@vercel/agent-eval` v2.2.0 does everything we want on paper — sandboxing, repeats, caching, an
agentic judge, a local viewer — and it genuinely supports subscription billing rather than API keys
via `CLAUDE_CODE_OAUTH_TOKEN`. We are still not using it as the substrate, because its only sandbox
modes are `vercel` and `docker`, and the Docker container has **no volume mounts at all**: env
passthrough is the sole channel in. A design-system Instrument is inherently environment-heavy — it
needs the real component library, the real Astryx CLI, the real MCP server and a real renderer — so
a mount-less container means reinstalling an entire pnpm workspace from scratch on every one of ~60
Runs per Sweep, plus solving screenshots and MCP inside the container. Git worktrees give all of
that for free against a repo whose dependencies already exist.

Two things we would have had to build regardless: `@vercel/agent-eval` reports no variance (only
`passRate` and `meanDuration`), and its transcript records turns, tool calls and file changes but
not tokens or cost. Divergence maths was always ours to write.

We keep Fixture folders `@vercel/agent-eval`-compatible — `PROMPT.md`, `EVAL.ts`, a `package.json`
with `"type": "module"` — so adopting it later is an adapter rather than a rewrite. Full findings:
`docs/research/agent-eval-keyless-viability.md`.

**Known unverified:** we rejected the Docker path partly on estimate. Nobody has measured how long a
Docker Run actually takes with a full Astryx workspace.
