/**
 * Run one Fixture in one Arm, on an isolated git worktree.
 *
 * Node harness/src/run.ts --fixture F001-overview --arm off [--model sonnet] [--repeat 1]
 *
 * Every stage cost was measured in issue #4: worktree 0.17s, install ~30s, Run ~475s, build ~6s.
 * Nothing here is parallel yet - the Sweep orchestrator is a later ticket.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { applyArm, type Arm, ARMS } from './lib/arms.ts';
import { assertSealed, parseTranscript } from './lib/transcript.ts';

const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const HARNESS = join(REPO, 'harness');
const APP = 'apps/web';

/** Config, hooks and skills that would otherwise leak into the Run. See issue #4. */
const STRIP = ['.claude', '.agents', '.vite-hooks'];

function sh(cmd: string, args: string[], cwd: string, quiet = true) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', stdio: quiet ? 'pipe' : 'inherit' });
  return { code: r.status ?? 1, out: r.stdout, err: r.stderr };
}

/**
 * The CLI accepts aliases but reports canonical ids, sometimes with a context suffix
 * (`claude-opus-5[1m]`). assertSealed compares against this, so aliases must resolve.
 */
function expectedModelId(model: string): string {
  const alias: Record<string, string> = {
    opus: 'claude-opus-5',
    sonnet: 'claude-sonnet-5',
    haiku: 'claude-haiku-4-5-20251001',
    fable: 'claude-fable-5',
  };
  return alias[model] ?? model;
}

const isArm = (v: string): v is Arm => (ARMS as readonly string[]).includes(v);

function arg(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  const v = i === -1 ? fallback : process.argv[i + 1];
  if (v === undefined) throw new Error(`missing --${name}`);
  return v;
}

function prepareWorktree(dir: string, fixtureDir: string, arm: Arm) {
  rmSync(dir, { recursive: true, force: true });
  sh('git', ['worktree', 'add', '--detach', dir, 'HEAD'], REPO);

  for (const p of STRIP) rmSync(join(dir, p), { recursive: true, force: true });

  const agentsPath = join(dir, APP, 'AGENTS.md');
  const blocks = {
    arm2: readFileSync(join(HARNESS, 'arms/arm2.md'), 'utf8'),
    arm3: readFileSync(join(HARNESS, 'arms/arm3.md'), 'utf8'),
  };
  writeFileSync(agentsPath, applyArm(readFileSync(agentsPath, 'utf8'), arm, blocks));

  if (arm === 'full') {
    cpSync(join(HARNESS, 'layer/design.md'), join(dir, APP, 'design.md'));
    cpSync(join(HARNESS, 'layer/references'), join(dir, APP, 'references'), { recursive: true });
  }

  // Edit Fixtures ship a before-state; greenfield ones do not.
  const before = join(fixtureDir, 'src');
  if (existsSync(before)) cpSync(before, join(dir, APP, 'src'), { recursive: true });

  sh('vp', ['install'], dir);

  // Baseline commit. Everything after this point is the agent's work, so the diff is
  // exact - no need to subtract Arm preparation from it. Solves the pollution issue #4 hit.
  sh('git', ['add', '-A'], dir);
  sh(
    'git',
    ['-c', 'user.email=harness@local', '-c', 'user.name=harness', 'commit', '-m', 'baseline'],
    dir,
  );
  return sh('git', ['rev-parse', 'HEAD'], dir).out.trim();
}

function main() {
  const fixture = arg('fixture');
  const armArg = arg('arm');
  if (!isArm(armArg)) throw new Error(`--arm must be one of ${ARMS.join(' | ')}`);
  const arm = armArg;
  const model = arg('model', 'sonnet');
  const maxTurns = arg('max-turns', '80');
  // Pinned, never inherited. Effort can be set in settings we do not control, and an
  // unpinned value makes two Arms incomparable for a reason nobody would think to check -
  // the same hazard that silently switched the model in issue #4.
  const effort = arg('effort', 'medium');

  const fixtureDir = join(HARNESS, 'fixtures', fixture);
  const prompt = readFileSync(join(fixtureDir, 'PROMPT.md'), 'utf8')
    .replaceAll(/<!--[\s\S]*?-->/g, '')
    .trim();
  const runId = `${fixture}__${arm}__${arg('tag', String(process.pid))}`;
  const out = join(HARNESS, 'results', runId);
  const wt = join(HARNESS, '.worktrees', runId);
  mkdirSync(out, { recursive: true });

  const t0 = Date.now();
  const baseline = prepareWorktree(wt, fixtureDir, arm);
  const tPrep = Date.now();

  const run = sh(
    'claude',
    [
      '-p',
      prompt,
      '--output-format',
      'stream-json',
      '--verbose',
      '--model',
      model,
      '--effort',
      effort,
      '--strict-mcp-config',
      '--mcp-config',
      join(wt, '.mcp.json'),
      '--setting-sources',
      'project',
      '--disable-slash-commands',
      '--permission-mode',
      'bypassPermissions',
      '--max-turns',
      maxTurns,
    ],
    join(wt, APP),
  );
  const tRun = Date.now();
  writeFileSync(join(out, 'run.jsonl'), run.out);

  const summary = parseTranscript(run.out);
  assertSealed(summary, expectedModelId(model));
  if (summary.turns >= Number(maxTurns)) console.warn(`WARN: Run hit the turn cap (${maxTurns})`);

  // Extract exactly what the Run produced.
  sh('git', ['add', '-A'], wt);
  writeFileSync(join(out, 'diff.patch'), sh('git', ['diff', '--cached', baseline], wt).out);
  const changed = sh('git', ['diff', '--cached', '--name-only', baseline], wt)
    .out.split('\n')
    .filter(Boolean);

  // Build FIRST. It regenerates routeTree.gen.ts, and a Run that adds a route fails type
  // checking until that happens - which would have falsely failed every greenfield Fixture
  // in every Arm. Measured: check-before-build errors, check-after-build is clean.
  const build = sh('vp', ['run', 'build'], wt).code === 0;
  // vp check, never vp lint - vp lint is a built-in that reports nothing here (issue #4).
  // Generated code is evaluated in situ; copying it aside changes lint results.
  const check = sh('vp', ['check'], wt).code === 0;

  // Paths come back absolute and worktree-specific; Discovery compares them across Runs.
  const rel = (p: string) => p.replace(`${wt}/`, '');
  summary.filesRead = summary.filesRead.map(rel);
  summary.filesWritten = summary.filesWritten.map(rel);

  const record = {
    runId,
    fixture,
    arm,
    model,
    effort,
    prepMs: tPrep - t0,
    runMs: tRun - tPrep,
    totalMs: Date.now() - t0,
    check,
    build,
    changed,
    ...summary,
  };
  writeFileSync(join(out, 'summary.json'), JSON.stringify(record, null, 2));
  cpSync(join(wt, APP, 'src'), join(out, 'src'), { recursive: true });

  console.log(
    JSON.stringify(
      {
        runId,
        arm,
        check,
        build,
        turns: summary.turns,
        costUsd: summary.costUsd,
        runMs: record.runMs,
        filesRead: summary.filesRead.length,
        changed: changed.length,
      },
      null,
      2,
    ),
  );

  if (process.argv.includes('--keep')) console.log(`worktree kept at ${wt}`);
  else sh('git', ['worktree', 'remove', '--force', wt], REPO);
}

main();
