# Can `@vercel/agent-eval` run keyless on a Claude subscription?

**Date:** 2026-08-25 **Question:** Can we use `@vercel/agent-eval` as an evaluation substrate
without per-run API costs, by driving a locally-authenticated agent CLI instead of an API key?

## Verdict first

**Yes. It is supported out of the box. No custom `registerAgent` adapter is needed.**

The built-in `claude-code` agent has a first-class OAuth mode. It reads `CLAUDE_CODE_OAUTH_TOKEN`
from the host environment and injects it into the sandbox. That token comes from
`claude setup-token`, which requires a Claude subscription and bills against the subscription, not
the API.

You do not need a local CLI adapter. You need one environment variable.

## Source basis

All code citations are from the real repository, cloned at commit `d425388`
(`Merge pull request #194`), which is `@vercel/agent-eval@2.2.0` — the version published to npm on
2026-08-24.

- Repository: `https://github.com/vercel-labs/agent-eval`
- Package: `https://registry.npmjs.org/@vercel/agent-eval`
- Paths below are relative to `packages/agent-eval/src/` unless stated otherwise.

Every claim is marked **VERIFIED** (I read the code or the doc) or **INFERRED** (I reasoned from
verified facts).

---

## 1. Current version

**VERIFIED.** The latest published version is **2.2.0**, published **2026-08-24T16:09:57.924Z**.
Source: npm registry metadata for `@vercel/agent-eval`, `dist-tags.latest` and `time`.

**VERIFIED.** There is a changelog. It is `packages/agent-eval/CHANGELOG.md` in the repository. The
project uses Changesets, so each entry links its PR and commit.

**VERIFIED.** What changed since 2.1.0 — exactly one release, 2.2.0, with one minor change
(`CHANGELOG.md:3-7`):

> Add a Vercel AI Gateway adapter for research evals with fx, including a pinned binary installer
> and saved-session transcript parser.

That is PR #193. It adds a sixth agent (`vercel-ai-gateway/fx`) for web-research evals. It does not
touch auth, sandboxing, or the fixture contract.

Recent releases that DO matter for this question:

| Version | Date       | Relevant change                                                                                                                                 |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.5.0   | 2026-08-12 | `registerAgent()` made public — custom `Agent` implementations under arbitrary string IDs (PR #181).                                            |
| 2.0.0   | 2026-08-19 | **Breaking:** `generatedFiles` is now `Record<string, Buffer>`, not `Record<string, string>`. `readFixtureFiles` returns `Map<string, Buffer>`. |
| 2.0.0   | 2026-08-19 | The `@vercel/agent-eval/eval` subpath became a real package export, with types for `toSatisfyCriterion` / `toScoreAtLeast` (PR #166).           |
| 2.1.0   | 2026-08-21 | Opt-in isolation for agent-bundled skills (`disableBundledSkills`).                                                                             |

---

## 2. Auth requirement — the `claude-code` code path

### The three auth modes

**VERIFIED.** `lib/agents/claude-code/agent.ts:20-26` documents three mutually-exclusive modes:

```
 *   1. Vercel AI Gateway  → ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN (+ empty ANTHROPIC_API_KEY)
 *   2. OAuth (CLAUDE_CODE_OAUTH_TOKEN present in the host env) → CLAUDE_CODE_OAUTH_TOKEN
 *   3. Direct API (fallback) → ANTHROPIC_API_KEY
```

**VERIFIED.** The key-name resolver, `lib/agents/claude-code/agent.ts:38-42`:

```typescript
    getApiKeyEnvVar(): string {
      if (useVercelAiGateway) return AI_GATEWAY.apiKeyEnvVar;
      if (process.env.CLAUDE_CODE_OAUTH_TOKEN) return 'CLAUDE_CODE_OAUTH_TOKEN';
      return ANTHROPIC_DIRECT.apiKeyEnvVar;
    },
```

**VERIFIED.** The sandbox environment builder, `lib/agents/claude-code/agent.ts:58-70`:

```typescript
    authEnv(options: AgentRunOptions): Record<string, string> {
      if (useVercelAiGateway) {
        return {
          ANTHROPIC_BASE_URL: AI_GATEWAY.baseUrl,
          ANTHROPIC_AUTH_TOKEN: options.apiKey,
          ANTHROPIC_API_KEY: '',
        };
      }
      if (process.env.CLAUDE_CODE_OAUTH_TOKEN) {
        return { CLAUDE_CODE_OAUTH_TOKEN: options.apiKey };
      }
      return { ANTHROPIC_API_KEY: options.apiKey };
    },
```

Both functions read `process.env` at call time. They agree on the mode by construction.

### Provenance of the OAuth mode

**VERIFIED.** This was added deliberately for subscription users. GitHub issue
`vercel-labs/agent-eval#54`, "Support CLAUDE_CODE_OAUTH_TOKEN for Claude Code agent", closed
2026-03-17. The issue body states the exact motivation:

> Claude Code CLI also supports `CLAUDE_CODE_OAUTH_TOKEN` for users with Claude Pro/Max
> subscriptions (via `claude setup-token`). This means subscription users can't run evals without a
> separate pay-as-you-go API key.
>
> This doesn't violate Claude Code's usage terms — agent-eval already spawns `claude --print` (the
> official CLI) inside the sandbox. We're not building a competing agent client or wrapping the SDK.
> We're just passing the correct env var so the official CLI can authenticate with the user's
> existing subscription.

The shipped code in 2.2.0 matches the patch proposed in that issue.

### The token itself

**VERIFIED (local CLI).** `claude setup-token --help` on Claude Code 2.1.245 prints:

> Set up a long-lived authentication token (requires Claude subscription)

**VERIFIED (Anthropic docs).** The Claude Code GitHub Actions documentation states that
`CLAUDE_CODE_OAUTH_TOKEN` authenticates with a Claude subscription on Pro, Max, Team, and Enterprise
plans, that you generate it with `claude setup-token` locally, and that "if you authenticate with an
OAuth token, runs use your Claude subscription instead of API billing." Source:
<https://code.claude.com/docs/en/github-actions>.

### Is `getApiKeyEnvVar` mandatory?

**VERIFIED.** It is mandatory, twice over. It is a required (non-optional) member of both public
interfaces:

- `lib/agents/types.ts:110-111` — on `Agent`:
  ```typescript
  /** Get agent-specific environment variable name for API key */
  getApiKeyEnvVar(): string;
  ```
- `lib/agents/plugin/contract.ts:96` — on `AgentDefinition`:
  ```typescript
  getApiKeyEnvVar(): string;
  ```

Neither has a `?`. TypeScript will reject an agent that omits it.

### What happens if the value is absent or empty?

**VERIFIED.** A **hard error, before `run()` is ever called**. Resolution first:

`lib/agents/shared.ts:47-49`

```typescript
export function resolveAgentApiKey(getApiKeyEnvVar: () => string): string | undefined {
  return process.env[getApiKeyEnvVar()] ?? process.env.VERCEL_OIDC_TOKEN;
}
```

Then the gate, `cli.ts:155-162`:

```typescript
const agent = getAgent(config.agent);
const apiKeyEnvVar = agent.getApiKeyEnvVar();
const apiKey = resolveAgentApiKey(agent.getApiKeyEnvVar);
if (!apiKey) {
  console.error(
    chalk.red(`${apiKeyEnvVar} (or VERCEL_OIDC_TOKEN) environment variable is required`),
  );
  console.error(chalk.gray(`Get your API key at: https://vercel.com/dashboard -> AI Gateway`));
  process.exit(1);
}
```

The `run-all` path is softer — it skips instead of exiting, `cli.ts:395-399`:

```typescript
        const apiKey = resolveAgentApiKey(agent.getApiKeyEnvVar);
        if (!apiKey) {
          console.error(chalk.red(`${apiKeyEnvVar} (or VERCEL_OIDC_TOKEN) not set, skipping ${baseExperimentName}`));
```

Note the two escape valves. First, `?? process.env.VERCEL_OIDC_TOKEN` — any agent passes the gate if
`VERCEL_OIDC_TOKEN` is set. Second, the check is `!apiKey`, a plain falsy test. Any non-empty string
passes. **INFERRED:** a custom keyless agent satisfies this gate with a dummy value such as
`MY_AGENT_TOKEN=unused`.

**VERIFIED.** The programmatic API has **no** such gate. `runExperiment()` takes `apiKey: string` as
a plain option (`lib/runner.ts:82`) and passes it straight through to `agent.run()`
(`lib/runner.ts:201`). If you drive the framework as a library instead of through its CLI, nothing
validates the key at all.

---

## 3. The `registerAgent` escape hatch

### Signature and required fields

**VERIFIED.** `lib/agents/registry.ts:13-22` — the whole implementation:

```typescript
export function registerAgent(agent: Agent): void {
  if (!agent.name.trim()) {
    throw new Error('Agent name must be a non-empty string.');
  }
  agents.set(agent.name, agent);
}
```

The only validation is a non-empty name. Re-registration replaces silently, by design.

**VERIFIED.** `Agent` requires five members (`lib/agents/types.ts:100-119`): `name`, `displayName`,
`run()`, `getApiKeyEnvVar()`, `getDefaultModel()`, and `definition: AgentDefinition`.

**VERIFIED.** `AgentDefinition` (`lib/agents/plugin/contract.ts:71-129`) requires: `name`,
`displayName`, `defaultModel`, `o11yAgentName`, `runnerPath`, `getApiKeyEnvVar()`, `install()`,
`configFiles()`, `authEnv()`. Optional: `bundledSkillsControl`, `requiresWebResearch`,
`supportsCrossAgentJudge`, `runnerExtra()`, `fingerprintExtra()`.

**VERIFIED.** The README documents a stub definition that satisfies the contract with no-ops —
`install: () => []`, `configFiles: () => []`, `authEnv: () => ({})`, and a literal
`runnerPath: '/path/to/run.mjs'` (README.md, "Custom agents" section, lines 338-394). So the
`definition` half can be inert when your own `run()` does not use the orchestrator.

### `run()` contract

**VERIFIED.** `lib/agents/types.ts:108`:

```typescript
  run(fixturePath: string, options: AgentRunOptions): Promise<AgentRunResult>;
```

It receives an absolute path to the fixture directory on the **host** filesystem, plus
`AgentRunOptions` (`lib/agents/types.ts:11-57`): `prompt`, `model?`, `modelPolicy?`, `timeout`,
`apiKey`, `setup?`, `scripts?`, `validation?`, `signal?`, `sandbox?`, `webResearch?`,
`disableBundledSkills?`, `agentOptions?`, `judge?`.

It must return `AgentRunResult` (`lib/agents/types.ts:70-95`). Only three fields are required:
`success: boolean`, `output: string`, `duration: number`. Everything else is optional —
`transcript?`, `error?`, `testResult?`, `scriptsResults?`, `sandboxId?`,
`generatedFiles?: Record<string, Buffer>`, `deletedFiles?`, `observedModel?`, `modelRepair?`.

### Could `run()` just spawn the local `claude` binary?

**VERIFIED — yes, mechanically.** `run()` is an ordinary host-side async function. Nothing
constrains what it does. The framework never inspects how the result was produced.

**VERIFIED — but you inherit the whole orchestrator's job.** The generic orchestrator
(`lib/agents/plugin/orchestrator.ts`, 495 lines) does eleven steps that a bare `claude -p` spawn
does not. Read `runOnce` at `lib/agents/plugin/orchestrator.ts:276-495`:

1. `collectLocalFiles` + `splitTestFiles` — withhold `EVAL.ts` / `EVAL.tsx` / `PROMPT.md`.
2. `createSandbox`.
3. `uploadFiles`, `initGitAndCommit` (the baseline for the diff), user `setup()`,
   `prepareNeutralWorkspace`.
4. Install steps and config files.
5. `verifyNoTestFiles` — a leak guard.
6. Ship `run.mjs` into the sandbox.
7. Invoke it with the auth env.
8. Read back the `RunnerResult`.
9. Non-zero exit becomes a failed result, not a throw.
10. Upload test files, write the vitest config, inject `__agent_eval__/results.json`, ship the judge
    runtime, run validation.
11. `captureGeneratedFiles` via `git diff`.

**This is the real cost of the custom-agent route.** Of those helpers, only some are public.
`index.ts:65-76` exports `createSandbox`, `collectLocalFiles`, `splitTestFiles`,
`verifyNoTestFiles`. But `runValidation`, `captureGeneratedFiles`, `createVitestConfig`,
`initGitAndCommit`, `injectTranscriptContext`, and `prepareNeutralWorkspace` are **not** exported —
`index.ts:86` re-exports only the two constants `TRANSCRIPT_CONTEXT_DIR` and
`TRANSCRIPT_CONTEXT_PATH` from `shared.js`. You would reimplement roughly half the orchestrator.

### Hard blockers for a custom keyless agent

**VERIFIED.** The API-key gate at `cli.ts:158` runs _before_ `run()`. It is a truthiness check on
`process.env[getApiKeyEnvVar()] ?? process.env.VERCEL_OIDC_TOKEN`. **INFERRED:** trivially satisfied
with a dummy value. Not a blocker.

**VERIFIED — env injection does not break a credentials-file CLI.** Two facts:

- The neutral environment is tiny. `lib/agents/shared.ts:146`:
  ```typescript
  const neutralEnv = { USER: 'user', LOGNAME: 'user' };
  ```
  It does not touch `HOME`, so `~/.claude/.credentials.json` stays reachable.
- The merged run environment is `lib/agents/plugin/orchestrator.ts:382`:
  ```typescript
  const runEnv = { ...def.authEnv(options), ...neutralWorkspace.env };
  ```
  `authEnv()` returning `{}` injects nothing. Nothing is unset or blanked.

**One caveat, VERIFIED.** In gateway mode the built-in Claude definition sets
`ANTHROPIC_API_KEY: ''` (`claude-code/agent.ts:63`). An empty string set explicitly could confuse a
CLI that checks for key presence. That path is gateway-only. It does not apply to the OAuth path.

**The real blocker is the container, not the env.** See section 4.

---

## 4. Sandbox modes

**VERIFIED.** There are exactly **two** backends. `lib/sandbox.ts:20` and `lib/types.ts:99`:

```typescript
export type SandboxBackend = 'vercel' | 'docker';
```

The config value `'auto'` is a resolution strategy, not a third backend (`lib/sandbox.ts:314-326`):

```typescript
export function resolveBackend(options?: SandboxOptions): SandboxBackend {
  if (options?.backend && options.backend !== 'auto') {
    return options.backend;
  }
  if (process.env.VERCEL_TOKEN || process.env.VERCEL_OIDC_TOKEN) {
    return 'vercel';
  }
  return 'docker';
}
```

Your notes said "Docker, free, or Vercel Sandbox". **The "free" option is not a third mode — it is
Docker.** README.md line 794 is the source of that phrasing:

> ```
> # Option 1: Use Docker (free, no account needed)
> # Just set sandbox: 'docker' in your experiment config, that's it!
> ```

| Backend  | Requires                                                     | Notes                                                                   |
| -------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `vercel` | `VERCEL_TOKEN` or `VERCEL_OIDC_TOKEN` (plus team/project ID) | Remote sandbox via `@vercel/sandbox`.                                   |
| `docker` | A running Docker daemon. No token, no account.               | Pulls `node:20-slim` or `node:24-slim` (`lib/docker-sandbox.ts:17-18`). |

### Is there a local-filesystem mode?

**VERIFIED: no.** There is no third enum member, no `local` branch in `createSandbox`
(`lib/sandbox.ts:374-391`), and no worktree or temp-dir path anywhere in `lib/`. Every built-in run
goes through a container or a remote sandbox.

### Can a container see local CLI credentials?

**VERIFIED: no volume mount exists.** `lib/docker-sandbox.ts:95-103` is the entire container spec:

```typescript
this.container = await this.docker.createContainer({
  Image: imageName,
  Cmd: ['sleep', 'infinity'],
  WorkingDir: CONTAINER_WORKDIR,
  Tty: true,
  HostConfig: {
    AutoRemove: true,
  },
});
```

There is no `Binds`, no `Mounts`, and no option to supply either. `DockerSandboxOptions` carries
only `timeout` and `runtime`. So you **cannot** mount `~/.claude/.credentials.json` or a macOS
keychain into the sandbox. There is no documented mechanism and no undocumented one.

**VERIFIED: env passthrough does exist**, and it is the supported channel.
`lib/docker-sandbox.ts:226-238` passes a per-exec `Env` array built from the caller's map. That is
how `authEnv()` reaches the CLI.

**This is why `CLAUDE_CODE_OAUTH_TOKEN` is the answer and a mounted credentials file is not.** The
OAuth token is a string. Strings pass through env. Credentials files do not pass through anything.

---

## 5. The judge

**VERIFIED: the judge needs no separate key by default.** By default it _is_ the codegen agent, in
the _same sandbox_, reusing the _same_ `run.mjs` and the _same_ credentials.

`lib/agents/plugin/orchestrator.ts:116-131` — the self-grading branch:

```typescript
  if (!spec || (spec.agent ?? def.name) === def.name) {
    const judgeOptions = spec ? { ...options, model: spec.model } : options;
    return {
      judgeDef: def,
      judgeOptions,
      isSelf: true,
      authEnv: def.authEnv(judgeOptions),
      runnerSource: null,
      ...
```

The judge's auth environment is set on the vitest process so children inherit it
(`lib/agents/plugin/orchestrator.ts:423`):

```typescript
const validationEnv = { ...judgeRuntime.authEnv, ...neutralWorkspace.env };
```

**INFERRED, with high confidence:** under the OAuth mode, judge runs also bill to the subscription.
`authEnv()` is the same function, and it returns `{ CLAUDE_CODE_OAUTH_TOKEN: ... }` for both roles.

**VERIFIED: a pinned judge resolves its own key.** `lib/agents/plugin/orchestrator.ts:134-137`:

```typescript
const judgeDef = getAgent(spec.agent!).definition;
assertBundledSkillsControl(judgeDef, options.disableBundledSkills);
assertCrossAgentJudgeSupport(judgeDef);
const judgeApiKey = resolveAgentApiKey(judgeDef.getApiKeyEnvVar) ?? '';
```

Note `?? ''` — a missing judge key does **not** throw here. It silently becomes an empty string.

**VERIFIED: `judge.agent` accepts a custom registered agent.** It is a plain registry lookup,
`getAgent(spec.agent!)`. `assertCrossAgentJudgeSupport` (`plugin/contract.ts:152-156`) only rejects
when `supportsCrossAgentJudge === false`, so leaving it `undefined` passes.

**VERIFIED — important limitation.** A custom agent used as a judge does **not** run its host-side
`run()`. The judge is invoked _inside the sandbox_ by `eval-helper.mjs`, which spawns the runner
script by path (`lib/agents/eval-helper.mjs:159-161`):

```javascript
  const res = spawnSync('node', [runnerPath, JSON.stringify(input)], {
    ...
    env: process.env,
```

So a custom judge must supply a real, working `definition.runnerPath` — a zero-dependency `run.mjs`
that runs in the sandbox. A host-side-only custom agent cannot serve as a judge.

**VERIFIED: judge counts as one full agent invocation per assertion.** README, "Agentic LLM judge":
"Each judge assertion re-invokes the _same agent_ that did the codegen, **in the same sandbox**."
Budget accordingly — assertions are not free even on a subscription; they consume rate limit.

---

## 6. Fixture layout — the on-disk contract

### Required files

**VERIFIED.** `lib/types.ts:243`:

```typescript
export const REQUIRED_EVAL_FILES = ['PROMPT.md', 'EVAL.ts', 'package.json'] as const;
```

Three files, in the fixture directory root:

| File                        | Required                    | Rule                                                             |
| --------------------------- | --------------------------- | ---------------------------------------------------------------- |
| `PROMPT.md`                 | Always                      | Case-sensitive, uppercase. It is also the discovery marker.      |
| `EVAL.ts` **or** `EVAL.tsx` | Unless `validation: 'none'` | Exactly one. Use `.tsx` if any test needs JSX.                   |
| `package.json`              | Always                      | Must contain `"type": "module"`.                                 |
| anything else               | Optional                    | Starter code, config, assets. Uploaded as the agent's workspace. |

### Discovery

**VERIFIED.** `lib/fixture.ts:45-84`. `discoverFixtures()` walks `evals/` recursively. A directory
is a fixture **if and only if it contains `PROMPT.md`**. If it does not, the walk recurses into it.
Directories and files starting with `.` are skipped. So nested names like `flags/create-flag` work,
and the fixture name is the path relative to `evals/`. Results are sorted.

**VERIFIED.** Case matching is strict on every platform. `existsWithExactCase`
(`lib/fixture.ts:31-38`) does `readdirSync(dir).includes(fileName)` rather than `existsSync`,
precisely so `prompt.md` fails on macOS. Do not lowercase these filenames.

### `package.json`

**VERIFIED.** `lib/fixture.ts:124-148`. Only one field is checked:

```typescript
if (pkg.type !== 'module') {
  return { isModule: false, error: 'package.json must have "type": "module"' };
}
```

Invalid JSON is a distinct error. Everything else — name, version, deps, scripts — is unchecked by
the validator, though `npm install` runs against it in the sandbox (`claude-code/agent.ts:48`), so
declared dependencies must resolve.

### What is withheld from the agent

**VERIFIED.** `lib/sandbox.ts:51-57`:

```typescript
export const TEST_FILE_PATTERNS = ['EVAL.ts', 'EVAL.tsx', 'PROMPT.md'];
```

with the comment:

> - PROMPT.md: Contains the task - agent receives this via CLI argument, not as a file
> - EVAL.ts/tsx: Validation tests - must be hidden so agent can't "cheat"

These are split out before upload (`orchestrator.ts:309`), a leak guard runs before the agent starts
(`verifyNoTestFiles`, `orchestrator.ts:359`), and they are uploaded only at validation time
(`orchestrator.ts:425`).

**VERIFIED — do not confuse two similar lists.** `EXCLUDED_FILES` (`lib/types.ts:250`) is for local
fixture introspection, not sandbox uploads. The comment at `lib/types.ts:246-248` says so
explicitly. `IGNORED_PATTERNS` (`lib/sandbox.ts:38-49`) is the upload ignore list: `.git`, `.next`,
`node_modules`, `.DS_Store`, `*.log`, `build`, `dist`, `pnpm-lock.yaml`, `package-lock.json`.
**Lockfiles are not uploaded.**

### What `EVAL.ts` must export

**VERIFIED: nothing.** It is a plain Vitest file. It exports no config object. It runs with the
fixture root as cwd, so assertions use relative paths. From the README example:

```typescript
import { test, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';

test('Button component exists', () => {
  expect(existsSync('src/components/Button.tsx')).toBe(true);
});
```

Two extra surfaces are available inside `EVAL.ts`:

1. **Behavior assertions** — read `__agent_eval__/results.json` (see section 7).
2. **Judge matchers** — `import { environment, transcript } from '@vercel/agent-eval/eval'`, then
   `await expect(environment).toSatisfyCriterion('...')` or
   `await expect(environment).toScoreAtLeast('...', 0.8)`. Types are declared in
   `lib/agents/eval-helper.d.mts:44-66` and augment Vitest's `Assertion` automatically since 2.0.0.

### Authoring today, running later

**INFERRED, high confidence.** The contract is small and stable: three filenames, one `package.json`
field, one discovery rule, plain Vitest. You can author agent-eval-compatible fixtures now and run
them with your own runner first. Two rules keep them portable:

- Your own runner must also withhold `PROMPT.md` and `EVAL.ts`/`EVAL.tsx` from the agent's
  workspace, or your results will not compare to agent-eval's.
- Keep `EVAL.ts` free of judge matchers until you run under agent-eval. Those need
  `__agent_eval__/eval-helper.mjs` and `judge-config.json` present in the workspace.

---

## 7. Transcript observability

### There are two different files named `results.json`

This trips people up. Be precise about which one you mean.

**(a) In-sandbox, `__agent_eval__/results.json`.** Written before validation so `EVAL.ts` can assert
on agent behavior.

**VERIFIED.** Its complete shape is one key. `lib/agents/shared.ts:279-290`:

```typescript
const transcript = rawTranscript ? parseTranscript(rawTranscript, agentName, model) : null;

const context = {
  o11y: transcript?.summary ?? null,
};

await sandbox.writeFiles({
  [TRANSCRIPT_CONTEXT_PATH]: JSON.stringify(context, null, 2),
});
```

`results.o11y` is a `TranscriptSummary`. **VERIFIED — that is every field**
(`lib/o11y/types.ts:98-125`):

```typescript
export interface TranscriptSummary {
  totalTurns: number;
  toolCalls: Record<ToolName, number>;
  totalToolCalls: number;
  webFetches: WebFetchInfo[];
  filesRead: string[];
  filesModified: string[];
  shellCommands: ShellCommandInfo[];
  errors: string[];
  thinkingBlocks: number;
}
```

Against your checklist:

| You wanted          | Captured?    | Where                                                                                                         |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| Number of turns     | **Yes**      | `totalTurns`                                                                                                  |
| Tool calls          | **Yes**      | `toolCalls` (per canonical name), `totalToolCalls`                                                            |
| Files read          | **Yes**      | `filesRead: string[]`                                                                                         |
| Files modified      | **Yes**      | `filesModified: string[]`                                                                                     |
| Shell commands      | **Yes**      | `shellCommands: { command, exitCode?, success? }[]`                                                           |
| Token usage         | **No**       | Absent from the type. `grep` for `usage`/`token`/`cost` in `lib/o11y/parsers/claude-code.ts` returns nothing. |
| Cost                | **No**       | Same.                                                                                                         |
| Wall-clock duration | **Not here** | Not in `TranscriptSummary`. It lives on the run result — see below.                                           |

Also present but easy to miss: `webFetches`, `errors`, `thinkingBlocks`, and per-tool-call
`durationMs` on individual `TranscriptEvent`s (`lib/o11y/types.ts:49`) — the raw events keep more
than the summary rolls up.

**VERIFIED.** `results.o11y` is `null` when no transcript exists, and injection is best-effort —
`lib/agents/shared.ts:291-293` swallows failures so a broken transcript never fails the eval.

**(b) On-disk, per run: `results/<experiment>/<timestamp>/<eval>/run-N/result.json`.**

**VERIFIED.** It is an `EvalRunResult` (`lib/types.ts:269-301`) plus an injected `o11y` field
(`lib/results.ts:217`, `lib/results.ts:252`). `EvalRunResult` carries `status`, `error?`,
**`duration` (seconds)**, `model?`, `modelPolicy?`, `requestedModel?`, `observedModel?`,
`modelRepair?`, `transcriptPath?`, `transcriptRawPath?`, `outputPaths?`, `analysis?`, `metadata?`.

So wall-clock duration **is** captured, per run, in seconds — just not in the o11y summary. It is
set by the orchestrator as `Date.now() - startTime` (`AgentRunResult.duration`,
`lib/agents/types.ts:79-80`).

The full run directory (README, "Results"):

```
run-1/
  result.json           # run result + o11y summary
  transcript.json       # parsed/structured transcript
  transcript-raw.jsonl  # raw agent output
  outputs/eval.txt      # EVAL.ts output
  outputs/scripts/*.txt # npm script output
  project/              # agent-generated files, only if copyFiles is set
```

### Does a custom agent get this for free?

**VERIFIED: no. It gets about half.**

- **Its `run()` must populate the transcript itself.** `injectTranscriptContext` is called by the
  orchestrator (`orchestrator.ts:427`) using `def.o11yAgentName`, from `runnerResult.transcript`. A
  custom `run()` that bypasses `runWithDefinition` never reaches that line, so
  `__agent_eval__/results.json` is never written and `EVAL.ts` behavior assertions all fail.
- **`duration` is trivially free** — the custom `run()` returns it.
- **Host-side parsing is partly free.** `lib/results.ts` re-parses `AgentRunResult.transcript` when
  saving. So if your `run()` returns a transcript string in a _recognized format_, the on-disk
  `result.json` gets `o11y` populated without further work.
- **The format list is closed.** `lib/o11y/parsers/index.ts:37-44` registers exactly six parsers:
  `claude-code`, `codex`, `opencode`, `fx`, `gemini`, `cursor`. Lookup takes the segment after the
  last `/` (`parsers/index.ts:58`). **INFERRED:** a custom agent that shells out to the real
  `claude` CLI should set `o11yAgentName: 'claude-code'` and return the CLI's JSONL verbatim — then
  parsing works unchanged. The README's own custom-agent stub does exactly this.

---

## 8. Repeats and variance

### How `runs` and `earlyExit` work

**VERIFIED.** Defaults, `lib/types.ts` `ExperimentConfig`:

```typescript
  /** How many times to run each eval. @default 1 */
  runs?: number;
  /** Stop after first successful run? @default true */
  earlyExit?: boolean;
```

**VERIFIED.** All attempts are built up front and launched **concurrently**, not sequentially
(`lib/runner.ts:154-159`, then `lib/runner.ts:328`):

```typescript
  for (const fixture of fixtures) {
    for (let i = 0; i < config.runs; i++) {
      attempts.push({ fixture, runIndex: i });
    }
  }
  ...
  const results = await Promise.all(attempts.map(runOne));
```

Concurrency is throttled only if a `StartRateLimiter` is supplied (`lib/runner.ts:307-308`).

**VERIFIED.** `earlyExit` aborts siblings on the first pass, per fixture (`lib/runner.ts:318-321`):

```typescript
      if (config.earlyExit && result.runData.result.status === 'passed') {
        emit({ type: 'experiment:earlyExit', ... });
        abortControllers.get(attempt.fixture.name)!.abort();
      }
```

and then truncates the counted list at the first pass (`lib/runner.ts:354-357`):

```typescript
// With earlyExit, stop counting after first pass
if (config.earlyExit && result.runData.result.status === 'passed') {
  break;
}
```

Aborted attempts are excluded from the summary entirely (`lib/runner.ts:337-339`).

### Is per-eval score a pass rate?

**VERIFIED: yes.** `lib/results.ts:88-96`:

```typescript
	const passedRuns = runs.filter((r) => r.status === 'passed').length;
	...
		passRate: runs.length > 0 ? (passedRuns / runs.length) * 100 : 0,
		meanDuration: runs.length > 0 ? totalDuration / runs.length : 0,
```

### Variance and spread

**VERIFIED: there is none.** `EvalSummary` (`lib/types.ts:327-340`) has `totalRuns`, `passedRuns`,
`passRate`, `meanDuration`, and the raw `runs: EvalRunData[]`. No standard deviation, no confidence
interval, no per-run spread statistic anywhere in `lib/results.ts`.

**Consequence for measuring consistency — this is the decision-relevant part.** Since you want
output consistency across repeated runs:

1. **You must set `earlyExit: false`.** With the default `true`, a fixture that passes on run 1
   reports `1/1 = 100%` and discards the other N-1 runs. That is the opposite of a consistency
   measurement.
2. **You must compute spread yourself.** The raw material is there — `EvalSummary.runs` is the full
   `EvalRunData[]`, and each run's files land on disk. `onRunComplete` (`lib/types.ts:92-93`) is the
   supported hook for per-run custom analysis; it can return an `EvalRunData` and attach `analysis`
   / `metadata` (`lib/types.ts:298-301`) that persists into `result.json`.
3. **Runs are concurrent.** N parallel Claude Code sessions will hit subscription rate limits.
   Supply a `StartRateLimiter` (exported from `index.ts:121`).

---

## 9. The playground viewer

**VERIFIED: it is a local Next.js app. No deployment. No token.**

- **Package:** `@vercel/agent-eval-playground`, a separate workspace package, version 0.1.3, MIT.
- **Launch:** `npx @vercel/agent-eval playground`, which shells out to
  `npx @vercel/agent-eval-playground` (`cli.ts:275-280`). Or invoke the playground package directly.
- **Flags:** `--results-dir` (default `./results`), `--evals-dir` (default `./evals`), `--port`
  (default `3000`), `--watch` for live reload (`packages/playground/bin.mjs`).
- **How it runs:** `next start` on the pre-built `.next` that ships in the tarball (`bin.mjs`, and
  `files` in `packages/playground/package.json`). No build step for you.
- **Architecture:** "Server Components for all data fetching (`lib/data.ts` reads `fs` directly)…
  **No API routes** — all data is read server-side" (`packages/playground/README.md`). It reads your
  results directory off disk. It calls no service and needs no credential.

**VERIFIED — pages available:** `/` dashboard, `/experiments`, `/experiments/[name]/[timestamp]`,
`/evals`, `/evals/[name]`, `/compare` (two runs side by side with pass-rate deltas), and
`/transcript/[experiment]/[timestamp]/[evalName]/[run]`.

**INFERRED — as a demo/report site.** It works as a local demo today with zero setup. As a
_published_ report site it is a poor fit: it is `next start`, not a static export, and its data
layer reads the filesystem at request time. You would need to host a Node server with the results
directory mounted. If the goal is a shareable artifact, build your own static renderer over
`summary.json` and `result.json` — both are stable, documented JSON. Use the playground for local
inspection in the meantime.

**Not verified:** I did not run the playground. Claims about its pages come from its README and
component filenames, which agree with each other.

---

## 10. Bottom line

### Verdict: (a) supported.

"agent-eval as substrate, keyless, driving a subscription-authenticated Claude Code CLI" is a
**supported configuration of the built-in `claude-code` agent**. It was implemented deliberately in
response to issue #54 and it ships in 2.2.0.

The one correction to the framing of the question: it does **not** drive your _local_ CLI. It
installs a fresh Claude Code CLI inside a sandbox and hands it your subscription OAuth token. The
subscription is what travels, not the machine. For cost purposes that is the same outcome — runs
bill against the subscription, not the API.

### Minimal setup

```bash
claude setup-token                     # once; requires a Claude subscription
export CLAUDE_CODE_OAUTH_TOKEN=<token> # or put it in .env.local
```

```typescript
// experiments/my-eval.ts
import type { ExperimentConfig } from '@vercel/agent-eval';

const config: ExperimentConfig = {
  agent: 'claude-code', // NOT 'vercel-ai-gateway/claude-code' — gateway mode ignores OAuth
  sandbox: 'docker', // no VERCEL_TOKEN needed; needs a running Docker daemon
  runs: 5,
  earlyExit: false, // required if you are measuring consistency
};

export default config;
```

Two conditions remain, and neither is an API key:

1. **Docker must be running.** There is no local-filesystem sandbox. This is the only genuine
   infrastructure requirement.
2. **The failure classifier is disabled** without `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`
   (`lib/classifier.ts:23-25`). Infra failures and rate limits will not be auto-detected and
   filtered. Given N parallel runs against a subscription rate limit, expect to triage those
   yourself.

### If you still want a truly local, container-free runner

Then the verdict is **(b) achievable with a custom `registerAgent` adapter**, at moderate cost.
Register an `Agent` whose `run()` spawns `claude -p` in a local git worktree.

- **Effort:** roughly 250-400 lines. You reimplement steps 1, 3, 5, 10, and 11 of `runOnce`
  (withhold test files, git baseline, leak guard, run vitest, capture the diff) because those
  helpers are not exported from `index.ts`. Set `o11yAgentName: 'claude-code'` and return the CLI's
  JSONL so transcript parsing works unchanged.
- **What you lose:** the agentic judge. `eval-helper.mjs` spawns `node <runnerPath>` _inside the
  sandbox_ (`eval-helper.mjs:159`), so `toSatisfyCriterion` / `toScoreAtLeast` need a real
  in-sandbox `run.mjs`. A host-side-only adapter cannot serve them.
- **Not blocked by:** the API-key gate (a dummy env value passes `!apiKey`), or env injection (the
  neutral env is only `USER` and `LOGNAME`; `HOME` is untouched, so `~/.claude/.credentials.json` is
  reachable).

### Smallest change that would unblock the container-free path

Export the six orchestrator helpers that are already written and already generic: `runValidation`,
`captureGeneratedFiles`, `createVitestConfig`, `initGitAndCommit`, `injectTranscriptContext`, and
`prepareNeutralWorkspace` from `index.ts`. They live in `lib/agents/shared.ts` and take a
`Sandbox`-shaped argument, which is already a public interface. Today `index.ts:86` exports only the
two constants from that module. One line of exports would cut the custom-adapter effort by more than
half.

But for the stated goal — no per-run API cost — you do not need any of that. Set
`CLAUDE_CODE_OAUTH_TOKEN` and start Docker.

---

## Confidence and gaps

**Not verified — flagged honestly:**

- I did not execute an eval end to end. Every claim about behavior comes from reading 2.2.0 source,
  not from a run. The highest-value next step is a single `--smoke` run with
  `CLAUDE_CODE_OAUTH_TOKEN` set and `sandbox: 'docker'`.
- I did not confirm that `npm install -g @anthropic-ai/claude-code` inside `node:24-slim` produces a
  CLI version that honors `CLAUDE_CODE_OAUTH_TOKEN`. The install pulls `latest`
  (`claude-code/agent.ts:46`), which is unpinned. A future CLI could change auth handling.
  `agentOptions.cliPackage` overrides the package if you need to pin.
- I did not test whether Anthropic's rate limits tolerate N concurrent subscription-authenticated
  sessions from one token. Treat `runs: 5` as untested and add a `StartRateLimiter`.
- The playground was not launched.
