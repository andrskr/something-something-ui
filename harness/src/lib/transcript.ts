/** Everything we read out of a Run, parsed from `--output-format stream-json`. */
export interface RunSummary {
  ok: boolean;
  /** False when the transcript carries no result event - see assertComplete. */
  complete: boolean;
  subtype: string;
  stopReason: string | null;
  turns: number;
  costUsd: number;
  durationMs: number;
  /** Claim (d): Discovery is a deterministic read, not a judged one. See issue #7. */
  filesRead: string[];
  filesWritten: string[];
  toolCalls: Record<string, number>;
  astryxCommands: string[];
  mcpCalls: string[];
  usage: unknown;
  /** Fairness guard - see assertSealed. */
  seal: { slashCommands: number; mcpServers: string[]; model: string | null } | null;
  rateLimit: unknown;
}

type Json = Record<string, unknown>;

// The transcript is an external contract we do not own, so everything arrives as unknown
// and gets narrowed rather than asserted. A shape change upstream degrades a field to its
// default instead of throwing mid-Sweep.
const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null;
const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const num = (v: unknown): number => (typeof v === 'number' ? v : 0);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function toolUses(events: Json[]): { name: string; input: Json }[] {
  const out: { name: string; input: Json }[] = [];
  for (const e of events) {
    if (e.type !== 'assistant' || !isObj(e.message)) continue;
    for (const c of arr(e.message.content)) {
      if (!isObj(c) || c.type !== 'tool_use') continue;
      const name = str(c.name);
      if (name !== null) out.push({ name, input: isObj(c.input) ? c.input : {} });
    }
  }
  return out;
}

export function parseTranscript(jsonl: string): RunSummary {
  const events: Json[] = jsonl
    .split('\n')
    .filter((l) => l.trim() !== '')
    .flatMap((l) => {
      try {
        const v: unknown = JSON.parse(l);
        return isObj(v) ? [v] : [];
      } catch {
        return [];
      }
    });

  const result = events.find((e) => e.type === 'result') ?? {};
  const init = events.findLast((e) => e.type === 'system' && e.subtype === 'init');

  const toolCalls: Record<string, number> = {};
  const filesRead: string[] = [];
  const filesWritten: string[] = [];
  const astryxCommands: string[] = [];
  const mcpCalls: string[] = [];

  for (const { name, input } of toolUses(events)) {
    toolCalls[name] = (toolCalls[name] ?? 0) + 1;
    if (name.startsWith('mcp__')) mcpCalls.push(name);
    const path = str(input.file_path);
    if (path !== null) {
      if (name === 'Read') filesRead.push(path);
      if (name === 'Write' || name === 'Edit') filesWritten.push(path);
    }
    const command = str(input.command);
    if (name === 'Bash' && command !== null) {
      for (const m of command.matchAll(/astryx\s+([\w-]+(?:\s+[\w"'-]+)?)/g))
        astryxCommands.push(m[1].trim());
    }
  }

  const rateLimitEvent = events.find((e) => e.type === 'rate_limit_event');

  return {
    ok: result.subtype === 'success',
    complete: events.some((e) => e.type === 'result'),
    subtype: str(result.subtype) ?? 'unknown',
    stopReason: str(result.stop_reason),
    turns: num(result.num_turns),
    costUsd: num(result.total_cost_usd),
    durationMs: num(result.duration_ms),
    filesRead: [...new Set(filesRead)],
    filesWritten: [...new Set(filesWritten)],
    toolCalls,
    astryxCommands,
    mcpCalls,
    usage: result.usage ?? null,
    seal: init
      ? {
          slashCommands: arr(init.slash_commands).length,
          mcpServers: arr(init.mcp_servers).flatMap((s) => {
            const name = isObj(s) ? str(s.name) : null;
            return name === null ? [] : [name];
          }),
          model: str(init.model),
        }
      : null,
    rateLimit: rateLimitEvent?.rate_limit_info ?? null,
  };
}

/**
 * Refuse to score a Run whose environment was not sealed.
 *
 * Issue #4 measured a naive Run inheriting 82 slash commands, a full agent roster and firing hooks
 * - Arm 1 would not have been "Off" at all. A leak invalidates the Run silently, so we fail loudly
 * instead.
 */
/**
 * Refuse to score a Run that did not finish.
 *
 * A killed or interrupted Run yields a transcript with no result event, which parses to turns 0 and
 * cost 0 - so it looks like the cheapest, fastest Run in the Sweep instead of a failure, and drags
 * every average silently. Measured: a Run interrupted at 583 transcript lines reported turns=0,
 * cost=$0 and passed every other check.
 */
export function assertComplete(s: RunSummary): void {
  if (!s.complete) {
    throw new Error('transcript has no result event - the Run was interrupted and must be re-run');
  }
}

export function assertSealed(s: RunSummary, expectedModel: string): void {
  if (s.seal === null) throw new Error('no init event - cannot verify the environment was sealed');
  const { slashCommands, mcpServers, model } = s.seal;
  if (slashCommands !== 0)
    throw new Error(`environment leaked: ${slashCommands} slash commands reached the Run`);
  if (!mcpServers.includes('astryx'))
    throw new Error(`Astryx MCP not connected (saw: ${mcpServers.join(', ') || 'none'})`);
  // The CLI may append a context-window suffix, e.g. `claude-opus-5[1m]`.
  if (model === null || !model.startsWith(expectedModel)) {
    throw new Error(`model drifted: asked for ${expectedModel}, got ${model ?? 'nothing'}`);
  }
}
