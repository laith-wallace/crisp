#!/usr/bin/env node
/**
 * scripts/slop-harvest.mjs
 *
 * Confirms (or refutes) the per-model slop overlays in
 * skills/_shared/slop-tells.<platform>.md. Reads a `claude plugin eval`
 * results folder, keeps the baseline-arm outputs (no plugin) that contain
 * HTML, CSS or JSX, runs the deterministic detector over each one, and
 * prints rule hits per model.
 *
 * Usage:
 *   node scripts/slop-harvest.mjs evals/results/<timestamp>
 *   node scripts/slop-harvest.mjs --json evals/results/<timestamp>
 *   node scripts/slop-harvest.mjs --arm all --min 2 <dir>
 *
 * Options:
 *   --arm baseline|plugin|unknown|all   which arm to count (default baseline)
 *   --min N                             hide rules with fewer than N hits in every model (default 1)
 *   --json                              machine-readable output
 *
 * Reading a cell: "5/3" means 5 hits across 3 outputs. The outputs count is
 * the one to trust: one page with a long list can rack up hits on its own.
 * A row is worth adding to an overlay when it shows up in a clear share of
 * one model's outputs and not the others', across more than one case.
 *
 * Assumptions about the results format live in scripts/eval-results.mjs.
 * Exit code: 0 = ran (even with no outputs found), 1 = usage error.
 */

import { existsSync, statSync } from 'node:fs';
import { readResults } from './eval-results.mjs';
import { scanText } from './detector/engine.mjs';

const ARMS = new Set(['baseline', 'plugin', 'unknown', 'all']);

export function harvest(dir, { arm = 'baseline' } = {}) {
  const { outputs, filesRead } = readResults(dir);
  const kept = outputs.filter(o => arm === 'all' || o.arm === arm);
  const models = {}; // model -> { outputs, cases:Set, rules: { id -> { hits, outputs } } }

  for (const o of kept) {
    const m = (models[o.model] ??= { outputs: 0, cases: new Set(), rules: {} });
    m.outputs++;
    m.cases.add(o.case);
    const findings = scanText(o.code, `harvest${o.ext}`) || [];
    const perRule = {};
    for (const f of findings) perRule[f.id] = (perRule[f.id] || 0) + 1;
    for (const [id, n] of Object.entries(perRule)) {
      const r = (m.rules[id] ??= { hits: 0, outputs: 0 });
      r.hits += n;
      r.outputs++;
    }
  }

  return {
    dir,
    arm,
    filesRead,
    outputsFound: outputs.length,
    outputsScanned: kept.length,
    armsSeen: [...new Set(outputs.map(o => o.arm))].sort(),
    models: Object.fromEntries(Object.entries(models).map(([name, m]) => [name, {
      outputs: m.outputs,
      cases: m.cases.size,
      rules: m.rules,
    }])),
  };
}

export function formatTable(report, min = 1) {
  const names = Object.keys(report.models).sort();
  const lines = [];
  lines.push(`slop-harvest: ${report.dir}`);
  lines.push(`  ${report.filesRead} file(s) read, ${report.outputsFound} UI output(s) found, ${report.outputsScanned} in the ${report.arm} arm (arms seen: ${report.armsSeen.join(', ') || 'none'})`);
  if (names.length === 0) {
    lines.push('', 'No outputs to scan. Check the arm with --arm all, and see scripts/eval-results.mjs for what this reader expects.');
    return lines.join('\n');
  }

  const ruleIds = [...new Set(names.flatMap(n => Object.keys(report.models[n].rules)))]
    .filter(id => names.some(n => (report.models[n].rules[id]?.hits || 0) >= min))
    .sort((a, b) => {
      const total = id => names.reduce((s, n) => s + (report.models[n].rules[id]?.outputs || 0), 0);
      return total(b) - total(a) || a.localeCompare(b);
    });

  const header = ['rule', ...names];
  const rows = [
    ['outputs (cases)', ...names.map(n => `${report.models[n].outputs} (${report.models[n].cases})`)],
    ...ruleIds.map(id => [id, ...names.map(n => {
      const r = report.models[n].rules[id];
      return r ? `${r.hits}/${r.outputs}` : '-';
    })]),
  ];
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map(r => r[i].length)));
  const fmt = r => r.map((c, i) => (i === 0 ? c.padEnd(widths[i]) : c.padStart(widths[i]))).join('  ');
  lines.push('', fmt(header), widths.map(w => '-'.repeat(w)).join('  '), ...rows.map(fmt));
  lines.push('', 'Cells are hits/outputs. Confirm an overlay row only when one model shows it in a clear share of its outputs and the others do not.');
  if (ruleIds.length === 0) lines.push('No rule reached the --min threshold.');
  return lines.join('\n');
}

function main(argv) {
  const json = argv.includes('--json');
  let arm = 'baseline';
  let min = 1;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') continue;
    if (a === '--arm') { arm = argv[++i]; continue; }
    if (a === '--min') { min = Number(argv[++i]); continue; }
    if (a === '--help' || a === '-h') { rest.length = 0; rest.push(null); break; }
    rest.push(a);
  }
  if (rest.length !== 1 || rest[0] === null || !ARMS.has(arm) || !Number.isFinite(min)) {
    console.error('Usage: node scripts/slop-harvest.mjs [--json] [--arm baseline|plugin|unknown|all] [--min N] <results-dir>');
    return 1;
  }
  const dir = rest[0];
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    console.error(`slop-harvest: ${dir} is not a folder`);
    return 1;
  }
  const report = harvest(dir, { arm });
  console.log(json ? JSON.stringify(report, null, 2) : formatTable(report, min));
  return 0;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) process.exitCode = main(process.argv.slice(2));
