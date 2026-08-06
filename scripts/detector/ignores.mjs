/**
 * scripts/detector/ignores.mjs
 *
 * Repo-level detector config: .crisp/config.json under `detector`:
 *   { "detector": { "ignoreRules": [...], "ignoreFiles": [...], "ignoreValues": { "<rule-id>": [...] } } }
 *
 * ignoreRules  - rule ids to drop everywhere in this repo
 * ignoreFiles  - glob patterns (supports *, **, ?) matched against the
 *                finding's path relative to the repo root
 * ignoreValues - rule id -> list of substrings; a finding whose snippet
 *                contains one of them is dropped (a named exception, e.g.
 *                an approved brand gradient)
 *
 * This is the config-driven layer. Inline `crisp-disable` comments (per
 * file/line) are handled separately in engine.mjs, since they need the raw
 * file text rather than a repo-wide config.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const CONFIG_PATH = join(process.cwd(), '.crisp', 'config.json');

export function loadConfig(path = CONFIG_PATH) {
  if (!existsSync(path)) return { detector: { ignoreRules: [], ignoreFiles: [], ignoreValues: {} } };
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    return {
      detector: {
        ignoreRules: raw.detector?.ignoreRules ?? [],
        ignoreFiles: raw.detector?.ignoreFiles ?? [],
        ignoreValues: raw.detector?.ignoreValues ?? {},
      },
    };
  } catch (err) {
    throw new Error(`.crisp/config.json is not valid JSON: ${err.message}`);
  }
}

/** Minimal glob -> RegExp: supports `**` (any depth), `*` (one segment), `?` (one char). */
function globToRegExp(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      out += '.*';
      i++;
    } else if (c === '*') {
      out += '[^/]*';
    } else if (c === '?') {
      out += '[^/]';
    } else if ('.+^${}()|[]\\'.includes(c)) {
      out += '\\' + c;
    } else {
      out += c;
    }
  }
  return new RegExp(`^${out}$`);
}

export function isIgnoredBy(config, finding) {
  const { ignoreRules, ignoreFiles, ignoreValues } = config.detector;

  if (ignoreRules.includes(finding.id)) return true;

  for (const pattern of ignoreFiles) {
    if (globToRegExp(pattern).test(finding.file)) return true;
  }

  const values = ignoreValues[finding.id];
  if (values) {
    for (const entry of values) {
      const value = typeof entry === 'string' ? entry : entry.value;
      if (value && finding.snippet.toLowerCase().includes(String(value).toLowerCase())) return true;
    }
  }

  return false;
}

export function makeIsIgnored(config) {
  return finding => isIgnoredBy(config, finding);
}

export function saveConfig(config, path = CONFIG_PATH) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
}

export function addIgnoreFile(pattern, path = CONFIG_PATH) {
  const config = loadConfig(path);
  if (!config.detector.ignoreFiles.includes(pattern)) config.detector.ignoreFiles.push(pattern);
  saveConfig(config, path);
  return config;
}

export function addIgnoreValue(ruleId, value, reason, path = CONFIG_PATH) {
  const config = loadConfig(path);
  if (!config.detector.ignoreValues[ruleId]) config.detector.ignoreValues[ruleId] = [];
  const list = config.detector.ignoreValues[ruleId];
  if (!list.some(e => (typeof e === 'string' ? e : e.value) === value)) {
    list.push(reason ? { value, reason } : { value });
  }
  saveConfig(config, path);
  return config;
}
