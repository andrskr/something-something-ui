#!/usr/bin/env bash
# THROWAWAY SPIKE — proves one Run works end to end on a git worktree. Not the real runner.
# Usage: ./spike/run-one.sh <worktree-dir> <prompt-file> <out-dir>
set -euo pipefail
WT="$1"; PROMPT_FILE="$2"; OUT="$3"
REPO="$(git rev-parse --show-toplevel)"
mkdir -p "$OUT"

t() { python3 -c 'import time;print(int(time.time()*1000))'; }
T0=$(t)
rm -rf "$WT"; git worktree add --detach "$WT" HEAD >/dev/null 2>&1
T1=$(t)

# Arm preparation: strip everything that would contaminate the Run.
# 82 slash commands, a full agent roster and repo hooks leak in otherwise.
rm -rf "$WT/.claude" "$WT/.agents" "$WT/.vite-hooks"

( cd "$WT" && vp install >/dev/null 2>&1 )
T2=$(t)

# --setting-sources project  keeps AGENTS.md/CLAUDE.md reaching the model...
# --disable-slash-commands   ...while removing all 82 leaked skills.
# --strict-mcp-config        pins MCP to exactly this file.
# --model                    MUST be explicit: it silently changes with settings.
( cd "$WT/apps/web" && claude -p "$(cat "$PROMPT_FILE")" \
    --output-format stream-json --verbose \
    --model "${SPIKE_MODEL:-sonnet}" \
    --strict-mcp-config --mcp-config "$WT/.mcp.json" \
    --setting-sources project --disable-slash-commands \
    --permission-mode bypassPermissions --max-turns "${SPIKE_MAX_TURNS:-60}" \
) > "$OUT/run.jsonl" 2>"$OUT/run.err" || true
T3=$(t)

( cd "$WT" && vp run build >"$OUT/build.log" 2>&1 ) && BUILD=pass || BUILD=fail
T4=$(t)

jq -c --arg build "$BUILD" \
  --argjson wt "$((T1-T0))" --argjson inst "$((T2-T1))" \
  --argjson run "$((T3-T2))" --argjson bld "$((T4-T3))" \
  'select(.type=="result") | {
     build: $build, worktree_ms: $wt, install_ms: $inst, run_ms: $run, build_ms: $bld,
     turns: .num_turns, cost_usd: .total_cost_usd, stop: .stop_reason, subtype
   }' "$OUT/run.jsonl" | tee "$OUT/summary.json"
