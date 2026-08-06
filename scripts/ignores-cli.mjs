#!/usr/bin/env node
/**
 * scripts/ignores-cli.mjs
 *
 * `crisp ignores list|add-file|add-value` — manage .crisp/config.json's
 * detector ignores without hand-editing JSON. Mirrors the shape the detector
 * engine reads in scripts/detector/ignores.mjs.
 */

import { loadConfig, addIgnoreFile, addIgnoreValue } from './detector/ignores.mjs';

function printConfig(config) {
  const { ignoreRules, ignoreFiles, ignoreValues } = config.detector;

  console.log('Ignored rules (everywhere):');
  console.log(ignoreRules.length ? ignoreRules.map(r => `  - ${r}`).join('\n') : '  (none)');

  console.log('\nIgnored files (glob patterns):');
  console.log(ignoreFiles.length ? ignoreFiles.map(f => `  - ${f}`).join('\n') : '  (none)');

  console.log('\nIgnored values (per rule):');
  const ruleIds = Object.keys(ignoreValues);
  if (ruleIds.length === 0) {
    console.log('  (none)');
  } else {
    for (const ruleId of ruleIds) {
      for (const entry of ignoreValues[ruleId]) {
        const value = typeof entry === 'string' ? entry : entry.value;
        const reason = typeof entry === 'object' && entry.reason ? ` — ${entry.reason}` : '';
        console.log(`  - ${ruleId}: "${value}"${reason}`);
      }
    }
  }
}

export async function runIgnores(args) {
  const [action, ...rest] = args;

  if (action === 'list' || !action) {
    printConfig(loadConfig());
    return 0;
  }

  if (action === 'add-file') {
    const [pattern] = rest;
    if (!pattern) {
      console.error('Usage: crisp ignores add-file "<glob-pattern>"');
      return 1;
    }
    addIgnoreFile(pattern);
    console.log(`Added file ignore: ${pattern}`);
    return 0;
  }

  if (action === 'add-value') {
    const reasonIdx = rest.indexOf('--reason');
    const reason = reasonIdx >= 0 ? rest[reasonIdx + 1] : undefined;
    const positional = reasonIdx >= 0 ? rest.slice(0, reasonIdx) : rest;
    const [ruleId, value] = positional;
    if (!ruleId || !value) {
      console.error('Usage: crisp ignores add-value <rule-id> "<value>" [--reason "<text>"]');
      return 1;
    }
    addIgnoreValue(ruleId, value, reason);
    console.log(`Added value ignore for ${ruleId}: "${value}"${reason ? ` (${reason})` : ''}`);
    return 0;
  }

  console.error(`Unknown ignores action: ${action}\nUsage: crisp ignores list|add-file|add-value`);
  return 1;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  process.exit(await runIgnores(process.argv.slice(2)));
}
