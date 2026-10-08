#!/usr/bin/env node
/**
 * scripts/sync.mjs
 *
 * Builds every platform copy of the pack from the canonical skills/ sources.
 *
 * Source shape (one only): skills/[name]/SKILL.md plus optional references/,
 * scripts/, and assets. This is the Agent Skills layout
 * (https://agentskills.io/specification); every supported harness now reads
 * it natively, so each skill travels as a whole folder.
 *
 * Steps:
 *   1. Shared blocks: rewrite <!-- crisp:shared name --> regions in place.
 *   2. Lint: name matches folder, description says what and when, version
 *      lives under metadata, no flat skill files left in skills/.
 *   3. Version: copy package.json's version into .claude-plugin/*.json.
 *   4. Copy: wipe and rebuild each platform folder below.
 *
 * Run manually:    npm run sync
 * Run on publish:  prepublishOnly hook calls this automatically.
 * Check only:      npm run check  (exits 1 on any drift, writes nothing)
 *
 * Platform targets (all full folders):
 *   Claude Code    .claude/skills/[name]/
 *   Codex, Antigravity, Copilot (agents standard)  .agents/skills/[name]/
 *   Cursor         .cursor/skills/[name]/
 *   Gemini CLI     .gemini/skills/[name]/
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync, copyFileSync, statSync, existsSync, rmSync } from 'node:fs';
import { join, basename, extname, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SKILLS_DIR = join(ROOT, 'skills');
const SHARED_DIR = join(SKILLS_DIR, '_shared');
const CHECK_ONLY = process.argv.includes('--check');

const DOC_FILES = new Set(['BENCHMARKS.md', 'CHANGELOG.md', 'CONTRIBUTING.md']);
const PLATFORM_DIRS = [
  join(ROOT, '.claude', 'skills'),
  join(ROOT, '.agents', 'skills'),
  join(ROOT, '.cursor', 'skills'),
  join(ROOT, '.gemini', 'skills'),
];
// Output shapes from before 1.11 (flat files). Removed on sync so stale copies never linger.
const LEGACY_OUTPUTS = [join(ROOT, '.cursor', 'rules')];

const problems = [];

// ─── Skills ───

const skills = readdirSync(SKILLS_DIR)
  .filter(f => f !== '_shared' && statSync(join(SKILLS_DIR, f)).isDirectory())
  .map(name => ({ name, path: join(SKILLS_DIR, name) }));

for (const f of readdirSync(SKILLS_DIR)) {
  const full = join(SKILLS_DIR, f);
  if (statSync(full).isDirectory() || DOC_FILES.has(f)) continue;
  problems.push(`skills/${f}: only skill folders and ${[...DOC_FILES].join(', ')} belong in skills/`);
}

// ─── Shared blocks ───
// skills/_shared/[block].md is the single source for rules several skills state.
// A skill marks the region with <!-- crisp:shared name --> ... <!-- /crisp:shared name -->
// and this step rewrites the region in place, before any platform copy.

const sharedBlocks = existsSync(SHARED_DIR)
  ? Object.fromEntries(readdirSync(SHARED_DIR)
      .filter(f => extname(f) === '.md' && f !== 'README.md')
      .map(f => [basename(f, '.md'), readFileSync(join(SHARED_DIR, f), 'utf8').trim()]))
  : {};

// Markers count only on a line of their own, so prose that mentions the syntax inline is left alone.
const SHARED_RE = /^<!-- crisp:shared ([a-z0-9-]+) -->\n[\s\S]*?^<!-- \/crisp:shared \1 -->$/gm;

function renderShared(text, file) {
  const opens = [...text.matchAll(/^<!-- crisp:shared ([a-z0-9-]+) -->$/gm)].map(m => m[1]);
  const closes = [...text.matchAll(/^<!-- \/crisp:shared ([a-z0-9-]+) -->$/gm)].map(m => m[1]);
  if (opens.join() !== closes.join()) {
    throw new Error(`${file}: unbalanced crisp:shared markers (open: ${opens.join(', ') || 'none'}; close: ${closes.join(', ') || 'none'})`);
  }
  return text.replace(SHARED_RE, (_, name) => {
    if (!(name in sharedBlocks)) throw new Error(`${file}: unknown shared block "${name}" (no skills/_shared/${name}.md)`);
    return `<!-- crisp:shared ${name} -->\n${sharedBlocks[name]}\n<!-- /crisp:shared ${name} -->`;
  });
}

function treeFiles(root, dir = root) {
  return readdirSync(dir).flatMap(entry => {
    if (entry === '.DS_Store') return [];
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? treeFiles(root, full) : [relative(root, full)];
  });
}

const sharedDrift = [];
for (const skill of skills) {
  for (const rel of treeFiles(skill.path).filter(f => extname(f) === '.md')) {
    const file = join(skill.path, rel);
    const before = readFileSync(file, 'utf8');
    let after;
    try {
      after = renderShared(before, relative(ROOT, file));
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      process.exit(1);
    }
    if (after === before) continue;
    sharedDrift.push(relative(ROOT, file));
    if (!CHECK_ONLY) writeFileSync(file, after);
  }
}

// ─── Lint frontmatter ───

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z-]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  fm.metadataVersion = (m[1].match(/^metadata:\n(?:  .*\n)*?  version:\s*"?([^"\n]+)"?/m) || [])[1];
  return fm;
}

for (const skill of skills) {
  const rel = `skills/${skill.name}/SKILL.md`;
  if (!existsSync(join(skill.path, 'SKILL.md'))) { problems.push(`${rel}: missing`); continue; }
  const fm = frontmatter(readFileSync(join(skill.path, 'SKILL.md'), 'utf8'));
  if (!fm) { problems.push(`${rel}: no frontmatter`); continue; }
  if (fm.name !== skill.name) problems.push(`${rel}: name "${fm.name}" does not match folder "${skill.name}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skill.name) || skill.name.length > 64) problems.push(`${rel}: folder name must be lowercase-hyphenated, 64 chars max`);
  if (!fm.description) problems.push(`${rel}: description missing`);
  else {
    // Strict YAML parsers (npx skills) reject an unquoted value containing ": " or " #".
    const rawDesc = (readFileSync(join(skill.path, 'SKILL.md'), 'utf8').match(/^description: (.*)$/m) || [])[1] ?? '';
    if (!/^["'|>]/.test(rawDesc) && /: | #/.test(rawDesc)) problems.push(`${rel}: description contains ": " or " #" so it must be wrapped in double quotes`);
    if (fm.description.length > 1024) problems.push(`${rel}: description is ${fm.description.length} chars (max 1024)`);
    if (!/\bUse (when|for|it|this|after|before|to|during|at|on|as|in)\b/i.test(fm.description)) problems.push(`${rel}: description needs a "Use when ..." trigger clause`);
  }
  if ('version' in fm) problems.push(`${rel}: version belongs under metadata, not top level`);
  if (!fm.metadataVersion) problems.push(`${rel}: metadata.version missing`);
}

// ─── Plugin manifest version ───

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const manifestDrift = [];
for (const file of ['plugin.json', 'marketplace.json']) {
  const path = join(ROOT, '.claude-plugin', file);
  if (!existsSync(path)) continue;
  const json = JSON.parse(readFileSync(path, 'utf8'));
  const targets = file === 'plugin.json' ? [json] : json.plugins ?? [];
  if (targets.some(t => t.version !== pkg.version)) {
    manifestDrift.push(`.claude-plugin/${file}`);
    targets.forEach(t => { t.version = pkg.version; });
    if (!CHECK_ONLY) writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
  }
}

// ─── Platform copies ───

function platformDrift() {
  const drift = [];
  for (const out of PLATFORM_DIRS) {
    const label = relative(ROOT, out);
    const expected = new Set();
    for (const skill of skills) {
      for (const rel of treeFiles(skill.path)) {
        const key = join(skill.name, rel);
        expected.add(key);
        const dest = join(out, key);
        if (!existsSync(dest) || !readFileSync(dest).equals(readFileSync(join(skill.path, rel)))) drift.push(`${label}/${key}`);
      }
    }
    if (existsSync(out)) {
      for (const rel of treeFiles(out)) if (!expected.has(rel)) drift.push(`${label}/${rel} (stale)`);
    }
  }
  for (const legacy of LEGACY_OUTPUTS) if (existsSync(legacy)) drift.push(`${relative(ROOT, legacy)} (legacy flat output)`);
  return drift;
}

if (problems.length > 0) {
  console.error(`\nSkill lint failed:\n${problems.map(p => `  ✗ ${p}`).join('\n')}\n`);
  process.exit(1);
}

if (CHECK_ONLY) {
  const drift = [
    ...sharedDrift.map(f => `${f} (shared block)`),
    ...manifestDrift.map(f => `${f} (version is not ${pkg.version})`),
    ...platformDrift(),
  ];
  if (drift.length > 0) {
    console.error(`\nDrift in ${drift.length} file(s):\n${drift.slice(0, 40).map(f => `  ✗ ${f}`).join('\n')}${drift.length > 40 ? `\n  ...and ${drift.length - 40} more` : ''}\n\nEdit skills/ or skills/_shared/, then run npm run sync.\n`);
    process.exit(1);
  }
  console.log(`\nCheck passed: ${skills.length} skills, ${Object.keys(sharedBlocks).length} shared blocks, version ${pkg.version}, no drift.\n`);
  process.exit(0);
}

if (sharedDrift.length > 0) console.log(`\nShared blocks: refreshed ${sharedDrift.length} file(s): ${sharedDrift.join(', ')}`);
if (manifestDrift.length > 0) console.log(`Plugin manifests: version set to ${pkg.version} in ${manifestDrift.join(', ')}`);

for (const dir of [...PLATFORM_DIRS, ...LEGACY_OUTPUTS]) rmSync(dir, { recursive: true, force: true });

let copied = 0;
for (const skill of skills) {
  for (const rel of treeFiles(skill.path)) {
    for (const out of PLATFORM_DIRS) {
      const dest = join(out, skill.name, rel);
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(join(skill.path, rel), dest);
      copied++;
    }
  }
}

console.log(`\nCRISP sync: ${skills.length} skills to ${PLATFORM_DIRS.length} platforms, ${copied} files copied.\n`);
