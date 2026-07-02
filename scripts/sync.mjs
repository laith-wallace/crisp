#!/usr/bin/env node
/**
 * scripts/sync.mjs
 *
 * Copies every skill from skills/ to all four platform directories.
 *
 * Two source shapes:
 *   Flat skill        skills/[name].md, with optional companion .html assets
 *                     (a sibling whose name matches the skill, e.g.
 *                     crisp-funnel-kit.html for crisp-funnel).
 *   Directory skill   skills/[name]/SKILL.md plus references/ and assets.
 *                     The whole tree travels to tree-based platforms; flat
 *                     platforms receive SKILL.md and references concatenated
 *                     into a single file.
 *
 * Run manually:    npm run sync
 * Run on publish:  prepublishOnly hook calls this automatically.
 *
 * Platform targets:
 *   Claude Code    .claude/skills/[name]/   (tree)
 *   Antigravity    .agents/skills/[name]/   (tree)
 *   Cursor         .cursor/rules/[name].md  (flat)
 *   Gemini CLI     .gemini/skills/[name].md (flat)
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync, copyFileSync, statSync, existsSync } from 'node:fs';
import { join, basename, extname, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SKILLS_DIR = join(ROOT, 'skills');

const dirEntries = readdirSync(SKILLS_DIR);

// Directory skills: skills/[name]/SKILL.md
const dirSkills = dirEntries
  .filter(f => statSync(join(SKILLS_DIR, f)).isDirectory() && existsSync(join(SKILLS_DIR, f, 'SKILL.md')))
  .map(f => ({ name: f, path: join(SKILLS_DIR, f) }));
const dirSkillNames = new Set(dirSkills.map(s => s.name));

// Read all .md files from skills/
const sourceFiles = dirEntries
  .filter(f => extname(f) === '.md')
  .map(f => ({ name: basename(f, '.md'), path: join(SKILLS_DIR, f), file: f }))
  .filter(f => !dirSkillNames.has(f.name)); // a directory skill owns its name

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

// Recursively list every file in a directory skill, as paths relative to its root.
function treeFiles(root, dir = root) {
  return readdirSync(dir).flatMap(entry => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? treeFiles(root, full) : [relative(root, full)];
  });
}

// Flatten a directory skill into one markdown document for flat platforms:
// SKILL.md first, then each references/*.md appended under a labelled divider.
function flattenSkill(skill) {
  let out = readFileSync(join(skill.path, 'SKILL.md'), 'utf8');
  const refsDir = join(skill.path, 'references');
  if (existsSync(refsDir)) {
    for (const ref of readdirSync(refsDir).filter(f => extname(f) === '.md').sort()) {
      out += `\n\n---\n\n<!-- references/${ref} -->\n\n${readFileSync(join(refsDir, ref), 'utf8')}`;
    }
  }
  return out;
}

function writeOut(dest, content) {
  try {
    ensureDir(dirname(dest));
    writeFileSync(dest, content);
    console.log(`  ✓ ${dest.replace(ROOT + '/', '')} (flattened)`);
    copied++;
  } catch (err) {
    console.error(`  ✗ ${dest.replace(ROOT + '/', '')} — ${err.message}`);
    errors++;
  }
}

console.log(`\nCRISP sync — ${skillFiles.length + dirSkills.length} skills, ${docFiles.length} docs\n`);

// Sync each directory skill: full tree to Claude Code and Antigravity,
// flattened single file (plus .html assets) to Cursor and Gemini.
for (const skill of dirSkills) {
  console.log(`[${skill.name}]`);

  for (const rel of treeFiles(skill.path)) {
    copy(join(skill.path, rel), join(ROOT, '.claude', 'skills', skill.name, rel));
    copy(join(skill.path, rel), join(ROOT, '.agents', 'skills', skill.name, rel));
  }

  const flat = flattenSkill(skill);
  writeOut(join(ROOT, '.cursor', 'rules', `${skill.name}.md`), flat);
  writeOut(join(ROOT, '.gemini', 'skills', `${skill.name}.md`), flat);

  for (const rel of treeFiles(skill.path).filter(f => extname(f) === '.html')) {
    copy(join(skill.path, rel), join(ROOT, '.cursor', 'rules', basename(rel)));
    copy(join(skill.path, rel), join(ROOT, '.gemini', 'skills', basename(rel)));
  }

  console.log('');
}

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
