#!/usr/bin/env node
/**
 * scripts/hook.mjs
 *
 * Claude Code hooks for the CRISP detector. Two speeds:
 *
 *   PostToolUse (default)  After an Edit/Write/MultiEdit, scan the touched
 *                          file and report only findings the edit added. The
 *                          pre-edit text is rebuilt from the tool input (Edit,
 *                          MultiEdit) or read from git HEAD (Write), so old
 *                          problems in the file never repeat on every edit.
 *                          Never blocks; findings go back as additionalContext.
 *
 *   Stop (--stop)          The finish gate. Before the agent stops, scan every
 *                          changed UI file (tracked changes vs HEAD plus
 *                          untracked files) and compare with HEAD. New P0/P1
 *                          findings, a suppression added without a reason of
 *                          12+ characters, or more than 5 suppressions added
 *                          block the stop. It blocks again while the open
 *                          findings change, up to 3 rounds a turn; a stop with
 *                          the same findings as the last block passes, so the
 *                          agent can explain them to the user.
 *
 * Registration:
 *   Plugin install: hooks/hooks.json registers both, nothing to do.
 *   npm install:    `crisp` installer offers to write .claude/settings.local.json:
 *     PostToolUse  matcher "Edit|Write|MultiEdit"  command "npx @laith-wallace/crisp hook"
 *     Stop                                           command "npx @laith-wallace/crisp hook --stop"
 *
 * A hook bug, a clean scan, or a non-git folder all exit 0 silently.
 */

import { extname, join, relative, resolve } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { scanText, newFindings } from './detector/engine.mjs';
import { loadConfig, makeIsIgnored } from './detector/ignores.mjs';
import { CODE_EXTENSIONS } from './detector/rules.mjs';

const SEVERITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };
const MAX_FINDINGS_SHOWN = 6;
const MAX_STOP_FILES = 50;
const SUPPRESS_HINT = 'To silence one deliberately: `crisp-disable-line <rule-id>: reason` in a comment on that line, or `crisp ignores add-value <rule-id> "<value>" --reason "..."`.';

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

function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

/** File text at HEAD, '' when the file is new, null when git can't answer. */
export function headText(file, cwd = process.cwd()) {
  const root = git(['rev-parse', '--show-toplevel'], cwd)?.trim();
  if (!root) return null;
  const rel = relative(root, resolve(cwd, file));
  if (git(['cat-file', '-e', `HEAD:${rel}`], root) === null) return '';
  return git(['show', `HEAD:${rel}`], root);
}

/**
 * Rebuild the file's text from before this tool call. Edit and MultiEdit
 * carry enough to undo themselves; Write does not, so it falls back to HEAD.
 */
export function beforeText(payload, currentText) {
  const input = payload?.tool_input ?? {};
  const edits = payload?.tool_name === 'MultiEdit' ? input.edits
    : payload?.tool_name === 'Edit' ? [input] : null;

  if (edits && edits.length > 0) {
    let text = currentText;
    for (const e of [...edits].reverse()) {
      if (typeof e.new_string !== 'string' || typeof e.old_string !== 'string') return headText(input.file_path);
      if (e.new_string === '' || !text.includes(e.new_string)) return headText(input.file_path);
      text = e.replace_all ? text.split(e.new_string).join(e.old_string) : text.replace(e.new_string, () => e.old_string);
    }
    return text;
  }
  return headText(input.file_path);
}

function loadIsIgnored() {
  try {
    return makeIsIgnored(loadConfig());
  } catch {
    return () => false; // malformed config: scan unfiltered rather than fail
  }
}

function format(findings) {
  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const shown = findings.slice(0, MAX_FINDINGS_SHOWN);
  const lines = shown.map(f => `- [${f.severity}] ${f.id} at ${f.file}:${f.line} - ${f.message}`);
  const omitted = findings.length - shown.length;
  return lines.join('\n') + (omitted > 0 ? `\n...and ${omitted} more.` : '');
}

/** New findings for one file: current text vs the given pre-edit text. */
export function diffFile(file, before, opts) {
  const after = readFileSync(file, 'utf8');
  const now = scanText(after, file, opts) ?? [];
  if (before === null) return now; // no baseline available: report everything
  return newFindings(scanText(before, file, opts) ?? [], now);
}

export async function runPostToolUse(payload) {
  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !existsSync(filePath)) return null;
  if (!CODE_EXTENSIONS.includes(extname(filePath))) return null;

  const current = readFileSync(filePath, 'utf8');
  const findings = diffFile(filePath, beforeText(payload, current), { isIgnored: loadIsIgnored() });
  if (findings.length === 0) return null;

  const header = `crisp detect: your edit to ${filePath} added ${findings.length} design issue${findings.length === 1 ? '' : 's'}:`;
  return {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `${header}\n${format(findings)}\nFix them now unless the brief needs them. ${SUPPRESS_HINT}`,
    },
  };
}

export function changedFiles(cwd = process.cwd()) {
  const root = git(['rev-parse', '--show-toplevel'], cwd)?.trim();
  if (!root) return [];
  const tracked = git(['diff', '--name-only', 'HEAD'], root) ?? git(['diff', '--name-only'], root) ?? '';
  const untracked = git(['ls-files', '--others', '--exclude-standard'], root) ?? '';
  return [...new Set(`${tracked}\n${untracked}`.split('\n').map(s => s.trim()).filter(Boolean))]
    .filter(f => CODE_EXTENSIONS.includes(extname(f)))
    .map(f => resolve(root, f))
    .filter(f => existsSync(f))
    .slice(0, MAX_STOP_FILES);
}

// ─── Finish gate: rounds and suppression rules ───
// The stop blocks while fixes are still landing, up to MAX_ROUNDS a turn. A
// stop whose open findings are the same as the last block passes: the agent
// chose to explain them to the user. Suppressions are checked so a finding is
// never silenced without a reason, and never silenced in bulk.

export const MAX_ROUNDS = 3;
export const MIN_REASON = 12;
export const MAX_SUPPRESSIONS = 5;
const MARKER = /crisp-disable(-line|-next-line)?\s+([a-z0-9-]+)(?:\s*:\s*([^\n*>]*))?/gi;

function markers(text) {
  const out = [];
  if (!text) return out;
  MARKER.lastIndex = 0;
  let m;
  while ((m = MARKER.exec(text)) !== null) {
    out.push({ rule: m[2].toLowerCase(), reason: (m[3] ?? '').replace(/\s*(-->|\*\/)?\s*$/, '').trim() });
  }
  return out;
}

/** Inline suppressions in `after` that `before` did not have (multiset difference). */
export function addedMarkers(before, after) {
  const pool = new Map();
  for (const m of markers(before)) {
    const k = `${m.rule}|${m.reason}`;
    pool.set(k, (pool.get(k) ?? 0) + 1);
  }
  const added = [];
  for (const m of markers(after)) {
    const k = `${m.rule}|${m.reason}`;
    if (pool.get(k) > 0) pool.set(k, pool.get(k) - 1);
    else added.push(m);
  }
  return added;
}

/** Ignore entries in .crisp/config.json that HEAD did not have. */
export function addedConfigIgnores(beforeJson, afterJson) {
  const parse = s => { try { return JSON.parse(s || '{}')?.detector ?? {}; } catch { return {}; } };
  const b = parse(beforeJson), a = parse(afterJson);
  const out = [];
  for (const r of a.ignoreRules ?? []) if (!(b.ignoreRules ?? []).includes(r)) out.push({ rule: r, broad: true, reason: '', where: 'ignoreRules (a whole rule, everywhere)' });
  for (const f of a.ignoreFiles ?? []) if (!(b.ignoreFiles ?? []).includes(f)) out.push({ rule: f, broad: true, reason: '', where: 'ignoreFiles (a whole file)' });
  const val = e => (typeof e === 'string' ? e : e?.value);
  for (const [rule, list] of Object.entries(a.ignoreValues ?? {})) {
    const old = new Set((b.ignoreValues?.[rule] ?? []).map(val));
    for (const e of list ?? []) {
      if (!old.has(val(e))) out.push({ rule, reason: (typeof e === 'object' && e?.reason) || '', where: `ignoreValues "${val(e)}"` });
    }
  }
  return out;
}

function suppressionProblems(files, root) {
  const added = [];
  for (const file of files) {
    try {
      added.push(...addedMarkers(headText(file), readFileSync(file, 'utf8')).map(m => ({ ...m, where: relative(root, file) })));
    } catch { /* unreadable: skip */ }
  }
  const cfg = resolve(root, '.crisp', 'config.json');
  if (existsSync(cfg)) {
    try { added.push(...addedConfigIgnores(headText(cfg), readFileSync(cfg, 'utf8'))); } catch { /* skip */ }
  }
  const problems = [];
  // ignoreRules and ignoreFiles hold plain strings, so they cannot carry a reason:
  // they are the broadest suppressions, and need the user's OK instead.
  const broad = added.filter(s => s.broad);
  if (broad.length) {
    problems.push(`${broad.length} broad ignore${broad.length === 1 ? '' : 's'} added to .crisp/config.json:\n` +
      broad.slice(0, MAX_FINDINGS_SHOWN).map(s => `- ${s.rule} in ${s.where}`).join('\n') +
      `\nThese silence a rule or a file everywhere. Remove them, or tell the user what they hide. The gate flags them once; a repeat stop with no change passes, so the user's OK is on you.`);
  }
  const weak = added.filter(s => !s.broad && s.reason.length < MIN_REASON);
  if (weak.length) {
    problems.push(`${weak.length} suppression${weak.length === 1 ? '' : 's'} added without a reason of ${MIN_REASON}+ characters:\n` +
      weak.slice(0, MAX_FINDINGS_SHOWN).map(s => `- ${s.rule} in ${s.where}`).join('\n') +
      `\nWrite why the finding is wrong here, or fix it.`);
  }
  if (added.length > MAX_SUPPRESSIONS) {
    problems.push(`${added.length} suppressions added this session (limit ${MAX_SUPPRESSIONS}). Fix the findings instead of silencing them.`);
  }
  return problems;
}

function statePath(root, sessionId) {
  const key = createHash('sha1').update(`${root}|${sessionId ?? 'default'}`).digest('hex').slice(0, 16);
  return join(tmpdir(), `crisp-gate-${key}.json`);
}
function readState(p) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return { blocks: 0, lastKey: null }; } }
function writeState(p, s) { try { writeFileSync(p, JSON.stringify(s)); return true; } catch { return false; } }

export async function runStop(payload) {
  const root = git(['rev-parse', '--show-toplevel'], process.cwd())?.trim();
  if (!root) return null;
  const sp = statePath(root, payload?.session_id);
  // A new turn starts a new count; a repeat stop in the same turn continues it.
  const state = payload?.stop_hook_active ? readState(sp) : { blocks: 0, lastKey: null };
  if (state.blocks >= MAX_ROUNDS) return null; // rounds used up: let the agent report what is open

  const opts = { isIgnored: loadIsIgnored() };
  const files = changedFiles();
  const all = [];
  for (const file of files) {
    try {
      all.push(...diffFile(file, headText(file), opts));
    } catch {
      // unreadable file: skip it, never break the stop
    }
  }
  const blocking = all.filter(f => f.severity === 'P0' || f.severity === 'P1');
  const problems = suppressionProblems(files, root);
  if (blocking.length === 0 && problems.length === 0) return null;

  const key = JSON.stringify([blocking.map(f => `${f.id}|${f.file}|${f.line}`).sort(), problems]);
  if (payload?.stop_hook_active && key === state.lastKey) return null; // unchanged since the last block: the agent explains them

  // Without saved state the round cap and the same-findings pass cannot work,
  // so block only the first stop of a turn: never more than the old one-block gate.
  if (!writeState(sp, { blocks: state.blocks + 1, lastKey: key }) && payload?.stop_hook_active) return null;
  const round = `round ${state.blocks + 1} of ${MAX_ROUNDS}`;
  const parts = [];
  if (blocking.length) {
    const rest = all.length - blocking.length;
    parts.push(`this session's changes added ${blocking.length} P0/P1 design issue${blocking.length === 1 ? '' : 's'}${rest > 0 ? ` (and ${rest} lower)` : ''}:\n${format(blocking)}`);
  }
  parts.push(...problems);
  return {
    decision: 'block',
    reason: `crisp gate (${round}): ${parts.join('\n')}\nFix them, or stop again without changes and tell the user why they stay. ${SUPPRESS_HINT}`,
  };
}

export async function runHook(argv = process.argv.slice(2)) {
  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch {
    return; // malformed or absent input: say nothing, never break the tool call
  }
  try {
    const out = argv.includes('--stop') ? await runStop(payload) : await runPostToolUse(payload);
    if (out) console.log(JSON.stringify(out));
  } catch {
    // a detector bug must never surface as hook noise
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  runHook().then(() => process.exit(0));
}
