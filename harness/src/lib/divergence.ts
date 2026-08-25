import type { Profile } from './profile.ts';

/** 0 when the sets are identical, 1 when they share nothing. */
export function jaccardDistance(a: Iterable<string>, b: Iterable<string>): number {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 && sb.size === 0) return 0;
  let shared = 0;
  for (const x of sa) if (sb.has(x)) shared += 1;
  return 1 - shared / (sa.size + sb.size - shared);
}

function meanPairwise(items: Profile[], pick: (p: Profile) => Iterable<string>): number {
  const pairs: number[] = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      pairs.push(jaccardDistance(pick(items[i]), pick(items[j])));
    }
  }
  return pairs.length === 0 ? 0 : pairs.reduce((a, b) => a + b, 0) / pairs.length;
}

export interface Divergence {
  runs: number;
  /** Did the Runs reach for the same components? */
  components: number;
  /** Did they pick the same charting/UI stack? The largest source, per issue #16. */
  stacks: number;
  /** Of components used by more than one Run, the share imported from differing modules. */
  specifiers: number;
  /**
   * Headline. Stacks weigh double - picking a different chart library is a deeper split than
   * picking a different component. Specifier divergence is folded into the component axis rather
   * than averaged beside it: it can only be non-zero where names already agreed, so averaging it
   * independently drags fully-disjoint Runs below 1.
   */
  overall: number;
}

export function divergence(profiles: Profile[]): Divergence {
  const components = meanPairwise(profiles, (p) => p.components);
  const stacks = meanPairwise(profiles, (p) => p.stacks);

  // A component imported from two different modules across Runs is divergence a name-only
  // comparison misses entirely - #16 found Astryx importing VStack three ways.
  const seen = new Map<string, Set<string>>();
  for (const p of profiles) {
    for (const [name, from] of Object.entries(p.sources)) {
      const set = seen.get(name) ?? new Set<string>();
      set.add(from);
      seen.set(name, set);
    }
  }
  const shared = [...seen.values()].filter((s) => s.size > 0);
  const split = shared.filter((s) => s.size > 1).length;
  const specifiers = shared.length === 0 ? 0 : split / shared.length;

  // Of the components the Runs did agree on by name, some still differ in import form.
  const effective = components + (1 - components) * specifiers;

  return {
    runs: profiles.length,
    components: round(components),
    stacks: round(stacks),
    specifiers: round(specifiers),
    overall: round((effective + 2 * stacks) / 3),
  };
}

const round = (n: number) => Math.round(n * 1000) / 1000;
