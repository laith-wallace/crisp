/**
 * tests/unit/worlds.test.mjs
 *
 * Run: node --test tests/unit/worlds.test.mjs
 * Zero dependencies: node:test + node:assert only.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadWorlds, validateWorld, worldContrast, worldToDesignMd, validateSpec, renderPicker, startServer, WORLDS_DIR,
} from '../../scripts/worlds.mjs';
import { lintDesignMd, parseColor, contrastRatio } from '../../scripts/design-md.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SPEC = JSON.parse(readFileSync(join(ROOT, 'tests/fixtures/worlds/spec.json'), 'utf8'));
const { worlds, errors: loadErrors } = loadWorlds();
const byId = new Map(worlds.map(w => [w.id, w]));
const CLI = join(ROOT, 'bin', 'crisp.mjs');

const tempDir = () => mkdtempSync(join(tmpdir(), 'crisp-worlds-'));

describe('world library', () => {
  test('loads 30 worlds with no parse errors', () => {
    assert.deepEqual(loadErrors, []);
    assert.equal(worlds.length, 30);
  });

  test('every world has the required fields and sections', () => {
    for (const w of worlds) assert.deepEqual(validateWorld(w), [], w.id);
  });

  test('ids are unique and match file names', () => {
    const ids = worlds.map(w => w.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const w of worlds) assert.equal(w.file, `${w.id}.md`);
  });

  test('at least 12 worlds suit the product register', () => {
    assert.ok(worlds.filter(w => w.registers.includes('product')).length >= 12);
  });

  test('ink, muted, accent and signal colours meet WCAG AA on bg', () => {
    for (const w of worlds) {
      const c = w.tokens.colors;
      const ratio = (fg, bg) => contrastRatio(parseColor(c[fg]), parseColor(c[bg]));
      assert.ok(ratio('ink', 'bg') >= 4.5, `${w.id} ink/bg ${ratio('ink', 'bg').toFixed(2)}`);
      assert.ok(ratio('accent', 'bg') >= 4.5, `${w.id} accent/bg ${ratio('accent', 'bg').toFixed(2)}`);
      for (const p of worldContrast(w)) assert.ok(p.ratio >= 4.5, `${w.id} ${p.fg}/${p.bg} ${p.ratio.toFixed(2)}`);
    }
  });

  test('exactly three signature moves and a product UI note per world', () => {
    for (const w of worlds) {
      assert.equal(w.signatureMoves.length, 3, w.id);
      assert.ok(w.sections['In product UI'].length > 80, w.id);
    }
  });

  test('worlds are distinct: no two share display family and accent hue', () => {
    const hue = s => Number(s.match(/oklch\([^ ]+ [^ ]+ ([\d.]+)/)[1]);
    for (let i = 0; i < worlds.length; i++) {
      for (let j = i + 1; j < worlds.length; j++) {
        const a = worlds[i], b = worlds[j];
        const sameType = a.tokens.typography.display.family === b.tokens.typography.display.family;
        const d = Math.abs(hue(a.tokens.colors.accent) - hue(b.tokens.colors.accent));
        const sameHue = Math.min(d, 360 - d) < 20;
        assert.ok(!(sameType && sameHue), `${a.id} and ${b.id} share display face and accent hue`);
      }
    }
  });

  test('a world with a failing colour is rejected', () => {
    const w = structuredClone(byId.get('swiss-timetable'));
    w.tokens.colors.muted = 'oklch(0.85 0 0)';
    assert.ok(validateWorld(w).some(e => /muted on bg/.test(e)));
  });

  test('worlds folder ships inside the skill', () => {
    assert.ok(WORLDS_DIR.endsWith(join('skills', 'crisp-worlds', 'worlds')));
  });
});

describe('to-design-md', () => {
  test('every world converts to a DESIGN.md that lints with 0 findings', () => {
    for (const w of worlds) {
      const findings = lintDesignMd(worldToDesignMd(w));
      assert.deepEqual(findings, [], `${w.id}: ${findings.map(f => f.id).join(', ')}`);
    }
  });

  test('CLI writes DESIGN.md, refuses to overwrite, and crisp design-md lint passes', () => {
    const dir = tempDir();
    try {
      const out = join(dir, 'DESIGN.md');
      let r = spawnSync(process.execPath, [CLI, 'worlds', 'to-design-md', 'ledger-book', '--out', out], { encoding: 'utf8' });
      assert.equal(r.status, 0, r.stderr);
      r = spawnSync(process.execPath, [CLI, 'design-md', 'lint', out], { encoding: 'utf8' });
      assert.equal(r.status, 0, r.stdout);
      r = spawnSync(process.execPath, [CLI, 'worlds', 'to-design-md', 'ledger-book', '--out', out], { encoding: 'utf8' });
      assert.equal(r.status, 1);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('picker', () => {
  const html = renderPicker(SPEC, byId);

  test('fixture spec is valid', () => {
    assert.deepEqual(validateSpec(SPEC, byId), []);
  });

  test('contains every card, the baseline label, the recommendation and Build this per card', () => {
    for (const d of SPEC.directions) {
      assert.ok(html.includes(`id="dir-${d.id}"`), d.id);
      assert.ok(html.includes(`data-id="${d.id}" data-world="${d.worldId || ''}">Build this</button>`), d.id);
    }
    assert.ok(html.includes('Category default'));
    assert.ok(html.includes('Improved by'));
    assert.ok(html.includes('Recommended'));
    assert.equal((html.match(/<iframe class="preview" sandbox=""/g) || []).length, SPEC.directions.length);
    for (const d of SPEC.directions.filter(x => x.worldId)) {
      assert.ok(html.includes(byId.get(d.worldId).inspiration.replace(/&/g, '&amp;')), d.worldId);
    }
  });

  test('no network requests except Google Fonts', () => {
    const urls = html.match(/https?:\/\/[^\s"'<>)&]+/g) || [];
    for (const u of urls) assert.match(u, /^https:\/\/fonts\.(googleapis|gstatic)\.com(\/|;|$)/, u);
    assert.doesNotMatch(html, /<script[^>]+src=/i);
  });

  test('parses: one document, balanced elements, previews fully escaped', () => {
    assert.match(html, /^<!doctype html>\n<html lang="en">/);
    for (const tag of ['html', 'head', 'body', 'main', 'dialog', 'script', 'style']) {
      const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
      const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      assert.equal(open, close, tag);
    }
    assert.equal((html.match(/<article /g) || []).length, (html.match(/<\/article>/g) || []).length);
    for (const m of html.matchAll(/srcdoc="([^"]*)"/g)) assert.ok(!m[1].includes('<'), 'unescaped < in srcdoc');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    assert.doesNotThrow(() => new Function(script));
  });

  test('escapes hostile text in titles', () => {
    const spec = structuredClone(SPEC);
    spec.directions[1].title = '<img src=x onerror=alert(1)>';
    assert.ok(!renderPicker(spec, byId).includes('<img src=x'));
  });

  test('rejects bad specs', () => {
    assert.ok(validateSpec({ directions: [SPEC.directions[0]] }, byId).length > 0);
    const bad = structuredClone(SPEC);
    bad.directions[1].worldId = 'not-a-world';
    bad.directions[2].decisions = ['only one'];
    bad.directions[3].id = 'B';
    const errs = validateSpec(bad, byId).join('\n');
    assert.match(errs, /not-a-world/);
    assert.match(errs, /exactly 3/);
    assert.match(errs, /repeated/);
  });
});

describe('serve and choice', () => {
  test('POST /choice writes choice.json with the spec world, and choice reads it', async () => {
    const dir = tempDir();
    writeFileSync(join(dir, 'index.html'), renderPicker(SPEC, byId));
    writeFileSync(join(dir, 'spec.json'), JSON.stringify(SPEC));
    const server = await startServer({ dir, port: 0 });
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      const page = await fetch(`${base}/`);
      assert.equal(page.status, 200);
      assert.match(await page.text(), /Pick a direction/);

      const res = await fetch(`${base}/choice`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'C', worldId: 'raw-html' }) });
      assert.equal(res.status, 200);
      const saved = JSON.parse(readFileSync(join(dir, 'choice.json'), 'utf8'));
      assert.equal(saved.id, 'C');
      assert.equal(saved.worldId, 'swiss-timetable', 'spec.json is authoritative over the request');
      assert.ok(!Number.isNaN(Date.parse(saved.chosenAt)));

      const r = spawnSync(process.execPath, [CLI, 'worlds', 'choice', '--json', '--dir', dir], { encoding: 'utf8' });
      assert.equal(r.status, 0);
      assert.equal(JSON.parse(r.stdout).id, 'C');
    } finally {
      await new Promise(done => server.close(done));
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('refuses bad ids, cross-site origins, wrong content type and path traversal', async () => {
    const dir = tempDir();
    writeFileSync(join(dir, 'index.html'), '<!doctype html><title>x</title>');
    const server = await startServer({ dir, port: 0 });
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      const post = (body, headers = {}) => fetch(`${base}/choice`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body });
      assert.equal((await post(JSON.stringify({ id: 'Z' }))).status, 400);
      assert.equal((await post(JSON.stringify({ id: 'A' }), { Origin: 'https://evil.example' })).status, 403);
      assert.equal((await post('id=A', { 'Content-Type': 'text/plain' })).status, 415);
      assert.equal((await fetch(`${base}/..%2f..%2fetc%2fpasswd`)).status, 403);
      assert.ok(!existsSync(join(dir, 'choice.json')));
    } finally {
      await new Promise(done => server.close(done));
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('choice exits 3 when nothing is recorded', () => {
    const dir = tempDir();
    try {
      const r = spawnSync(process.execPath, [CLI, 'worlds', 'choice', '--dir', dir], { encoding: 'utf8' });
      assert.equal(r.status, 3);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('CLI', () => {
  test('list filters by register and fights', () => {
    const r = spawnSync(process.execPath, [CLI, 'worlds', 'list', '--register', 'brand', '--fights', 'fintech', '--json'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const rows = JSON.parse(r.stdout);
    assert.ok(rows.length > 0);
    for (const w of rows) {
      assert.ok(w.registers.includes('brand'));
      assert.ok(w.fights.some(f => /fintech/i.test(f)));
    }
  });

  test('show prints a world and fails on an unknown id', () => {
    const ok = spawnSync(process.execPath, [CLI, 'worlds', 'show', 'glass-cockpit', '--json'], { encoding: 'utf8' });
    assert.equal(ok.status, 0);
    assert.equal(JSON.parse(ok.stdout).id, 'glass-cockpit');
    const css = spawnSync(process.execPath, [CLI, 'worlds', 'show', 'glass-cockpit', '--css'], { encoding: 'utf8' });
    assert.match(css.stdout, /--accent: oklch/);
    assert.equal(spawnSync(process.execPath, [CLI, 'worlds', 'show', 'nope'], { encoding: 'utf8' }).status, 1);
  });

  test('picker writes index.html and spec.json', () => {
    const dir = tempDir();
    try {
      const r = spawnSync(process.execPath, [CLI, 'worlds', 'picker', join(ROOT, 'tests/fixtures/worlds/spec.json'), '--out', join(dir, 'index.html')], { encoding: 'utf8' });
      assert.equal(r.status, 0, r.stderr);
      assert.ok(existsSync(join(dir, 'index.html')));
      assert.ok(existsSync(join(dir, 'spec.json')));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
