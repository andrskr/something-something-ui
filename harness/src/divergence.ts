/**
 * Measure how much Repeats of one Fixture in one Arm differ in what they reached for.
 *
 * Node harness/src/divergence.ts --fixture F001-overview --arm off node harness/src/divergence.ts
 * --fixture F001-overview --arm off --arm full
 *
 * Deterministic: a parse and a set comparison, no judge and no model. Low Divergence is what a
 * design system is supposed to buy, so this is the headline metric for that claim.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { divergence } from './lib/divergence.ts';
import { profile, type Profile } from './lib/profile.ts';

const REPO = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const RESULTS = join(REPO, 'harness', 'results');

function args(name: string): string[] {
  const out: string[] = [];
  for (const [i, a] of process.argv.entries()) if (a === `--${name}`) out.push(process.argv[i + 1]);
  return out;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function targetOf(fixture: string): string {
  const meta: unknown = JSON.parse(
    readFileSync(join(REPO, 'harness/fixtures', fixture, 'fixture.json'), 'utf8'),
  );
  const target = isObj(meta) ? meta.target : undefined;
  if (typeof target !== 'string') throw new Error(`${fixture}/fixture.json has no target`);
  return target.replace(/^apps\/web\//, '');
}

function profilesFor(fixture: string, arm: string): { runId: string; profile: Profile }[] {
  const target = targetOf(fixture);
  return readdirSync(RESULTS)
    .filter((d) => d.startsWith(`${fixture}__${arm}__`))
    .flatMap((d) => {
      const file = join(RESULTS, d, target);
      return existsSync(file)
        ? [{ runId: basename(d), profile: profile(readFileSync(file, 'utf8')) }]
        : [];
    });
}

function main() {
  const fixtures = args('fixture');
  const arms = args('arm');
  if (fixtures.length === 0 || arms.length === 0) {
    throw new Error('usage: --fixture <id> --arm <arm> [--arm <arm>]');
  }
  const fixture = fixtures[0];

  for (const arm of arms) {
    const found = profilesFor(fixture, arm);
    if (found.length < 2) {
      console.log(`${arm}: ${found.length} Run(s) - Divergence needs at least 2`);
      continue;
    }
    const d = divergence(found.map((f) => f.profile));
    console.log(`\n=== ${fixture} / ${arm} ===`);
    console.log(
      `runs        ${d.runs}   (${found.map((f) => f.runId.split('__').at(-1)).join(', ')})`,
    );
    console.log(`components  ${d.components}`);
    console.log(`stacks      ${d.stacks}`);
    console.log(`specifiers  ${d.specifiers}`);
    console.log(
      `OVERALL     ${d.overall}   (0 = every Run made the same choices, 1 = nothing shared)`,
    );
    const union = new Set(found.flatMap((f) => f.profile.components));
    const common = [...union].filter((c) => found.every((f) => f.profile.components.includes(c)));
    console.log(`agreed on   ${common.length}/${union.size} components`);
    console.log(
      `stacks seen ${[...new Set(found.flatMap((f) => f.profile.stacks))].join(', ') || '(none)'}`,
    );
  }
}

main();
