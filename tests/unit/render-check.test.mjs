import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { analyzeSnapshot, analyzeAll, RULES } from '../../scripts/render-check/analyze.mjs';
import { browserScript } from '../../scripts/render-check.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIX = join(HERE, '..', 'fixtures', 'render-check');
const CLI = join(HERE, '..', '..', 'bin', 'crisp.mjs');
const load = name => JSON.parse(readFileSync(join(FIX, `${name}.snapshot.json`), 'utf8'));
const ids = report => new Set(report.findings.map(f => f.id));

function cli(args) {
  try {
    return { code: 0, out: execFileSync('node', [CLI, 'render-check', ...args], { encoding: 'utf8' }) };
  } catch (err) {
    return { code: err.status, out: err.stdout };
  }
}

// Snapshots were collected from bad.html and clean.html in Chromium at 1280 and 375.

test('every rule fires on the bad page', () => {
  const report = analyzeAll(load('bad'));
  assert.equal(report.status, 'findings');
  for (const id of Object.keys(RULES)) assert.ok(ids(report).has(id), `expected ${id}`);
});

test('the clean page is clean at both widths', () => {
  const report = analyzeAll(load('clean'));
  assert.deepEqual(report.findings, []);
  assert.equal(report.status, 'clean');
  assert.equal(report.runs.length, 2);
});

test('page-overflow-x only fires at the narrow width', () => {
  const report = analyzeAll(load('bad'));
  const widths = report.findings.filter(f => f.id === 'page-overflow-x').map(f => f.width);
  assert.deepEqual(widths, [375]);
});

test('ellipsis text and screen-reader-only text are not reported as cut', () => {
  const report = analyzeAll(load('clean'));
  assert.equal(report.findings.filter(f => f.id === 'text-cut').length, 0);
});

const box = (rect, extra = {}) => ({ path: 'div.box', tag: 'div', rect, control: false, inline: false, clipX: false, clipY: false, ellipsis: false, ...extra });
const text = (rect, extra = {}) => ({ path: 'p', text: 'Hello there', rect, lines: [rect], lineCount: 1, fontSize: 16, inline: false, box: null, clip: null, control: null, ellipsis: false, ...extra });
const snap = parts => ({ viewport: { w: 1000, h: 800 }, scrollWidth: 1000, texts: [], boxes: [], controls: [], overflowers: [], ...parts });

test('tight-inset: 12px is fine, 4px is not', () => {
  const ok = analyzeSnapshot(snap({ boxes: [box({ x: 100, y: 100, w: 300, h: 100 })], texts: [text({ x: 112, y: 112, w: 100, h: 20 }, { box: 0 })] }));
  assert.equal(ok.findings.length, 0);
  const bad = analyzeSnapshot(snap({ boxes: [box({ x: 100, y: 100, w: 300, h: 100 })], texts: [text({ x: 104, y: 140, w: 100, h: 20 }, { box: 0 })] }));
  assert.equal(bad.findings[0].id, 'tight-inset');
  assert.match(bad.findings[0].message, /left edge/);
});

test('tight-inset ignores inline boxes and the sides of full-bleed bands', () => {
  const inline = analyzeSnapshot(snap({ boxes: [box({ x: 100, y: 100, w: 60, h: 20 }, { inline: true })], texts: [text({ x: 102, y: 101, w: 56, h: 18 }, { box: 0 })] }));
  assert.equal(inline.findings.length, 0);
  const band = analyzeSnapshot(snap({ boxes: [box({ x: 0, y: 0, w: 1000, h: 200 })], texts: [text({ x: 2, y: 90, w: 100, h: 20 }, { box: 0 })] }));
  assert.equal(band.findings.length, 0);
});

test('text-cut needs a partial cut: wholly outside a clip is hidden, not cut', () => {
  const clip = box({ x: 0, y: 0, w: 200, h: 50 }, { clipX: true, clipY: true });
  const partial = analyzeSnapshot(snap({ boxes: [clip], texts: [text({ x: 150, y: 10, w: 100, h: 20 }, { clip: 0 })] }));
  assert.ok(ids(partial).has('text-cut'));
  const parked = analyzeSnapshot(snap({ boxes: [clip], texts: [text({ x: 400, y: 10, w: 100, h: 20 }, { clip: 0 })] }));
  assert.ok(!ids(parked).has('text-cut'));
});

test('overlapping-text ignores a display letter whose content area only grazes the line below', () => {
  const graze = analyzeSnapshot(snap({ texts: [
    text({ x: 0, y: 0, w: 120, h: 200 }, { text: 'C' }),
    text({ x: 0, y: 175, w: 120, h: 20 }, { text: 'Contextual' }),
  ] }));
  assert.ok(!ids(graze).has('overlapping-text'));
  const stacked = analyzeSnapshot(snap({ texts: [
    text({ x: 0, y: 0, w: 100, h: 20 }, { text: 'First' }),
    text({ x: 10, y: 2, w: 100, h: 20 }, { text: 'Second' }),
  ] }));
  assert.ok(ids(stacked).has('overlapping-text'));
});

test('small-target honours the WCAG 2.5.8 spacing exception', () => {
  const ctl = (x, y) => ({ path: `button@${x}`, tag: 'button', rect: { x, y, w: 16, h: 16 }, inlineInText: false, drawsBox: false, content: null });
  const alone = analyzeSnapshot(snap({ controls: [ctl(100, 100)] }));
  assert.ok(!ids(alone).has('small-target'));
  const crowded = analyzeSnapshot(snap({ controls: [ctl(100, 100), ctl(120, 100)] }));
  assert.ok(ids(crowded).has('small-target'));
});

test('wrapped-label: stats and short control labels, not inline links in prose', () => {
  const stat = analyzeSnapshot(snap({ texts: [text({ x: 0, y: 0, w: 40, h: 40 }, { text: '42 ms', lineCount: 2 })] }));
  assert.ok(ids(stat).has('wrapped-label'));
  const prose = analyzeSnapshot(snap({
    boxes: [box({ x: 0, y: 0, w: 80, h: 40 }, { tag: 'a', control: true, inline: true })],
    texts: [text({ x: 0, y: 0, w: 80, h: 40 }, { text: '/crisp-research', lineCount: 2, control: 0, inline: true })],
  }));
  assert.ok(!ids(prose).has('wrapped-label'));
});

test('a page with no visible text is inconclusive, never clean', () => {
  const report = analyzeAll([snap({})]);
  assert.equal(report.status, 'inconclusive');
  assert.equal(analyzeAll([{ error: 'selector-not-found' }]).status, 'inconclusive');
});

test('--print-script emits one evaluable expression', () => {
  const src = browserScript('#app');
  assert.doesNotThrow(() => new Function(`return ${src}`));
  assert.match(src, /"select":"#app"/);
});

test('CLI --from: exit 2 on findings, 0 clean, 3 inconclusive', () => {
  assert.equal(cli(['--from', join(FIX, 'bad.snapshot.json')]).code, 2);
  assert.equal(cli(['--from', join(FIX, 'clean.snapshot.json')]).code, 0);
  const dir = mkdtempSync(join(tmpdir(), 'crisp-render-'));
  try {
    const empty = join(dir, 'empty.json');
    writeFileSync(empty, JSON.stringify(snap({})));
    assert.equal(cli(['--from', empty]).code, 3);
    const json = JSON.parse(cli(['--from', join(FIX, 'bad.snapshot.json'), '--json']).out);
    assert.equal(json.status, 'findings');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI with no url prints usage and exits 1', () => {
  assert.equal(cli([]).code, 1);
});
