import { describe, expect, it } from 'vite-plus/test';

import { applyArm, layerFiles } from './arms.ts';

// A stand-in for apps/web/AGENTS.md. The marker is what matters, not the prose.
const AGENTS = [
  '# AGENTS',
  '',
  'Some preamble.',
  '',
  '<!-- ASTRYX:START -->',
  'Astryx says: no div, tokens for everything.',
  '<!-- ASTRYX:END -->',
  '',
].join('\n');

const BLOCKS = { arm2: 'Always-on rule.', arm3: 'Read design.md.' };
const ASTRYX_BLOCK = AGENTS.slice(
  AGENTS.indexOf('<!-- ASTRYX:START -->'),
  AGENTS.indexOf('<!-- ASTRYX:END -->') + 19,
);

describe('applyArm', () => {
  it('leaves Arm off untouched, so the Foundation is all it sees', () => {
    expect(applyArm(AGENTS, 'off', BLOCKS)).toBe(AGENTS);
  });

  it('gives Arm always-on the thin rules and withholds the pointer', () => {
    const out = applyArm(AGENTS, 'always-on', BLOCKS);
    expect(out).toContain('Always-on rule.');
    expect(out).not.toContain('Read design.md.');
  });

  it('gives Arm full the thin rules and the pointer, so Arm 3 contains Arm 2', () => {
    const out = applyArm(AGENTS, 'full', BLOCKS);
    expect(out).toContain('Always-on rule.');
    expect(out).toContain('Read design.md.');
  });

  it('keeps Astryx’s own block byte-identical in every Arm', () => {
    for (const arm of ['off', 'always-on', 'full'] as const) {
      expect(applyArm(AGENTS, arm, BLOCKS)).toContain(ASTRYX_BLOCK);
    }
  });

  it('writes the Layer below ASTRYX:END, never inside the block', () => {
    const out = applyArm(AGENTS, 'full', BLOCKS);
    expect(out.indexOf('<!-- ACME:START -->')).toBeGreaterThan(out.indexOf('<!-- ASTRYX:END -->'));
  });

  it('refuses a file with no ASTRYX:END rather than guessing where the Layer goes', () => {
    expect(() => applyArm('# AGENTS\n\nno marker here\n', 'full', BLOCKS)).toThrow(/ASTRYX:END/);
  });
});

describe('layerFiles', () => {
  it('ships design.md only to Arm full', () => {
    expect(layerFiles('off')).toStrictEqual([]);
    expect(layerFiles('always-on')).toStrictEqual([]);
    expect(layerFiles('full')).toStrictEqual(['design.md', 'references']);
  });
});
