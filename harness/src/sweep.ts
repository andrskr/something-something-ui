/**
 * Run a Sweep: every Fixture, in every Arm, repeated.
 *
 * Node harness/src/sweep.ts --pilot # F001 x 5 x 3 = 15 Runs node harness/src/sweep.ts --full # 4 x
 * 5 x 3 = 60 Runs node harness/src/sweep.ts --fixture F001-overview --repeats 3 --concurrency 2
 *
 * Resumable: a Run whose summary.json already exists is skipped, so an interrupted Sweep continues
 * rather than starting over.
 */
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const RESULTS = join(REPO, 'harness', 'results');
const LOGS = join(RESULTS, '_logs');
const ARMS = ['off', 'always-on', 'full'] as const;
const PILOT = ['F001-overview'];
const FULL = ['F001-overview', 'F002-transactions', 'F003-settings', 'F004-extend-overview'];

/** Two was measured safe; four produced interruptions. Raise only with evidence. */
const DEFAULT_CONCURRENCY = 2;
/** A Run interrupted by anything gets another chance, but a broken Fixture must not loop. */
const MAX_ATTEMPTS = 3;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const sleep = async (ms: number) =>
  new Promise((r) => {
    setTimeout(r, ms);
  });

function flag(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

interface Job {
  fixture: string;
  arm: string;
  tag: string;
  runId: string;
}

function plan(): Job[] {
  let fixtures = [flag('fixture', PILOT[0])];
  if (process.argv.includes('--full')) fixtures = FULL;
  else if (process.argv.includes('--pilot')) fixtures = PILOT;
  const repeats = Number(flag('repeats', '5'));
  const jobs: Job[] = [];
  for (const fixture of fixtures) {
    for (const arm of ARMS) {
      for (let r = 1; r <= repeats; r += 1) {
        const tag = `s${r}`;
        jobs.push({ fixture, arm, tag, runId: `${fixture}__${arm}__${tag}` });
      }
    }
  }
  return jobs;
}

/**
 * Spawn the Run in its own process group.
 *
 * Two Runs died when a wait in the _parent_ timed out and the SIGTERM reached the whole group. A
 * Run must outlive its supervisor being killed, so `detached` is load-bearing, not tidiness.
 */
async function runOnce(job: Job, attempt: number): Promise<boolean> {
  mkdirSync(LOGS, { recursive: true });
  const log = openSync(join(LOGS, `${job.runId}.a${attempt}.log`), 'a');
  const child = spawn(
    'node',
    [
      join(REPO, 'harness/src/run.ts'),
      '--fixture',
      job.fixture,
      '--arm',
      job.arm,
      '--tag',
      job.tag,
      '--max-turns',
      '80',
      // Without this the Intrinsic-quality judge has nothing to look at.
      '--screenshot',
    ],
    { cwd: REPO, detached: true, stdio: ['ignore', log, log] },
  );
  const code: number = await new Promise((resolve) => {
    child.on('exit', (c) => {
      resolve(c ?? 1);
    });
  });
  return code === 0;
}

/** Subscription billing means rate limits are the ceiling, not dollars. Read them and wait. */
async function pace(runId: string): Promise<void> {
  const file = join(RESULTS, runId, 'summary.json');
  if (!existsSync(file)) return;
  const s: unknown = JSON.parse(readFileSync(file, 'utf8'));
  const rl = isObj(s) ? s.rateLimit : undefined;
  if (!isObj(rl) || rl.status === 'allowed') return;
  const resetsAt = typeof rl.resetsAt === 'number' ? rl.resetsAt * 1000 : 0;
  const waitMs = Math.max(0, Math.min(resetsAt - Date.now(), 60 * 60 * 1000));
  if (waitMs > 0) {
    console.log(`rate limited (${String(rl.status)}) - holding ${Math.round(waitMs / 1000)}s`);
    await sleep(waitMs);
  }
}

async function worker(queue: Job[], done: { n: number }, total: number): Promise<void> {
  for (;;) {
    const job = queue.shift();
    if (job === undefined) return;

    if (existsSync(join(RESULTS, job.runId, 'summary.json'))) {
      done.n += 1;
      console.log(`[${done.n}/${total}] skip  ${job.runId} (already complete)`);
      continue;
    }

    let ok = false;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS && !ok; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop -- attempts are sequential by definition
      ok = await runOnce(job, attempt);
      if (!ok) console.log(`       retry ${job.runId} (attempt ${attempt} failed)`);
    }
    done.n += 1;
    console.log(`[${done.n}/${total}] ${ok ? 'ok   ' : 'FAIL '} ${job.runId}`);
    // eslint-disable-next-line no-await-in-loop -- pacing must happen between Runs, not around them
    await pace(job.runId);
  }
}

async function main() {
  const jobs = plan();
  const concurrency = Number(flag('concurrency', String(DEFAULT_CONCURRENCY)));
  console.log(`Sweep: ${jobs.length} Runs, ${concurrency} wide\n`);

  const queue = [...jobs];
  const done = { n: 0 };
  await Promise.all(
    Array.from({ length: concurrency }, async () => worker(queue, done, jobs.length)),
  );

  const complete = jobs.filter((j) => existsSync(join(RESULTS, j.runId, 'summary.json')));
  console.log(`\n${complete.length}/${jobs.length} Runs complete.`);
  for (const j of jobs.filter((x) => !complete.includes(x))) console.log(`  missing: ${j.runId}`);
}

await main();
