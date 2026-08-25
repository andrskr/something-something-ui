import { describe, expect, it } from 'vite-plus/test';

import { divergence, jaccardDistance } from './divergence.ts';
import type { Profile } from './profile.ts';

const p = (
  components: string[],
  stacks: string[],
  sources: Record<string, string> = {},
): Profile => ({
  components,
  stacks,
  sources:
    Object.keys(sources).length > 0
      ? sources
      : Object.fromEntries(components.map((c) => [c, 'core'])),
});

describe('jaccardDistance', () => {
  it('is 0 for identical sets and 1 for disjoint ones', () => {
    expect(jaccardDistance(['a', 'b'], ['a', 'b'])).toBe(0);
    expect(jaccardDistance(['a'], ['b'])).toBe(1);
  });

  it('is 0 when both sides are empty, so two chartless Runs agree', () => {
    expect(jaccardDistance([], [])).toBe(0);
  });

  it('is 2/3 when one item is shared out of a union of three', () => {
    // |shared| 1, |union| 3, so similarity 1/3 and distance 2/3.
    expect(jaccardDistance(['a', 'b'], ['a', 'c'])).toBeCloseTo(2 / 3, 10);
  });
});

describe('divergence', () => {
  const table = p(['Table', 'StatusDot'], ['recharts']);

  it('scores 0 when every Run made the same choices', () => {
    expect(divergence([table, table, table]).overall).toBe(0);
  });

  it('scores 1 when Runs share nothing at all', () => {
    expect(divergence([table, p(['Card', 'Grid'], ['@astryxdesign/lab'])]).overall).toBe(1);
  });

  it('catches a split that a name-only comparison would call identical', () => {
    const split = p(['Table', 'StatusDot'], ['recharts'], {
      Table: 'core/Layout',
      StatusDot: 'core',
    });
    const d = divergence([table, split]);
    expect(d.components).toBe(0);
    expect(d.specifiers).toBeGreaterThan(0);
    expect(d.overall).toBeGreaterThan(0);
  });

  it('treats a Run that used no chart library as a stack divergence', () => {
    // The measured Arm-off case: two Runs on recharts, one hand-rolled.
    expect(divergence([table, p(['Table', 'StatusDot'], [])]).stacks).toBe(1);
  });

  it('weighs a different chart library above a different component', () => {
    const otherStack = divergence([
      table,
      p(['Table', 'StatusDot'], ['@astryxdesign/lab']),
    ]).overall;
    const otherComponent = divergence([table, p(['Table', 'Card'], ['recharts'])]).overall;
    expect(otherStack).toBeGreaterThan(otherComponent);
  });
});
