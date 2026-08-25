# Spike: one Run end to end on a git worktree

Throwaway. Answers issue #4 only. Not the real runner.

**Verdict: the worktree path works. ADR 0001 holds.** One Run completes, builds, and reports more
than `@vercel/agent-eval` would have given us.

## Numbers

| Stage | Cost |
| --- | --- |
| `git worktree add` | **0.17 s**, 768 KB |
| `vp install` (warm pnpm store) | **29.8 s** |
| Agent Run (Sonnet, 60 turns) | **475 s**, **$1.70** |
| `vp build` | **6 s** |
| Format check | pass |
| `vp check` (lint + types) | **pass, clean** |

**Sweep projection**, 4 Fixtures x 5 Repeats x 3 Arms = 60 Runs: **~8.7 h serial, ~2.2 h at four
wide**; roughly **$100** of Sonnet-equivalent usage. Subscription-billed, so the real ceiling is rate
limits, not dollars. A `rate_limit_event` is emitted per Run and can pace the Sweep.

Hardlink-copying `node_modules` instead of installing was tried and **rejected**: 34 s, slower than
installing, and the binaries do not resolve.

## The environment leaks, badly, and must be sealed

A naive `claude -p` inherited **82 slash commands** — including `wayfinder`, `tdd`, `implement`,
`grilling` — plus a full agent roster and firing repo hooks. Arm 1 would not have been "Off" at all.

Sealing it took two moves together:

```
rm -rf .claude .agents .vite-hooks          # in the worktree
claude -p --setting-sources project --disable-slash-commands --strict-mcp-config --mcp-config .mcp.json --model <pinned>
```

Result: **0 slash commands, built-in agents only, hooks silent, Astryx MCP connected, and
`AGENTS.md` still reaching the model.**

Three traps found on the way:

- `--setting-sources ""` seals everything **but also disables `CLAUDE.md`/`AGENTS.md` discovery** —
  the exact mechanism Arm 2 depends on. Verified by denying all tools and asking: the model replied
  "NO PROJECT INSTRUCTIONS."
- `--setting-sources project` restores `AGENTS.md` but reinstates 71 project skills. Stripping
  `.claude/` and `.agents/` takes that to 47; the rest are built-ins and plugins, which
  `--setting-sources` does not govern. Only `--disable-slash-commands` removes those.
- **The model silently changed** from `claude-opus-5[1m]` to `claude-sonnet-5` when user settings were
  dropped. `--model` must be pinned explicitly or Arms are not comparable.

## The transcript is richer than `@vercel/agent-eval`'s

The `result` event carries `total_cost_usd`, full token usage (input, output, cache create, cache
read), `num_turns`, `duration_ms`, `duration_api_ms`, `permission_denials`, `subagent_stats` and
`stop_reason`. `@vercel/agent-eval` has **no tokens and no cost**. Every in-Run efficiency proxy the
map asks for is available for free. This strengthens ADR 0001 beyond the reason it was written.

## What the agent actually did

Prompt was outcome-first and named no component. The agent used the Foundation exactly as intended:
`astryx build`, `astryx template dashboard` (three times, plus `--skeleton`), three `astryx search`
calls, four `astryx component` lookups. It wrote a 337-line route using `Card`, `Divider`, `Grid`,
`Icon`, `Layout`/`HStack`/`VStack`, `StatusDot`, `Table` with `pixel`/`proportional`, and
`Heading`/`Text`. It added `recharts` itself — the dependency gap the map warned about. **It built.**

Two findings worth more than the build passing:

**The Astryx MCP server was connected and never called. Not once.** The agent reached for the CLI
every time. If that holds across Runs, telling the Layer to point at MCP is wasted ink, and
`astryx docs`-style CLI routing is where the value is.

**Every rule violation sat at the chart boundary.** Six raw values, all of them hex fallbacks inside
`var()` or a raw `fontSize`, all inside recharts props:

```
thisWeek: 'var(--color-data-categorical-blue, #0171E3)'
tick={{ fontSize: 12, fill: 'var(--color-text-secondary, #4E606F)' }}
```

The agent used tokens correctly everywhere Astryx owns the surface, and fell back to raw values
exactly where a third-party chart library does not understand StyleX tokens. Astryx has no opinion
there. **This is a real, reproducible gap the Foundation does not cover** — precisely the kind of
rule `design.md` must carry.

**And lint does not catch any of it.** `vp check` passes clean on this file. The raw hex values live
inside string literals passed to recharts props, which no lint rule inspects. So the two known traps
behaved in opposite directions to what the map assumed: the dependency gap was real and the agent
fixed it unprompted, while the lint gap did not appear at all. The deterministic scorer therefore has
to catch what lint structurally cannot — which is an argument for the scorer existing, not for
leaning on lint rules.

## Loose ends for the real runner

- **Stripping by deletion pollutes the diff.** `git status` in the worktree showed ~100 deleted skill
  files alongside the agent's two real changes. Extracting "what the Run produced" needs a cleaner
  mechanism than diffing the worktree.
- **Arm 3 wants a discoverable skill, but `--disable-slash-commands` removes all skills.** Enabling
  them reinstates 47 built-in and plugin commands. Arm 3's delivery mechanism has to resolve this.
- `num_turns` came back as exactly 60 against `--max-turns 60`, yet `stop_reason` was `end_turn` and
  `subtype` was `success`. Probably coincidence, but the real runner should set the cap generously and
  alarm when a Run lands on it.
- **`vp lint` is the wrong command** — it is a Vite+ built-in that reports nothing here. `vp check`
  is what actually lints and type-checks. A scorer wired to `vp lint` would silently pass everything.
- The captured artifact is stored as `.tsx.txt`. Copied out of `src/routes/` it trips
  `react(only-export-components)`, because route files legitimately export `Route` beside components.
  In its real location it is clean. Worth remembering: **lint results depend on file location**, so a
  scorer must evaluate generated code in situ, never in a copied-aside artifacts folder.
