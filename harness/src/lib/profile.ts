/**
 * What a Run reached for, extracted from the code it produced.
 *
 * Deliberately three separate axes. #16 found Astryx's own templates import `VStack` three
 * different ways and solve charts with three incompatible stacks, so a name-only multiset would
 * score genuinely different code as identical.
 */
export interface Profile {
  /** Component names imported from the Foundation. */
  components: string[];
  /** Component name to the module it was imported from - HStack/Layout vs HStack/HStack. */
  sources: Record<string, string>;
  /** Third-party UI packages: recharts, @astryxdesign/charts, @astryxdesign/lab. */
  stacks: string[];
}

// One always-present group for the binding clause. An optional group types as string but is
// undefined at runtime for default imports, which no guard satisfies cleanly.
const IMPORT = /import\s+(?:type\s+)?([^'"]+?)\s+from\s+'([^']+)'/g;
const FOUNDATION = '@astryxdesign/core';
/** Packages that render UI. Router and runtime imports say nothing about design choices. */
const IGNORED = new Set(['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-start']);
/** StyleX is the Foundation's own styling primitive, not a competing rendering stack. */
const FOUNDATION_ADJACENT = '@stylexjs/';

export function profile(source: string): Profile {
  const components = new Set<string>();
  const sources: Record<string, string> = {};
  const stacks = new Set<string>();

  for (const m of source.matchAll(IMPORT)) {
    const clause = m[1];
    const from = m[2];
    const braced = /\{([^}]*)\}/.exec(clause);
    const names = (braced === null ? clause : braced[1])
      .split(',')
      .map((n) =>
        n
          .trim()
          .split(/\s+as\s+/)[0]
          .trim(),
      )
      .filter((n) => n !== '' && /^[A-Z]/.test(n));

    if (from.startsWith(FOUNDATION)) {
      for (const n of names) {
        components.add(n);
        sources[n] = from;
      }
      // theme/tokens.stylex is Foundation, not a rendering stack.
      if (from.includes('/theme/')) continue;
    } else if (
      !IGNORED.has(from) &&
      !from.startsWith(FOUNDATION_ADJACENT) &&
      !from.startsWith('.') &&
      !from.startsWith('#')
    ) {
      stacks.add(from);
    }
  }

  return {
    components: [...components].toSorted(),
    sources,
    stacks: [...stacks].toSorted(),
  };
}
