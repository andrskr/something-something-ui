/** An Expectation a grep can settle, so no judge is spent on it. */
export interface Check {
  kind: string;
  pattern: string;
  equals?: number;
}

export interface Expectation {
  id: string;
  text: string;
  check?: Check;
}

/** Fail-closed: an unrecognised check kind fails rather than quietly passing. */
export function runCheck(check: Check, source: string): boolean {
  const re = new RegExp(check.pattern, 'g');
  const hits = [...source.matchAll(re)].length;
  if (check.kind === 'present') return hits > 0;
  if (check.kind === 'absent') return hits === 0;
  if (check.kind === 'count') return hits === check.equals;
  return false;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export function parseExpectations(meta: unknown): Expectation[] {
  if (!isObj(meta) || !Array.isArray(meta.expectations)) return [];
  return meta.expectations.flatMap((e: unknown) => {
    if (!isObj(e) || typeof e.id !== 'string' || typeof e.text !== 'string') return [];
    const check =
      isObj(e.check) && typeof e.check.kind === 'string' && typeof e.check.pattern === 'string'
        ? {
            kind: e.check.kind,
            pattern: e.check.pattern,
            equals: typeof e.check.equals === 'number' ? e.check.equals : undefined,
          }
        : undefined;
    return [{ id: e.id, text: e.text, check }];
  });
}
