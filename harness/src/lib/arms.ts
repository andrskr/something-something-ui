/** The three Arms. Arm 3 contains Arm 2 contains Arm 1. See issue #7. */
export type Arm = 'off' | 'always-on' | 'full';

export const ARMS: readonly Arm[] = ['off', 'always-on', 'full'];

const START = '<!-- ACME:START -->';
const END = '<!-- ACME:END -->';
const ASTRYX_END = '<!-- ASTRYX:END -->';

/**
 * Append the Arm's block below Astryx's own generated block.
 *
 * Astryx's block must stay byte-identical across every Arm: it is Foundation material, `astryx
 * init` regenerates it verbatim, and varying it would mean testing Astryx's discovery rather than
 * ours. So we only ever append after it, never edit inside it.
 */
export function applyArm(
  agentsMd: string,
  arm: Arm,
  blocks: { arm2: string; arm3: string },
): string {
  if (arm === 'off') return agentsMd;
  if (!agentsMd.includes(ASTRYX_END)) {
    throw new Error(
      `AGENTS.md has no ${ASTRYX_END} marker - refusing to guess where the Layer goes`,
    );
  }
  const body = arm === 'always-on' ? blocks.arm2 : `${blocks.arm2}\n${blocks.arm3}`;
  return `${agentsMd.trimEnd()}\n\n${START}\n\n${body.trim()}\n\n${END}\n`;
}

/** Files the Arm copies into the worktree, relative to the app directory. */
export function layerFiles(arm: Arm): readonly string[] {
  return arm === 'full' ? ['design.md', 'references'] : [];
}
