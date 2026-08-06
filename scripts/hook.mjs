#!/usr/bin/env node
/**
 * scripts/hook.mjs
 *
 * Claude Code PostToolUse hook: runs after an Edit/Write tool call, scans
 * the touched file with the CRISP detector, and — if it finds anything —
 * injects the findings back into Claude's context via additionalContext.
 * Never blocks the edit; a hook bug or a clean scan both exit 0 silently.
 *
 * Registration (added by `crisp install`'s hook step, or by hand):
 *   .claude/settings.local.json
 *   { "hooks": { "PostToolUse": [ { "matcher": "Edit|Write",
 *       "hooks": [ { "type": "command", "command": "npx @laith-wallace/crisp hook" } ] } ] } }
 *
 * The command goes through the published `crisp` CLI, not a literal path
 * into this repo's scripts/ — this file only exists here, in crisp's own
 * source; `npx` resolves the package regardless of the target project's cwd.
 *
 * stdin (from Claude Code): { tool_name, tool_input: { file_path }, ... }
 * stdout (to Claude Code, only when findings exist):
 *   { "hookSpecificOutput": { "hookEventName": "PostToolUse", "additionalContext": "..." } }
 */

import { extname } from 'node:path';
import { existsSync } from 'node:fs';
import { scan } from './detector/engine.mjs';
import { loadConfig, makeIsIgnored } from './detector/ignores.mjs';
import { CODE_EXTENSIONS } from './detector/rules.mjs';

const SEVERITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };
const MAX_FINDINGS_SHOWN = 6;

function readStdin() {
  return new Promise(resolve => {
    let data = '';
    if (process.stdin.isTTY) return resolve('');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

function emit(additionalContext) {
  console.log(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext },
  }));
}

export async function runHook() {
  const raw = await readStdin();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return; // malformed/absent input — say nothing, never break the edit
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !existsSync(filePath)) return;
  if (!CODE_EXTENSIONS.includes(extname(filePath))) return;

  let isIgnored = () => false;
  try {
    isIgnored = makeIsIgnored(loadConfig());
  } catch {
    // no repo config, or it's malformed — scan unfiltered rather than failing silently
  }

  let findings;
  try {
    ({ findings } = scan([filePath], { isIgnored }));
  } catch {
    return; // a detector bug should never surface as hook noise, let alone break the edit
  }

  if (findings.length === 0) return;

  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const shown = findings.slice(0, MAX_FINDINGS_SHOWN);
  const lines = shown.map(f => `- [${f.severity}] ${f.id} at ${f.file}:${f.line} — ${f.message}`);
  const omitted = findings.length - shown.length;

  const header = `crisp detect found ${findings.length} issue${findings.length === 1 ? '' : 's'} in the file you just edited (${filePath}):`;
  const footer = omitted > 0 ? `\n…and ${omitted} more. Run \`crisp detect ${filePath}\` for the full list.` : '';
  const suppressHint = '\nTo silence a specific one deliberately: `<!-- crisp-disable-line <rule-id>: reason -->` on that line, or `crisp ignores add-value <rule-id> "<value>" --reason "..."`.';

  emit(`${header}\n${lines.join('\n')}${footer}${suppressHint}`);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  runHook();
}
