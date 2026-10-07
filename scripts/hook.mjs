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
 *   Stop (--stop)          Before the agent stops, scan every changed UI file
 *                          (tracked changes vs HEAD plus untracked files) and
 *                          compare with HEAD. New P0/P1 findings block the
 *                          stop once with a reason; a second stop in the same
 *                          turn (stop_hook_active) always passes.
 *
 * Registration:
 *   Plugin install: hooks/hooks.json registers both, nothing to do.
 *   npm install:    `crisp` installer offers to write .claude/settings.local.json:
 *     PostToolUse  matcher "Edit|Write|MultiEdit"  command "npx @laith-wallace/crisp hook"
 *     Stop                                           command "npx @laith-wallace/crisp hook --stop"
 *
 * A hook bug, a clean scan, or a non-git folder all exit 0 silently.
 */

import { extname, relative, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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

export async function runStop(payload) {
  if (payload?.stop_hook_active) return null; // already blocked once this turn

  const opts = { isIgnored: loadIsIgnored() };
  const all = [];
  for (const file of changedFiles()) {
    try {
      all.push(...diffFile(file, headText(file), opts));
    } catch {
      // unreadable file: skip it, never break the stop
    }
  }
  const blocking = all.filter(f => f.severity === 'P0' || f.severity === 'P1');
  if (blocking.length === 0) return null;

  const rest = all.length - blocking.length;
  return {
    decision: 'block',
    reason: `crisp detect: this session's changes added ${blocking.length} P0/P1 design issue${blocking.length === 1 ? '' : 's'}${rest > 0 ? ` (and ${rest} lower)` : ''}:\n${format(blocking)}\nFix them, or tell the user why they stay. ${SUPPRESS_HINT}`,
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
