import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLI = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'bin', 'crisp.mjs');

function detect(args) {
  try {
    return { code: 0, out: execFileSync('node', [CLI, 'detect', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }) };
  } catch (err) {
    return { code: err.status, out: err.stdout };
  }
}

test('large --json output survives a pipe intact', () => {
  const dir = mkdtempSync(join(tmpdir(), 'crisp-detect-'));
  try {
    writeFileSync(join(dir, 'a.html'), '<p style="transition: all 1s">x</p><img src="a.png">\n'.repeat(400));
    const { code, out } = detect(['--json', dir]);
    assert.equal(code, 2);
    assert.ok(out.length > 64 * 1024);
    const json = JSON.parse(out);
    assert.equal(json.findings.filter(f => f.id === 'missing-alt-text').length, 400);
    assert.equal(json.findings.filter(f => f.id === 'transition-all').length, 400);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('clean file exits 0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'crisp-detect-'));
  try {
    writeFileSync(join(dir, 'a.html'), '<main><h1>Hi</h1><img src="a.png" alt="A chart of signups"></main>\n');
    assert.equal(detect([dir]).code, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
