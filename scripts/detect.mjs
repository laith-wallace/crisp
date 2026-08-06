#!/usr/bin/env node
/**
 * scripts/detect.mjs
 *
 * CLI entry point for the CRISP deterministic detector. Consumed two ways:
 *   - `npx @laith-wallace/crisp detect <target>` (bin/crisp.mjs delegates here)
 *   - `node scripts/detect.mjs <target>` directly, for local dev in this repo
 *
 * Usage:
 *   crisp detect src/                    scan a directory
 *   crisp detect index.html              scan one file
 *   crisp detect --json .                CI-friendly JSON output
 *   crisp detect --no-config src/        ignore .crisp/config.json
 *   crisp detect --no-inline-ignores .   ignore crisp-disable comments too
 *
 * Exit code: 0 = clean, 2 = findings, 1 = usage/runtime error.
 */

import { scan } from './detector/engine.mjs';
import { loadConfig, makeIsIgnored } from './detector/ignores.mjs';

const SEVERITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

export function runDetect(argv) {
  const args = argv.filter(a => a !== '--json' && a !== '--no-config' && a !== '--no-inline-ignores');
  const json = argv.includes('--json');
  const noConfig = argv.includes('--no-config');
  const noInlineIgnores = argv.includes('--no-inline-ignores');

  if (args.length === 0) {
    console.error('Usage: crisp detect [--json] [--no-config] [--no-inline-ignores] <path...>');
    return 1;
  }

  let isIgnored = () => false;
  if (!noConfig) {
    try {
      const config = loadConfig();
      isIgnored = makeIsIgnored(config);
    } catch (err) {
      console.error(`Warning: ${err.message} — continuing with no config-level ignores.`);
    }
  }

  const { findings, filesScanned } = scan(args, { isIgnored, noInlineIgnores });
  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.file.localeCompare(b.file) || a.line - b.line);

  if (json) {
    console.log(JSON.stringify({ filesScanned, findingCount: findings.length, findings }, null, 2));
  } else {
    if (findings.length === 0) {
      console.log(`crisp detect: clean — ${filesScanned} file(s) scanned, 0 findings.`);
    } else {
      for (const f of findings) {
        console.log(`${f.file}:${f.line}  [${f.severity}] ${f.id} — ${f.message}`);
        if (f.snippet) console.log(`    ${f.snippet}`);
      }
      console.log(`\ncrisp detect: ${findings.length} finding(s) across ${filesScanned} file(s) scanned.`);
    }
  }

  return findings.length > 0 ? 2 : 0;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  process.exit(runDetect(process.argv.slice(2)));
}
