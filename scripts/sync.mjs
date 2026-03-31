#!/usr/bin/env node
/**
 * scripts/sync.mjs
 *
 * Copies every .md file from files/ to all four platform directories.
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
const FILES_DIR = join(ROOT, 'files');

// Read all .md files from files/
const sourceFiles = readdirSync(FILES_DIR)
  .filter(f => extname(f) === '.md')
  .map(f => ({ name: basename(f, '.md'), path: join(FILES_DIR, f), file: f }));

const skillFiles = sourceFiles.filter(f => !['BENCHMARKS', 'CHANGELOG', 'CONTRIBUTING'].includes(f.name));
const docFiles = sourceFiles.filter(f => ['BENCHMARKS', 'CHANGELOG', 'CONTRIBUTING'].includes(f.name));

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

  console.log('');
}

// Sync doc files (BENCHMARKS.md, CHANGELOG.md, CONTRIBUTING.md) to files/ only
// They're already there — no platform copy needed for these
if (docFiles.length > 0) {
  console.log(`[docs — files/ only]`);
  for (const doc of docFiles) {
    console.log(`  ✓ files/${doc.file} (already canonical)`);
  }
  console.log('');
}

console.log(`Sync complete: ${copied} files copied, ${errors} errors.\n`);
if (errors > 0) process.exit(1);
