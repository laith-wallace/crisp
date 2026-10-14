import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// sync.mjs resolves ROOT from its own location, so a copy in a temp tree syncs that tree only.
const SYNC = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'sync.mjs');

const SKILL = `---
name: demo-skill
description: Demo skill for the sync overlay test. Use when testing sync.
metadata:
  version: "1.0.0"
---

# Demo

<!-- crisp:shared slop-tells -->
stale
<!-- /crisp:shared slop-tells -->

Tail text.
`;

function makeTree() {
  const root = mkdtempSync(join(tmpdir(), 'crisp-sync-'));
  mkdirSync(join(root, 'scripts'));
  copyFileSync(SYNC, join(root, 'scripts', 'sync.mjs'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'demo', version: '0.0.1', type: 'module' }));
  mkdirSync(join(root, 'skills', '_shared'), { recursive: true });
  mkdirSync(join(root, 'skills', 'demo-skill'));
  mkdirSync(join(root, 'skills', 'plain-skill'));
  writeFileSync(join(root, 'skills', 'demo-skill', 'SKILL.md'), SKILL);
  writeFileSync(join(root, 'skills', 'plain-skill', 'SKILL.md'), SKILL.replace(/demo-skill/g, 'plain-skill').replace(/<!--[\s\S]*?slop-tells -->\n/g, ''));
  writeFileSync(join(root, 'skills', '_shared', 'slop-tells.md'), 'COMMON LIST\n');
  writeFileSync(join(root, 'skills', '_shared', 'slop-tells.claude.md'), 'CLAUDE ONLY\n');
  writeFileSync(join(root, 'skills', '_shared', 'slop-tells.gemini.md'), 'GEMINI ONLY\n');
  return root;
}

function run(root, ...args) {
  return spawnSync('node', [join(root, 'scripts', 'sync.mjs'), ...args], { cwd: root, encoding: 'utf8' });
}

const read = (root, rel) => readFileSync(join(root, rel), 'utf8');

test('overlay lands only in its own platform copy; canonical keeps the common list', () => {
  const root = makeTree();
  try {
    const res = run(root);
    assert.equal(res.status, 0, res.stderr);

    const canonical = read(root, 'skills/demo-skill/SKILL.md');
    assert.match(canonical, /<!-- crisp:shared slop-tells -->\nCOMMON LIST\n<!-- \/crisp:shared slop-tells -->/);
    assert.doesNotMatch(canonical, /ONLY/);

    const claude = read(root, '.claude/skills/demo-skill/SKILL.md');
    assert.match(claude, /COMMON LIST\n\nCLAUDE ONLY\n<!-- \/crisp:shared slop-tells -->\n\nTail text\./);
    assert.doesNotMatch(claude, /GEMINI ONLY/);

    const gemini = read(root, '.gemini/skills/demo-skill/SKILL.md');
    assert.match(gemini, /COMMON LIST\n\nGEMINI ONLY\n<!-- \/crisp:shared slop-tells -->/);
    assert.doesNotMatch(gemini, /CLAUDE ONLY/);

    // No overlay file for these platforms: byte-identical to canonical.
    assert.equal(read(root, '.agents/skills/demo-skill/SKILL.md'), canonical);
    assert.equal(read(root, '.cursor/skills/demo-skill/SKILL.md'), canonical);

    // A skill without the region is untouched everywhere.
    assert.equal(read(root, '.claude/skills/plain-skill/SKILL.md'), read(root, 'skills/plain-skill/SKILL.md'));

    assert.equal(run(root, '--check').status, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('check mode catches overlay drift and a hand-edited platform copy', () => {
  const root = makeTree();
  try {
    assert.equal(run(root).status, 0);

    writeFileSync(join(root, 'skills', '_shared', 'slop-tells.claude.md'), 'CLAUDE ONLY, REVISED\n');
    let res = run(root, '--check');
    assert.equal(res.status, 1);
    assert.match(res.stderr, /\.claude\/skills\/demo-skill\/SKILL\.md/);
    assert.doesNotMatch(res.stderr, /\.gemini\/skills\/demo-skill/);
    assert.match(read(root, '.claude/skills/demo-skill/SKILL.md'), /CLAUDE ONLY\n/, 'check must not write');

    assert.equal(run(root).status, 0);
    assert.equal(run(root, '--check').status, 0);

    // Stripping the overlay from a platform copy by hand is drift too.
    const gem = join(root, '.gemini', 'skills', 'demo-skill', 'SKILL.md');
    writeFileSync(gem, read(root, 'skills/demo-skill/SKILL.md'));
    res = run(root, '--check');
    assert.equal(res.status, 1);
    assert.match(res.stderr, /\.gemini\/skills\/demo-skill\/SKILL\.md/);

    // A new overlay with no copy yet is drift.
    assert.equal(run(root).status, 0);
    writeFileSync(join(root, 'skills', '_shared', 'slop-tells.cursor.md'), 'CURSOR ONLY\n');
    res = run(root, '--check');
    assert.equal(res.status, 1);
    assert.match(res.stderr, /\.cursor\/skills\/demo-skill\/SKILL\.md/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('an overlay for an unknown platform or block fails lint', () => {
  const root = makeTree();
  try {
    writeFileSync(join(root, 'skills', '_shared', 'slop-tells.vscode.md'), 'X\n');
    const res = run(root, '--check');
    assert.equal(res.status, 1);
    assert.match(res.stderr, /slop-tells\.vscode\.md/);
    assert.equal(existsSync(join(root, '.claude')), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
