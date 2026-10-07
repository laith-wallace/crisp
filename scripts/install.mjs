#!/usr/bin/env node
/**
 * scripts/install.mjs
 *
 * Creates symlinks in global platform skill dirs so CRISP skills are available
 * in any project, not just crispskills/.
 *
 * Run: npm run install-global
 * Run sync first if skills haven't been built yet: npm run sync
 *
 * Platform targets:
 *   Claude Code    ~/.claude/skills/[name]        → {project}/.claude/skills/[name]
 *   Cursor         ~/.cursor/skills/[name]         → {project}/.cursor/skills/[name]
 *   Codex/Agents   ~/.agents/skills/[name]         → {project}/.agents/skills/[name]
 *   Gemini CLI     ~/.gemini/skills/[name]         → {project}/.gemini/skills/[name]
 */

import { readdirSync, mkdirSync, symlinkSync, lstatSync, unlinkSync, readlinkSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const HOME = homedir();

// Every skills/[name]/SKILL.md folder is a skill.
const SKILLS_SRC = join(ROOT, 'skills');
const SKILLS = readdirSync(SKILLS_SRC)
  .filter(f => f !== '_shared' && statSync(join(SKILLS_SRC, f)).isDirectory() && existsSync(join(SKILLS_SRC, f, 'SKILL.md')));

const PLATFORMS = [
  {
    name: 'Claude Code',
    requireHome: join(HOME, '.claude'),
    globalDir:   join(HOME, '.claude', 'skills'),
    srcForSkill: name => join(ROOT, '.claude', 'skills', name),
  },
  {
    name: 'Cursor',
    requireHome: join(HOME, '.cursor'),
    globalDir:   join(HOME, '.cursor', 'skills'),
    srcForSkill: name => join(ROOT, '.cursor', 'skills', name),
  },
  {
    name: 'Codex, Copilot, Antigravity',
    requireHome: join(HOME, '.agents'),
    globalDir:   join(HOME, '.agents', 'skills'),
    srcForSkill: name => join(ROOT, '.agents', 'skills', name),
  },
  {
    name: 'Gemini CLI',
    requireHome: join(HOME, '.gemini'),
    globalDir:   join(HOME, '.gemini', 'skills'),
    srcForSkill: name => join(ROOT, '.gemini', 'skills', name),
  },
];

function symlinkStatus(linkPath) {
  let stat;
  try { stat = lstatSync(linkPath); } catch { return 'absent'; }
  if (stat.isSymbolicLink()) return { type: 'symlink', current: readlinkSync(linkPath) };
  return { type: stat.isDirectory() ? 'directory' : 'file' };
}

function createOrUpdateSymlink(linkPath, targetPath) {
  const status = symlinkStatus(linkPath);
  if (status === 'absent') { symlinkSync(targetPath, linkPath); return 'created'; }
  if (status.type === 'symlink') {
    if (status.current === targetPath) return 'skipped';
    unlinkSync(linkPath);
    symlinkSync(targetPath, linkPath);
    return 'updated';
  }
  return 'conflict';
}

let created = 0, updated = 0, skipped = 0, conflicts = 0, errors = 0;

console.log(`\nCRISP install-global - ${SKILLS.length} skills, ${PLATFORMS.length} platforms\n`);

for (const platform of PLATFORMS) {
  if (!existsSync(platform.requireHome)) {
    console.log(`[${platform.name}] - skipped (${platform.requireHome} not found)\n`);
    continue;
  }

  console.log(`[${platform.name}]`);

  try {
    mkdirSync(platform.globalDir, { recursive: true });
  } catch (err) {
    console.error(`  ✗ Could not create ${platform.globalDir}: ${err.message}`);
    errors++;
    console.log('');
    continue;
  }

  for (const skill of SKILLS) {
    const src      = platform.srcForSkill(skill);
    const linkPath = join(platform.globalDir, skill);

    if (!existsSync(src)) {
      console.error(`  ✗ ${skill} - source missing, run "npm run sync" first`);
      errors++;
      continue;
    }

    try {
      const result    = createOrUpdateSymlink(linkPath, src);
      const shortLink = linkPath.replace(HOME, '~');
      if (result === 'created')  { console.log(`  + ${shortLink}`); created++; }
      if (result === 'updated')  { console.log(`  ↺ ${shortLink} (replaced stale link)`); updated++; }
      if (result === 'skipped')  { console.log(`  ✓ ${shortLink}`); skipped++; }
      if (result === 'conflict') { console.warn(`  ⚠ ${shortLink} - real file exists, skipping`); conflicts++; }
    } catch (err) {
      console.error(`  ✗ ${skill}: ${err.message}`);
      errors++;
    }
  }

  console.log('');
}

console.log(`Done: ${created} created, ${updated} updated, ${skipped} already correct, ${conflicts} conflicts, ${errors} errors.\n`);
if (errors > 0 || conflicts > 0) process.exit(1);
