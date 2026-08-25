import { describe, expect, it } from 'vite-plus/test';

import { assertComplete, assertSealed, parseTranscript } from './transcript.ts';

const init = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    type: 'system',
    subtype: 'init',
    slash_commands: [],
    mcp_servers: [{ name: 'astryx', status: 'connected' }],
    model: 'claude-sonnet-5',
    ...over,
  });

const result = JSON.stringify({
  type: 'result',
  subtype: 'success',
  stop_reason: 'end_turn',
  num_turns: 43,
  total_cost_usd: 1.1,
  duration_ms: 315_532,
});

const toolUse = (name: string, input: Record<string, unknown>) =>
  JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name, input }] } });

describe('parseTranscript', () => {
  it('reads the headline numbers off the result event', () => {
    const s = parseTranscript([init(), result].join('\n'));
    expect(s.turns).toBe(43);
    expect(s.costUsd).toBe(1.1);
    expect(s.ok).toBe(true);
  });

  it('reports incomplete when the Run was cut off before its result event', () => {
    const s = parseTranscript([init(), toolUse('Edit', { file_path: '/w/a.tsx' })].join('\n'));
    expect(s.complete).toBe(false);
    // The dangerous part: an interrupted Run reads as free and instant.
    expect(s.turns).toBe(0);
    expect(s.costUsd).toBe(0);
  });

  it('collects files read, which is how Discovery is measured', () => {
    const s = parseTranscript(
      [
        init(),
        toolUse('Read', { file_path: '/w/design.md' }),
        toolUse('Read', { file_path: '/w/design.md' }),
        result,
      ].join('\n'),
    );
    expect(s.filesRead).toStrictEqual(['/w/design.md']);
  });

  it('picks Astryx commands out of Bash calls', () => {
    const s = parseTranscript(
      [
        init(),
        toolUse('Bash', { command: 'pnpm exec astryx build "dashboard" 2>&1' }),
        result,
      ].join('\n'),
    );
    expect(s.astryxCommands.join(' ')).toContain('build');
  });

  it('survives a malformed line rather than throwing mid-Sweep', () => {
    expect(parseTranscript([init(), 'not json at all', result].join('\n')).turns).toBe(43);
  });
});

describe('assertComplete', () => {
  it('rejects an interrupted Run so it cannot enter a Sweep as the cheapest one', () => {
    expect(() => {
      assertComplete(parseTranscript(init()));
    }).toThrow(/interrupted/);
  });

  it('accepts a Run that finished', () => {
    expect(() => {
      assertComplete(parseTranscript([init(), result].join('\n')));
    }).not.toThrow();
  });
});

describe('assertSealed', () => {
  const sealed = parseTranscript([init(), result].join('\n'));

  it('accepts a sealed Run', () => {
    expect(() => {
      assertSealed(sealed, 'claude-sonnet-5');
    }).not.toThrow();
  });

  it('rejects a Run that inherited slash commands, because Arm off would not be off', () => {
    const leaked = parseTranscript(
      [init({ slash_commands: ['wayfinder', 'tdd'] }), result].join('\n'),
    );
    expect(() => {
      assertSealed(leaked, 'claude-sonnet-5');
    }).toThrow(/leaked/);
  });

  it('rejects a Run with no Astryx MCP, since the Foundation would be missing', () => {
    const noMcp = parseTranscript([init({ mcp_servers: [] }), result].join('\n'));
    expect(() => {
      assertSealed(noMcp, 'claude-sonnet-5');
    }).toThrow(/MCP/);
  });

  it('rejects model drift, which silently makes two Arms incomparable', () => {
    expect(() => {
      assertSealed(sealed, 'claude-opus-5');
    }).toThrow(/drifted/);
  });

  it('tolerates the context-window suffix the CLI appends', () => {
    const opus = parseTranscript([init({ model: 'claude-opus-5[1m]' }), result].join('\n'));
    expect(() => {
      assertSealed(opus, 'claude-opus-5');
    }).not.toThrow();
  });
});
