import { describe, expect, it } from 'vite-plus/test';

import { parseExpectations, runCheck } from './checks.ts';

const CODE = "const a = 1;\nconst hex = '#0171E3';\n<Heading level={1}>x</Heading>\n";

describe('runCheck', () => {
  it('passes a present check when the pattern appears', () => {
    expect(runCheck({ kind: 'present', pattern: 'Heading' }, CODE)).toBe(true);
    expect(runCheck({ kind: 'present', pattern: 'Sparkline' }, CODE)).toBe(false);
  });

  it('fails an absent check when the forbidden pattern is there', () => {
    expect(runCheck({ kind: 'absent', pattern: '#[0-9a-fA-F]{6}' }, CODE)).toBe(false);
    expect(runCheck({ kind: 'absent', pattern: 'nowhere' }, CODE)).toBe(true);
  });

  it('counts occurrences exactly, which is how the one-h1 rule is settled', () => {
    expect(runCheck({ kind: 'count', pattern: String.raw`level=\{1\}`, equals: 1 }, CODE)).toBe(
      true,
    );
    expect(runCheck({ kind: 'count', pattern: String.raw`level=\{1\}`, equals: 2 }, CODE)).toBe(
      false,
    );
  });

  it('fails closed on a check kind it does not recognise', () => {
    expect(runCheck({ kind: 'vibes', pattern: 'Heading' }, CODE)).toBe(false);
  });
});

describe('parseExpectations', () => {
  it('keeps the check when one is declared and omits it when it is not', () => {
    const out = parseExpectations({
      expectations: [
        { id: 'E1', text: 'greppable', check: { kind: 'present', pattern: 'x' } },
        { id: 'E2', text: 'needs a judge' },
      ],
    });
    expect(out.map((e) => e.id)).toStrictEqual(['E1', 'E2']);
    expect(out[0].check?.kind).toBe('present');
    expect(out[1].check).toBeUndefined();
  });

  it('drops malformed entries rather than inventing an Expectation', () => {
    expect(
      parseExpectations({ expectations: [{ text: 'no id' }, 'a string', null] }),
    ).toStrictEqual([]);
  });

  it('returns nothing for a fixture with no expectations block', () => {
    expect(parseExpectations({})).toStrictEqual([]);
    expect(parseExpectations(null)).toStrictEqual([]);
  });
});
