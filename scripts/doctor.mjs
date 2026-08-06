#!/usr/bin/env node
/**
 * scripts/doctor.mjs
 *
 * Reports drift between a project's CRISP artifacts (.crisp.md, .crisp/config.json)
 * and what the installed crisp package currently expects. This is honest about
 * what it can and can't know: it does not fabricate a schema-migration history
 * for versions before the version stamp existed (see crisp-teach.md's
 * `<!-- crisp-teach: vX -->` line) - an unstamped file is reported as
 * "unknown vintage", not silently assumed current or silently assumed stale.
 *
 * Severity tiers (same meaning as the doctor pattern this is modeled on):
 *   auto    - mechanical, no judgement call. `--fix` applies it, nothing asked.
 *   mention - the user should know, nothing to decide right now.
 *   route   - needs a specific command (almost always /crisp-teach); this
 *             script never runs that command itself.
 *
 * CLI: crisp doctor [--json] [--fix] [--target <path>]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RULES } from './detector/rules.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');

function pkgVersion() {
  return JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version;
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}

function checkCrispMd(target, findings) {
  const path = join(target, '.crisp.md');
  if (!existsSync(path)) {
    findings.push({
      id: 'crisp-md-missing',
      artifact: '.crisp.md',
      path,
      severity: 'route',
      summary: 'No .crisp.md found - CRISP commands are running without project design context.',
      fix: 'Run /crisp-teach to capture it once.',
    });
    return;
  }

  const text = readFileSync(path, 'utf8');
  const stampMatch = text.match(/<!--\s*crisp-teach:\s*v([\d.]+)\s*-->/);
  const current = pkgVersion();

  if (!stampMatch) {
    findings.push({
      id: 'crisp-md-unstamped',
      artifact: '.crisp.md',
      path,
      severity: 'mention',
      summary: '.crisp.md has no version stamp - it predates stamping, or was hand-edited. Doctor can\'t tell which schema it matches.',
      fix: 'No action required. Re-run /crisp-teach if you want it refreshed to the current schema.',
    });
  } else if (compareVersions(stampMatch[1], current) < 0) {
    findings.push({
      id: 'crisp-md-version-behind',
      artifact: '.crisp.md',
      path,
      severity: 'mention',
      summary: `.crisp.md was written by crisp-teach v${stampMatch[1]}; this install is v${current}. Newer fields may be missing.`,
      fix: 'Re-run /crisp-teach to refresh, or continue as-is - nothing breaks from an older file.',
    });
  }

  if (/^## Product\b/m.test(text) && !/^Register:\s*\S/m.test(text)) {
    findings.push({
      id: 'crisp-md-missing-register',
      artifact: '.crisp.md',
      path,
      severity: 'route',
      summary: 'The Product section has no Register: value. crisp-audit and crisp-review both read this as their per-project default.',
      fix: 'Re-run /crisp-teach - Section 2 captures Register specifically.',
    });
  }

  if (!/^## History\b/m.test(text)) {
    findings.push({
      id: 'crisp-md-missing-history-section',
      artifact: '.crisp.md',
      path,
      severity: 'auto',
      summary: 'No ## History section - longitudinal tracking from /crisp-audit and /crisp-review has nowhere to append.',
      fix: 'Append an empty ## History section.',
      apply: () => {
        const addition = '\n## History\n<!-- CRISP appends a summary line here after each /crisp-audit or /crisp-review run. -->\n<!-- Format: - YYYY-MM-DD | /command | C:x R:x I:x S:x P:x | Grade: X | Top issue: [summary] -->\n';
        writeFileSync(path, text.replace(/\s*$/, '') + '\n' + addition);
      },
    });
  }
}

function checkDetectorConfig(target, findings) {
  const path = join(target, '.crisp', 'config.json');
  if (!existsSync(path)) return;

  let config;
  try {
    config = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    findings.push({
      id: 'config-invalid-json',
      artifact: '.crisp/config.json',
      path,
      severity: 'route',
      summary: `.crisp/config.json is not valid JSON (${err.message}). The detector falls back to zero ignores while it's broken.`,
      fix: 'Fix the JSON syntax, or delete the file to start clean.',
    });
    return;
  }

  const knownIds = new Set(RULES.map(r => r.id));
  const ignoreRules = config.detector?.ignoreRules ?? [];
  const ignoreValueKeys = Object.keys(config.detector?.ignoreValues ?? {});
  const unknown = [...new Set([...ignoreRules, ...ignoreValueKeys])].filter(id => !knownIds.has(id));

  if (unknown.length > 0) {
    findings.push({
      id: 'config-unknown-rule-ids',
      artifact: '.crisp/config.json',
      path,
      severity: 'mention',
      summary: `.crisp/config.json references rule id(s) not in the current detector: ${unknown.join(', ')}. Likely a typo, or a rule renamed/removed since this was written.`,
      fix: 'Run `crisp ignores list` to see current entries, and check them against the rule ids in scripts/detector/rules.mjs.',
    });
  }
}

export function runDoctorChecks(target) {
  const findings = [];
  checkCrispMd(target, findings);
  checkDetectorConfig(target, findings);
  return { findings, ruleRegistryAvailable: true };
}

export function applyAutoFixes(report) {
  const applied = [];
  for (const f of report.findings) {
    if (f.severity === 'auto' && typeof f.apply === 'function') {
      f.apply();
      applied.push(f.id);
    }
  }
  return applied;
}

export async function runDoctor(argv) {
  const json = argv.includes('--json');
  const fix = argv.includes('--fix');
  const targetIdx = argv.indexOf('--target');
  const target = targetIdx >= 0 ? argv[targetIdx + 1] : process.cwd();

  const report = runDoctorChecks(target);

  if (fix) {
    const applied = applyAutoFixes(report);
    if (json) {
      console.log(JSON.stringify({ applied }, null, 2));
    } else {
      console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'Nothing to auto-fix.');
    }
    return 0;
  }

  const output = { findings: report.findings.map(({ apply, ...rest }) => rest), ruleRegistryAvailable: report.ruleRegistryAvailable };

  if (json) {
    console.log(JSON.stringify(output, null, 2));
  } else if (output.findings.length === 0) {
    console.log('crisp doctor: clean — no drift found.');
  } else {
    for (const f of output.findings) {
      console.log(`[${f.severity}] ${f.id} (${f.artifact})\n  ${f.summary}\n  Fix: ${f.fix}\n`);
    }
  }

  return 0; // findings are reported, not failures — never exit non-zero here
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  process.exit(await runDoctor(process.argv.slice(2)));
}
