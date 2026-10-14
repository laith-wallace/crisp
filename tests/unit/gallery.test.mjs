import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadCases, renderGallery } from '../../scripts/gallery.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SAMPLE = join(ROOT, 'tests', 'fixtures', 'gallery-sample');
const SCRIPT = join(ROOT, 'scripts', 'gallery.mjs');

test('pairs folder: prompt, grades and detector counts on each side', () => {
  const [c] = loadCases(SAMPLE);
  assert.equal(c.id, 'italian-restaurant');
  assert.match(c.prompt, /family Italian restaurant/);
  assert.equal(c.sides.without.grade.grade, 'D');
  assert.equal(c.sides.with.grade.grade, 'B');
  assert.ok(c.sides.without.hits >= 5, `slop side should trip the detector (got ${c.sides.without.hits})`);
  assert.equal(c.sides.with.hits, 0);
  assert.ok(c.sides.without.rules.some(([id]) => id === 'gradient-text'));
});

test('CLI writes one self-contained page with sandboxed side-by-side frames', () => {
  const out = mkdtempSync(join(tmpdir(), 'crisp-gallery-'));
  try {
    execFileSync('node', [SCRIPT, SAMPLE, '--out', out], { encoding: 'utf8' });
    const html = readFileSync(join(out, 'index.html'), 'utf8');

    const frames = html.match(/<iframe [^>]*>/g) || [];
    assert.equal(frames.length, 2);
    for (const f of frames) {
      assert.match(f, /sandbox=""/, 'no scripts, forms or navigation from model output');
      assert.match(f, /srcdoc="/);
    }
    assert.match(html, /Without CRISP/);
    assert.match(html, /With CRISP/);
    assert.match(html, /Build a homepage for a family Italian restaurant\./);
    assert.match(html, /<strong>D<\/strong>/);
    assert.match(html, /<strong>B<\/strong>/);
    assert.match(html, /prefers-color-scheme: dark/);
    assert.match(html, /name="viewport"/);

    // Self-contained: no external scripts or stylesheets in the gallery chrome.
    const chrome = html.replace(/srcdoc="[^"]*"/g, '');
    assert.doesNotMatch(chrome, /<script|<link[^>]+stylesheet/);
    // The embedded page is escaped, so its markup cannot break out of the attribute.
    assert.doesNotMatch(html, /srcdoc="<!doctype/i);
    assert.match(html, /srcdoc="&lt;!doctype html&gt;/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('eval results folder: baseline is "without", plugin is "with", grades from grades.json', () => {
  const dir = mkdtempSync(join(tmpdir(), 'crisp-gallery-res-'));
  try {
    writeFileSync(join(dir, 'run.json'), JSON.stringify({
      model: 'claude-sonnet-5',
      cases: [{
        case: 'settings-page',
        prompt: 'Build a settings page.',
        runs: [
          { arm: 'baseline', output: '<!doctype html><html><body><div onclick="x()">Save</div></body></html>' },
          { arm: 'with_plugin', output: '<!doctype html><html><body><main><button>Save</button></main></body></html>' },
        ],
      }],
    }));
    writeFileSync(join(dir, 'grades.json'), JSON.stringify({ 'settings-page': { without: 'C', with: { grade: 'A' } } }));
    const cases = loadCases(dir);
    assert.equal(cases.length, 1);
    assert.equal(cases[0].prompt, 'Build a settings page.');
    assert.equal(cases[0].sides.without.grade.grade, 'C');
    assert.equal(cases[0].sides.with.grade.grade, 'A');
    assert.match(renderGallery(cases), /Across 1 prompt with both sides/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a missing side renders a placeholder, and an empty folder is a usage error', () => {
  const dir = mkdtempSync(join(tmpdir(), 'crisp-gallery-one-'));
  try {
    mkdirSync(join(dir, 'only-without'));
    writeFileSync(join(dir, 'only-without', 'without.html'), '<!doctype html><html><body><p>Hi</p></body></html>');
    const html = renderGallery(loadCases(dir));
    assert.match(html, /No output for this side\./);
    assert.match(html, /No prompt has both sides yet\./);

    const empty = mkdtempSync(join(tmpdir(), 'crisp-gallery-empty-'));
    let code = 0;
    try { execFileSync('node', [SCRIPT, empty, '--out', join(empty, 'g')], { stdio: 'pipe' }); } catch (err) { code = err.status; }
    assert.equal(code, 1);
    assert.equal(existsSync(join(empty, 'g', 'index.html')), false);
    rmSync(empty, { recursive: true, force: true });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
