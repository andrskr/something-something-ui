# The Instrument

How to operate the harness. For _why_ it is designed this way, read the map: `gh issue view 1`. For
vocabulary, read `CONTEXT.md` at the repo root and use its terms exactly — Foundation, Layer, Arm,
Fixture, Run, Sweep, Divergence, Discovery.

**Its job is to report honestly, not to produce a win** — see `docs/adr/0002-*`. A null result is a
legitimate outcome.

## Run one Fixture in one Arm

```bash
node harness/src/run.ts --fixture F001-overview --arm off
node harness/src/run.ts --fixture F001-overview --arm full --model sonnet --keep
```

`--arm` is `off` | `always-on` | `full`. `--keep` leaves the worktree for inspection. Output lands
in `harness/results/<fixture>__<arm>__<tag>/`: `summary.json`, `run.jsonl`, `diff.patch`, and a copy
of the app's `src/`.

Zero dependencies. Node 24 runs the TypeScript directly.

## Layout

| Path                           | What it is                                        |
| ------------------------------ | ------------------------------------------------- |
| `fixtures/<id>/`               | one Fixture; `_template/` is the contract         |
| `arms/arm2.md`, `arms/arm3.md` | the `ACME` block bodies appended per Arm          |
| `layer/`                       | the Layer under test — `design.md`, `references/` |
| `src/`                         | the Instrument                                    |
| `results/`                     | Run output (gitignored)                           |

**The Layer lives in `harness/layer/`, not in `apps/web/`.** If it sat in the app it would be
present in every Arm, including Arm 1, and there would be nothing to measure.

## The Fixture contract

Kept `@vercel/agent-eval`-compatible so adopting it later is an adapter, not a rewrite (ADR 0001).

| File           | Reaches the agent?                                             |
| -------------- | -------------------------------------------------------------- |
| `PROMPT.md`    | **yes** — its body is the Run's prompt, HTML comments stripped |
| `package.json` | yes — `"type": "module"` required by agent-eval                |
| `src/`         | yes, if present — the before-state of an edit Fixture          |
| `fixture.json` | **never** — persona, category, expectations, holdout           |
| `EVAL.ts`      | **never** — agent-eval grader                                  |
| `ideal/`       | **never** — curated reference rendering                        |

Grader-only files stay in `harness/fixtures/`; nothing copies them into the worktree.

Write prompts describing an **outcome**, never naming a component — "a page where the user opens
each question", not "an accordion". That is Astryx's own fairness rule.

## The three Arms

|                                   | off     | always-on | full                  |
| --------------------------------- | ------- | --------- | --------------------- |
| Astryx's `ASTRYX:START/END` block | present | present   | present               |
| `ACME:START/END` block            | absent  | `arm2.md` | `arm2.md` + `arm3.md` |
| `design.md`, `references/`        | absent  | absent    | present               |

Arm 3 contains Arm 2 contains Arm 1. Astryx's block is **never** edited — it is Foundation, and
varying it would test Astryx's discovery instead of ours.

**Keep `arm2.md` thin.** Only rules that must never be missed belong there. If it grows it absorbs
the effect and Arm 3 has nothing left to show.

## Rules that are not negotiable

- **Every Arm runs sealed.** `.claude`, `.agents` and `.vite-hooks` are stripped from the worktree,
  and the Run uses `--setting-sources project --disable-slash-commands --strict-mcp-config`. A naive
  Run inherits **82 slash commands**, a full agent roster and firing hooks; Arm 1 would not be "Off"
  at all. `run.ts` calls `assertSealed()` and refuses to report a leaked Run.
- **Slash commands are disabled in all three Arms.** The built-in `dataviz` skill triggers on
  "chart, graph, plot, dashboard" and would hand every Arm free guidance on our strongest rule.
  Built-ins cannot be disabled selectively.
- **An interrupted Run is rejected, not scored.** A killed Run yields a transcript with no result
  event, which parses to `turns 0, cost $0` — so it looks like the cheapest, fastest Run in the
  Sweep rather than a failure. `assertComplete()` throws instead. Re-run it.
- **`--model` and `--effort` are always explicit.** Both change silently with settings — a Run
  drifted from `claude-opus-5[1m]` to `claude-sonnet-5` when user settings were dropped.
  `assertSealed()` catches model drift; **effort is not reported in the transcript, so it cannot be
  verified after the fact** — which is exactly why it is always passed.
- **Use `vp check`, never `vp lint`.** `vp lint` is a Vite+ built-in that reports nothing here; a
  scorer wired to it silently passes everything.
- **`harness/fixtures/**` is excluded from `vp fmt` and `vp check`.** Fixture before-states are
  snapshots of generated pages; they only resolve inside a prepared worktree, so checking them in
  the repo's own context reports 66 errors that are not real. Do not "fix" them.
- **Score generated code in situ.** A route passes `vp check` in `src/routes/` and trips
  `react(only-export-components)` when copied aside. Lint results depend on location.
- **Never edit inside `ASTRYX:START/END`.** `astryx init` regenerates it verbatim.
- **Build before checking.** `vp run build` regenerates `routeTree.gen.ts`. A Run that adds a route
  fails type checking until it does, so checking first would falsely fail every greenfield Fixture
  in every Arm. `run.ts` builds first for this reason.

## Sweep parameters

Measured on the same prompt, Arm `off`, in `_calibration`:

|                     | Sonnet             | Opus               |
| ------------------- | ------------------ | ------------------ |
| turns / cost / wall | 43 / $1.10 / 315 s | 65 / $4.47 / 574 s |
| `check` / `build`   | pass / pass        | pass / pass        |

**The Sweep runs on `sonnet` at `--effort medium`, `--max-turns 80`.** Opus costs 4x for the same
verdict, and Divergence needs five Repeats, which is precisely what Opus makes unaffordable. A
**60-Run Sweep is ~$66 and ~5.3 h on Sonnet, versus ~$268 and ~9.6 h on Opus.**

**Spot-check on Opus**: one Run per Fixture in Arms `off` and `full` — 8 extra Runs, ~$36 — so we
can say the effect holds on the stronger model without paying 4x for everything.

Note the variance: the same prompt on Sonnet produced 60 turns /
$1.70 / 475 s in one Run and
43 / $1.10 / 315 s in another. **Single Runs are not comparable.** Five
Repeats is a floor, not a luxury.

## What a Run tells you

`summary.json` carries `costUsd`, `turns`, `durationMs`, full token `usage`, `toolCalls`,
`astryxCommands`, `mcpCalls`, `check`, `build`, the changed-file list, and `rateLimit`.

**`filesRead` is Discovery.** Claim (d) is whether the Run read `design.md` / `references/` — a
deterministic read from the transcript, no judge involved. It is the cheapest and most reliable of
the four claims.

## Known gaps

- No Sweep orchestrator yet: repeats, parallelism and rate-limit pacing are unbuilt. A
  `rate_limit_event` is emitted per Run and should drive pacing.
- No tests. `lib/arms.ts`, `lib/transcript.ts`, `lib/profile.ts` and `lib/divergence.ts` are pure
  and worth covering. `harness` is a workspace package now, so nothing blocks adding them.
- Dark theme is unshot. `CAMERA` fixes one theme; a second would double the picture count.
- No Ideal has been rendered through the camera yet — F001 carries the only one.
- `EVAL.ts` is carried for compatibility but never executed.
