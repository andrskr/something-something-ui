/**
 * Score a Run's Conformance, and optionally its Intrinsic quality.
 *
 * Node harness/src/judge.ts --fixture F001-overview --arm off --arm full
 *
 * Two scores, never merged. Conformance asks whether the output follows OUR rules - including for
 * Arms that never saw them, which is the experiment, not a bias. Intrinsic quality asks whether
 * this is a good interface at all, judged blind to the Layer, so we can tell "followed our rules"
 * apart from "is actually good".
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseExpectations, runCheck, type Expectation } from './lib/checks.ts';

const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const RESULTS = join(REPO, 'harness', 'results');
const MODEL = 'sonnet';
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const VOTES = 3;

function args(name: string): string[] {
  const out: string[] = [];
  for (const [i, a] of process.argv.entries()) if (a === `--${name}`) out.push(process.argv[i + 1]);
  return out;
}

function ask(prompt: string, allowRead: boolean): string {
  const r = spawnSync(
    'claude',
    [
      '-p',
      prompt,
      '--output-format',
      'json',
      '--model',
      MODEL,
      '--effort',
      'low',
      '--setting-sources',
      '',
      '--disable-slash-commands',
      '--disallowed-tools',
      // The Intrinsic judge needs Read to open the screenshot; the Conformance judge is given
      // the code inline and gets no tools at all.
      ...(allowRead ? [] : ['Read']),
      'Bash',
      'Glob',
      'Grep',
      'Edit',
      'Write',
      'WebFetch',
      'Task',
      '--permission-mode',
      'bypassPermissions',
      '--max-turns',
      // The Intrinsic judge spends a turn opening the screenshot; the Conformance judge answers
      // from the code it was handed and needs exactly one.
      allowRead ? '3' : '1',
    ],
    { encoding: 'utf8', cwd: REPO },
  );
  // The CLI can emit notices alongside the JSON, so take the last line that parses rather
  // than assuming stdout is clean.
  for (const line of r.stdout.split('\n').toReversed()) {
    if (!line.trim().startsWith('{')) continue;
    try {
      const parsed: unknown = JSON.parse(line);
      const result = isObj(parsed) ? parsed.result : undefined;
      if (typeof result === 'string') return result;
    } catch {
      continue;
    }
  }
  return '';
}

/**
 * Fail-closed, and the criterion is never phrased as a negation - a negated criterion inverts
 * fail-closed, so a judge that cannot tell would wrongly pass.
 */
function judgeExpectation(text: string, code: string): boolean {
  const prompt = [
    'You are grading ONE expectation about a generated React file.',
    'Decide only on clear evidence in the code. If the evidence is unclear, absent, or you are unsure, answer FAIL.',
    'Answer with exactly one word: PASS or FAIL.',
    '',
    `EXPECTATION: ${text}`,
    '',
    'FILE:',
    '```tsx',
    code,
    '```',
  ].join('\n');
  let passes = 0;
  for (let i = 0; i < VOTES; i += 1) {
    if (/\bPASS\b/.test(ask(prompt, false).toUpperCase())) passes += 1;
  }
  return passes > VOTES / 2;
}

/**
 * Intrinsic quality: is this a good interface for what was asked?
 *
 * Blind to the Layer on purpose. If the only score were Conformance, Arm 3 would win by
 * construction and prove nothing beyond "the agent read a document". This is the score that says
 * whether following our rules also made the result better - or merely longer.
 */
function judgeIntrinsic(promptText: string, shotPath: string): number {
  const prompt = [
    'You are judging one screenshot of a web page built to satisfy a user request.',
    'Read the image at the path below, then score it out of 100 on whether it is a good interface',
    'for that request: does it answer what was asked, is the hierarchy clear, is it readable,',
    'is anything missing or confusing? Judge the interface on its own merits.',
    'Reply with the number alone and nothing else.',
    '',
    `IMAGE: ${shotPath}`,
    '',
    'THE USER ASKED FOR:',
    promptText,
  ].join('\n');
  const scores: number[] = [];
  for (let i = 0; i < VOTES; i += 1) {
    const n = Number.parseInt(ask(prompt, true).replaceAll(/[^\d]/g, '').slice(0, 3), 10);
    if (Number.isFinite(n) && n >= 0 && n <= 100) scores.push(n);
  }
  if (scores.length === 0) return 0;
  return scores.toSorted((a, b) => a - b)[Math.floor(scores.length / 2)];
}

function score(fixture: string, arm: string) {
  const meta: unknown = JSON.parse(
    readFileSync(join(REPO, 'harness/fixtures', fixture, 'fixture.json'), 'utf8'),
  );
  const expectations: Expectation[] = parseExpectations(meta);
  const rawTarget = isObj(meta) ? meta.target : '';
  const target = String(rawTarget).replace(/^apps\/web\//, '');

  for (const dir of readdirSync(RESULTS).filter((d) => d.startsWith(`${fixture}__${arm}__`))) {
    const file = join(RESULTS, dir, target);
    if (!existsSync(file)) continue;
    const code = readFileSync(file, 'utf8');

    const verdicts = expectations.map((e) => ({
      id: e.id,
      text: e.text,
      how: e.check === undefined ? 'judged' : 'checked',
      pass: e.check === undefined ? judgeExpectation(e.text, code) : runCheck(e.check, code),
    }));

    const passed = verdicts.filter((v) => v.pass).length;
    const conformance = Math.round((passed / verdicts.length) * 100);

    // Never merged with Conformance - the pair is the point.
    const shot = join(RESULTS, dir, 'screenshot.png');
    const promptText = readFileSync(join(REPO, 'harness/fixtures', fixture, 'PROMPT.md'), 'utf8')
      .replaceAll(/<!--[\s\S]*?-->/g, '')
      .trim();
    const intrinsic = existsSync(shot) ? judgeIntrinsic(promptText, shot) : null;

    writeFileSync(
      join(RESULTS, dir, 'conformance.json'),
      JSON.stringify(
        { fixture, arm, dir, conformance, intrinsic, passed, of: verdicts.length, verdicts },
        null,
        2,
      ),
    );
    console.log(
      `${dir}  conformance ${passed}/${verdicts.length} (${conformance})  intrinsic ${intrinsic ?? 'n/a'}`,
    );
    for (const v of verdicts)
      console.log(
        `   ${v.pass ? 'PASS' : 'FAIL'}  ${v.how.padEnd(7)} ${v.id}  ${v.text.slice(0, 84)}`,
      );
  }
}

function main() {
  const [fixture] = args('fixture');
  const arms = args('arm');
  if (arms.length === 0) throw new Error('usage: --fixture <id> --arm <arm> [--arm <arm>]');
  for (const arm of arms) {
    console.log(`\n=== ${fixture} / ${arm} ===`);
    score(fixture, arm);
  }
}

main();
