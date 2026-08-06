/**
 * scripts/detector/engine.mjs
 *
 * Walks a target path, runs the applicable rules from rules.mjs against each
 * file's raw text, and returns structured findings. No dependencies, no
 * network, no browser — this is the deterministic layer the LLM-only AI
 * Slop Check in crisp-audit.md and crisp-review.md now runs before judging.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { rulesFor, lineOf } from './rules.mjs';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.svelte-kit', 'out', 'coverage', '.turbo', '.crisp']);

const INLINE_MARKER = /crisp-disable(-line|-next-line)?\s+([a-z0-9-]+)(?:\s*:\s*[^\n*>]*)?/gi;

/**
 * Parse `crisp-disable <rule-id>: reason`, `crisp-disable-line <rule-id>`,
 * and `crisp-disable-next-line <rule-id>` from raw file text. Works in any
 * comment syntax — the delimiters (`<!--`, `/*`, `//`) aren't part of the
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
 * @param {string[]} targets - file or directory paths to scan
 * @param {object} [opts]
 * @param {(finding: object) => boolean} [opts.isIgnored] - config-level ignore check; return true to drop a finding
 * @param {boolean} [opts.noInlineIgnores] - skip `crisp-disable` comment parsing entirely
 * @returns {{ findings: object[], filesScanned: number }}
 */
export function scan(targets, opts = {}) {
  const isIgnored = opts.isIgnored || (() => false);
  const findings = [];
  let filesScanned = 0;

  for (const target of targets) {
    const files = walk(target, target);
    for (const file of files) {
      const ext = extname(file);
      const rules = rulesFor(ext);
      if (rules.length === 0) continue;

      let text;
      try {
        text = readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      filesScanned++;

      const inline = opts.noInlineIgnores ? null : parseInlineIgnores(text);

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
    }
  }

  return { findings, filesScanned };
}
