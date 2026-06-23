#!/usr/bin/env node
/**
 * scripts/sync.mjs
 *
 * Copies every .md file from skills/ to all four platform directories.
 * A skill's companion .html asset (a sibling whose name matches the skill,
 * e.g. crisp-funnel-kit.html for crisp-funnel) travels with it.
 * Run manually:    npm run sync
 * Run on publish:  prepublishOnly hook calls this automatically.
 *
 * Platform targets:
 *   Claude Code    .claude/skills/[name]/SKILL.md
 *   Cursor         .cursor/rules/[name].md
 *   Antigravity    .agents/skills/[name]/SKILL.md
 *   Gemini CLI     .gemini/skills/[name].md
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SKILLS_DIR = join(ROOT, 'skills');

const dirEntries = readdirSync(SKILLS_DIR);

// Read all .md files from skills/
const sourceFiles = dirEntries
  .filter(f => extname(f) === '.md')
  .map(f => ({ name: basename(f, '.md'), path: join(SKILLS_DIR, f), file: f }));

// Companion assets (e.g. crisp-funnel-kit.html) — copied alongside the skill they belong to.
const assetFiles = dirEntries
  .filter(f => extname(f) === '.html')
  .map(f => ({ name: basename(f, '.html'), path: join(SKILLS_DIR, f), file: f }));

const skillFiles = sourceFiles.filter(f => !['BENCHMARKS', 'CHANGELOG', 'CONTRIBUTING'].includes(f.name));
const docFiles = sourceFiles.filter(f => ['BENCHMARKS', 'CHANGELOG', 'CONTRIBUTING'].includes(f.name));

// An asset belongs to a skill when its name equals the skill name or starts with `${skill}-`.
function assetsForSkill(skillName) {
  return assetFiles.filter(a => a.name === skillName || a.name.startsWith(`${skillName}-`));
}

let copied = 0;
let errors = 0;

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function copy(src, dest) {
  try {
    ensureDir(dirname(dest));
    copyFileSync(src, dest);
    console.log(`  ✓ ${dest.replace(ROOT + '/', '')}`);
    copied++;
  } catch (err) {
    console.error(`  ✗ ${dest.replace(ROOT + '/', '')} — ${err.message}`);
    errors++;
  }
}

console.log(`\nCRISP sync — ${skillFiles.length} skills, ${docFiles.length} docs\n`);

// Sync each skill file to all four platform directories
for (const skill of skillFiles) {
  console.log(`[${skill.name}]`);

  // Claude Code: .claude/skills/[name]/SKILL.md
  copy(skill.path, join(ROOT, '.claude', 'skills', skill.name, 'SKILL.md'));

  // Cursor: .cursor/rules/[name].md
  copy(skill.path, join(ROOT, '.cursor', 'rules', `${skill.name}.md`));

  // Antigravity: .agents/skills/[name]/SKILL.md
  copy(skill.path, join(ROOT, '.agents', 'skills', skill.name, 'SKILL.md'));

  // Gemini CLI: .gemini/skills/[name].md
  copy(skill.path, join(ROOT, '.gemini', 'skills', `${skill.name}.md`));

  // Companion assets travel into the same skill location on each platform.
  for (const asset of assetsForSkill(skill.name)) {
    copy(asset.path, join(ROOT, '.claude', 'skills', skill.name, asset.file));
    copy(asset.path, join(ROOT, '.cursor', 'rules', asset.file));
    copy(asset.path, join(ROOT, '.agents', 'skills', skill.name, asset.file));
    copy(asset.path, join(ROOT, '.gemini', 'skills', asset.file));
  }

  console.log('');
}

// Doc files (BENCHMARKS.md, CHANGELOG.md, CONTRIBUTING.md) stay canonical in skills/
// They're already there — no platform copy needed for these
if (docFiles.length > 0) {
  console.log(`[docs — skills/ only]`);
  for (const doc of docFiles) {
    console.log(`  ✓ skills/${doc.file} (already canonical)`);
  }
  console.log('');
}

console.log(`Sync complete: ${copied} files copied, ${errors} errors.\n`);
if (errors > 0) process.exit(1);
