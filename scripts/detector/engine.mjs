/**
 * scripts/detector/engine.mjs
 *
 * Walks a target path, runs the applicable rules from rules.mjs against each
 * file's raw text, and returns structured findings. No dependencies, no
 * network, no browser - this is the deterministic layer the LLM-only AI
 * Slop Check in crisp-audit and crisp-review now runs before judging.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { rulesFor as coreRulesFor, lineOf } from './rules.mjs';
import { DESIGN_MD_RULES } from './rules-design-md.mjs';

// Core rules plus the DESIGN.md token rules, which stay silent when the repo has no DESIGN.md.
function rulesFor(extension) {
  return [...coreRulesFor(extension), ...DESIGN_MD_RULES.filter(r => r.extensions.includes(extension))];
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.svelte-kit', 'out', 'coverage', '.turbo', '.crisp']);

const INLINE_MARKER = /crisp-disable(-line|-next-line)?\s+([a-z0-9-]+)(?:\s*:\s*[^\n*>]*)?/gi;

/**
 * Parse `crisp-disable <rule-id>: reason`, `crisp-disable-line <rule-id>`,
 * and `crisp-disable-next-line <rule-id>` from raw file text. Works in any
 * comment syntax - the delimiters (`<!--`, `/*`, `//`) aren't part of the
 * match, so this is a plain substring search, not a comment parser.
 */
function parseInlineIgnores(text) {
  const fileScope = new Set();
  const lineScope = new Map(); // line number -> Set<ruleId>
  let m;
  INLINE_MARKER.lastIndex = 0;
  while ((m = INLINE_MARKER.exec(text)) !== null) {
    const scope = m[1]; // undefined | '-line' | '-next-line'
    const ruleId = m[2].toLowerCase();
    const line = lineOf(text, m.index);
    if (!scope) {
      fileScope.add(ruleId);
    } else if (scope === '-line') {
      if (!lineScope.has(line)) lineScope.set(line, new Set());
      lineScope.get(line).add(ruleId);
    } else {
      const target = line + 1;
      if (!lineScope.has(target)) lineScope.set(target, new Set());
      lineScope.get(target).add(ruleId);
    }
  }
  return { fileScope, lineScope };
}

function walk(root, target) {
  const stat = statSync(target);
  if (stat.isFile()) return [target];
  if (!stat.isDirectory()) return [];

  const out = [];
  for (const entry of readdirSync(target)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith('.')) continue;
    const full = join(target, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(root, full));
    else out.push(full);
  }
  return out;
}

/**
 * Run every applicable rule over one file's text. Used by scan() for files on
 * disk, and by the hook to scan the pre-edit version of a file held in memory.
 *
 * @param {string} text - file contents
 * @param {string} file - path used for the extension and the finding's `file`
 * @param {object} [opts] - same as scan()
 * @returns {object[] | null} findings, or null when no rule applies to this extension
 */
export function scanText(text, file, opts = {}) {
  const isIgnored = opts.isIgnored || (() => false);
  const rules = rulesFor(extname(file));
  if (rules.length === 0) return null;

  const inline = opts.noInlineIgnores ? null : parseInlineIgnores(text);
  const findings = [];

  for (const rule of rules) {
    if (inline && inline.fileScope.has(rule.id)) continue;

    let matches;
    try {
      matches = rule.test(text) || [];
    } catch {
      continue; // a rule that throws on this file's content is a rule bug, not a finding
    }
    for (const match of matches) {
      const line = lineOf(text, match.index);
      if (inline && inline.lineScope.get(line)?.has(rule.id)) continue;

      const finding = {
        id: rule.id,
        severity: rule.severity,
        category: rule.category,
        message: rule.message,
        file: relative(process.cwd(), file),
        line,
        snippet: match.snippet,
      };
      if (!isIgnored(finding)) findings.push(finding);
    }
  }
  return findings;
}

/**
 * @param {string[]} targets - file or directory paths to scan
 * @param {object} [opts]
 * @param {(finding: object) => boolean} [opts.isIgnored] - config-level ignore check; return true to drop a finding
 * @param {boolean} [opts.noInlineIgnores] - skip `crisp-disable` comment parsing entirely
 * @returns {{ findings: object[], filesScanned: number }}
 */
export function scan(targets, opts = {}) {
  const findings = [];
  let filesScanned = 0;

  for (const target of targets) {
    for (const file of walk(target, target)) {
      if (rulesFor(extname(file)).length === 0) continue;

      let text;
      try {
        text = readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      filesScanned++;
      findings.push(...scanText(text, file, opts));
    }
  }

  return { findings, filesScanned };
}

/**
 * Findings in `after` that `before` did not already have. Matched by rule id
 * and snippet (not line number, which shifts on every edit), counting
 * duplicates, so a second copy of an old problem still counts as new.
 */
export function newFindings(before, after) {
  const seen = new Map();
  for (const f of before) {
    const key = `${f.id}\u0000${f.snippet}`;
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  return after.filter(f => {
    const key = `${f.id}\u0000${f.snippet}`;
    const left = seen.get(key) || 0;
    if (left === 0) return true;
    seen.set(key, left - 1);
    return false;
  });
}
