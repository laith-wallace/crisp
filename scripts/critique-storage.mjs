#!/usr/bin/env node
/**
 * scripts/critique-storage.mjs
 *
 * Per-slug critique/audit snapshots, so score history is queryable per
 * surface instead of grep'd out of one growing `## History` section in
 * .crisp.md. .crisp.md's History line stays too (cheap, project-wide,
 * human-skimmable) — this is the structured trend source for one target.
 *
 * Layout: .crisp/critique/<slug>--<YYYY-MM-DD>--<HHMMSS>.md
 *   ---
 *   target: <original phrasing>
 *   command: /crisp-audit | /crisp-review
 *   date: YYYY-MM-DD
 *   total_score: <n>
 *   max_score: <n>
 *   p0_count: <n>
 *   p1_count: <n>
 *   ---
 *   <report body>
 *
 * CLI:
 *   crisp critique slug "<target>"
 *   CRISP_CRITIQUE_META='{"target":"...","command":"/crisp-audit","total_score":32,"max_score":40,"p0_count":0,"p1_count":2,"date":"2026-08-05"}' \
 *     crisp critique write "<target>" <body-file>
 *   crisp critique trend "<target>" [n=5]
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STORE_DIR = join(process.cwd(), '.crisp', 'critique');

export function slug(target) {
  const s = String(target).trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || null; // vague/root-level targets slug to null — caller should skip persistence
}

function timestampParts(date) {
  // date: 'YYYY-MM-DD' (required — callers pass it from `date +%Y-%m-%d`, never guess it here).
  // The time-of-day suffix only needs to make same-day runs sort uniquely, so wall-clock
  // time + a random tiebreaker is fine here (unlike Workflow scripts, this is plain Node).
  const now = new Date();
  const hhmmss = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, '0')).join('');
  const rand = Math.random().toString(36).slice(2, 6);
  return `${date}--${hhmmss}-${rand}`;
}

function serializeFrontmatter(meta) {
  const lines = Object.entries(meta).map(([k, v]) => `${k}: ${v === undefined || v === null || v === '' ? '' : v}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

export function write(target, bodyPath, meta) {
  const s = slug(target);
  if (!s) return { skipped: true, reason: 'target slugged to empty/null — vague or root-level target' };

  mkdirSync(STORE_DIR, { recursive: true });
  const body = readFileSync(bodyPath, 'utf8');
  const date = meta.date; // required from caller; never derived from system time in this module
  if (!date) throw new Error('write requires meta.date (get it from `date +%Y-%m-%d`, never from memory)');

  const filename = `${s}--${timestampParts(date)}.md`;
  const path = join(STORE_DIR, filename);
  writeFileSync(path, serializeFrontmatter({ target, ...meta }) + '\n' + body);
  return { skipped: false, path };
}

export function trend(target, n = 5) {
  const s = slug(target);
  if (!s || !existsSync(STORE_DIR)) return [];

  const files = readdirSync(STORE_DIR)
    .filter(f => f.startsWith(`${s}--`) && f.endsWith('.md'))
    .sort(); // date+time-prefixed filenames sort chronologically

  return files.slice(-n).map(f => {
    const text = readFileSync(join(STORE_DIR, f), 'utf8');
    return { file: f, ...parseFrontmatter(text) };
  });
}

export async function runCritiqueStorage(args) {
  const [action, ...rest] = args;

  if (action === 'slug') {
    const [target] = rest;
    console.log(slug(target) ?? '');
    return 0;
  }

  if (action === 'write') {
    const [target, bodyPath] = rest;
    if (!target || !bodyPath) {
      console.error('Usage: CRISP_CRITIQUE_META=\'{"date":"YYYY-MM-DD",...}\' crisp critique write "<target>" <body-file>');
      return 1;
    }
    let meta = {};
    try {
      meta = JSON.parse(process.env.CRISP_CRITIQUE_META || '{}');
    } catch (err) {
      console.error(`CRISP_CRITIQUE_META is not valid JSON: ${err.message}`);
      return 1;
    }
    const result = write(target, bodyPath, meta);
    if (result.skipped) {
      console.log(`Skipped: ${result.reason}`);
    } else {
      console.log(result.path);
    }
    return 0;
  }

  if (action === 'trend') {
    const [target, nRaw] = rest;
    if (!target) {
      console.error('Usage: crisp critique trend "<target>" [n]');
      return 1;
    }
    console.log(JSON.stringify(trend(target, nRaw ? parseInt(nRaw, 10) : 5)));
    return 0;
  }

  console.error(`Unknown critique action: ${action}\nUsage: crisp critique slug|write|trend`);
  return 1;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  process.exit(await runCritiqueStorage(process.argv.slice(2)));
}
