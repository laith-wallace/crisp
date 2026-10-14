#!/usr/bin/env node
/**
 * scripts/gallery.mjs
 *
 * Builds a self-contained, same-prompt gallery: for each prompt, the page an
 * agent built without CRISP next to the one it built with CRISP, each in a
 * sandboxed iframe, with the review grade and the detector hit count on each
 * side. Roadmap Phase 4, "Public gallery".
 *
 * Two input shapes:
 *
 *   Pairs folder (hand-made or exported):
 *     <dir>/<case>/without.html     required on at least one side
 *     <dir>/<case>/with.html
 *     <dir>/<case>/prompt.md        optional (or prompt.txt)
 *     <dir>/<case>/grade.json       optional: { "prompt"?: "...",
 *                                     "without": "D" | { "grade": "D", "note"?: "..." },
 *                                     "with":    "B" | { "grade": "B", "note"?: "..." } }
 *
 *   Eval results folder (claude plugin eval, evals/results/<timestamp>/):
 *     read through scripts/eval-results.mjs. The first HTML output per case
 *     and arm is used (baseline = without, plugin = with). Grades come from
 *     an optional <dir>/grades.json shaped { "<case>": { "without": ..., "with": ... } }.
 *
 * Usage:
 *   node scripts/gallery.mjs <dir> [--out gallery] [--title "..."]
 *
 * Writes <out>/index.html. Iframes use srcdoc with an empty sandbox, so the
 * pages render but cannot run scripts, submit forms or navigate the gallery.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { scanText } from './detector/engine.mjs';
import { readResults } from './eval-results.mjs';

const SIDES = [
  { key: 'without', label: 'Without CRISP' },
  { key: 'with', label: 'With CRISP' },
];

const readIf = p => (existsSync(p) ? readFileSync(p, 'utf8') : null);

function normaliseGrade(g) {
  if (g == null) return null;
  if (typeof g === 'string' || typeof g === 'number') return { grade: String(g) };
  if (typeof g === 'object' && g.grade != null) return { grade: String(g.grade), note: g.note ? String(g.note) : undefined };
  return null;
}

function detectorSummary(html) {
  const findings = scanText(html, 'page.html') || [];
  const byRule = {};
  for (const f of findings) byRule[f.id] = (byRule[f.id] || 0) + 1;
  return {
    hits: findings.length,
    rules: Object.entries(byRule).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  };
}

function isPairsDir(dir) {
  return readdirSync(dir).some(entry => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() && (existsSync(join(full, 'without.html')) || existsSync(join(full, 'with.html')));
  });
}

function loadPairs(dir) {
  const cases = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    const without = readIf(join(full, 'without.html'));
    const withHtml = readIf(join(full, 'with.html'));
    if (!without && !withHtml) continue;
    let grade = {};
    const gradeText = readIf(join(full, 'grade.json'));
    if (gradeText) {
      try { grade = JSON.parse(gradeText); } catch { throw new Error(`${join(full, 'grade.json')} is not valid JSON`); }
    }
    const prompt = (readIf(join(full, 'prompt.md')) ?? readIf(join(full, 'prompt.txt')) ?? grade.prompt ?? '').trim();
    cases.push({
      id: entry,
      prompt,
      sides: { without: without && { html: without, grade: normaliseGrade(grade.without) }, with: withHtml && { html: withHtml, grade: normaliseGrade(grade.with) } },
    });
  }
  return cases;
}

function loadResults(dir) {
  const { outputs, prompts } = readResults(dir);
  let grades = {};
  const gradesText = readIf(join(dir, 'grades.json'));
  if (gradesText) {
    try { grades = JSON.parse(gradesText); } catch { throw new Error(`${join(dir, 'grades.json')} is not valid JSON`); }
  }
  const byCase = new Map();
  for (const o of outputs) {
    if (o.ext !== '.html' || (o.arm !== 'baseline' && o.arm !== 'plugin')) continue;
    const side = o.arm === 'baseline' ? 'without' : 'with';
    const c = byCase.get(o.case) ?? { id: o.case, prompt: prompts.get(o.case) || '', sides: {} };
    c.sides[side] ??= { html: o.code, grade: normaliseGrade(grades[o.case]?.[side]), model: o.model };
    byCase.set(o.case, c);
  }
  return [...byCase.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function loadCases(dir) {
  const cases = isPairsDir(dir) ? loadPairs(dir) : loadResults(dir);
  for (const c of cases) {
    for (const side of SIDES) {
      const s = c.sides[side.key];
      if (s) Object.assign(s, detectorSummary(s.html));
    }
  }
  return cases;
}

const escHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const humanise = id => id.replace(/[-_]+/g, ' ').replace(/^\w/, ch => ch.toUpperCase());

function sideHtml(c, side) {
  const s = c.sides[side.key];
  const head = `<figcaption class="side-head"><span class="side-label">${side.label}</span>`;
  if (!s) {
    return `<figure class="side side-empty">${head}</figcaption><p class="empty">No output for this side.</p></figure>`;
  }
  const grade = s.grade ? `<span class="stat"><span class="stat-k">Grade</span> <strong>${escHtml(s.grade.grade)}</strong></span>` : '<span class="stat stat-muted">Not graded</span>';
  const hits = `<span class="stat"><span class="stat-k">Detector</span> <strong>${s.hits}</strong> ${s.hits === 1 ? 'hit' : 'hits'}</span>`;
  const note = s.grade?.note ? `<p class="note">${escHtml(s.grade.note)}</p>` : '';
  const rules = s.rules.length
    ? `<details class="rules"><summary>Detector findings by rule</summary><ul>${s.rules.map(([id, n]) => `<li><code>${escHtml(id)}</code><span>${n}</span></li>`).join('')}</ul></details>`
    : '<p class="rules-clean">No detector findings.</p>';
  return `<figure class="side">${head}<span class="stats">${grade}${hits}</span></figcaption>
        <div class="frame"><iframe sandbox="" referrerpolicy="no-referrer" loading="lazy" title="${escHtml(`${humanise(c.id)}, ${side.label.toLowerCase()}`)}" srcdoc="${escHtml(s.html)}"></iframe></div>
        ${note}${rules}
      </figure>`;
}

function total(cases, key) {
  return cases.reduce((n, c) => n + (c.sides[key]?.hits ?? 0), 0);
}

export function renderGallery(cases, { title = 'CRISP, with and without' } = {}) {
  const paired = cases.filter(c => c.sides.without && c.sides.with);
  const summary = paired.length
    ? `Across ${paired.length} ${paired.length === 1 ? 'prompt' : 'prompts'} with both sides, the detector found ${total(paired, 'without')} ${total(paired, 'without') === 1 ? 'issue' : 'issues'} without CRISP and ${total(paired, 'with')} with it.`
    : 'No prompt has both sides yet.';

  const articles = cases.map(c => `
    <article class="case" id="${escHtml(c.id)}">
      <h2>${escHtml(humanise(c.id))}</h2>
      ${c.prompt ? `<blockquote class="prompt"><p>${escHtml(c.prompt).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>')}</p></blockquote>` : ''}
      <div class="pair">
        ${SIDES.map(side => sideHtml(c, side)).join('\n        ')}
      </div>
    </article>`).join('\n');

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escHtml(title)}</title>
<style>
:root {
  --bg: #f3f4f1;
  --surface: #fbfbf9;
  --text: #1d211f;
  --muted: #59605c;
  --border: #d5d9d4;
  --accent: #1f6b5c;
  --frame-bg: #ffffff;
  --radius: 10px;
  --body: system-ui, -apple-system, "Segoe UI", sans-serif;
  --display: "Iowan Old Style", Charter, "Bitstream Charter", Cambria, Georgia, serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #161917;
    --surface: #1e2220;
    --text: #e6e9e6;
    --muted: #a3aba6;
    --border: #353b37;
    --accent: #7cc4b2;
    --frame-bg: #ffffff;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 16px/1.55 var(--body);
}
a { color: var(--accent); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.wrap { max-width: 1240px; margin: 0 auto; padding: 40px 16px 64px; }
header.top { max-width: 44rem; margin-bottom: 40px; }
h1, h2 { font-family: var(--display); font-weight: 600; line-height: 1.2; margin: 0; }
h1 { font-size: clamp(1.75rem, 1.3rem + 2vw, 2.5rem); }
h2 { font-size: 1.375rem; }
.lede { color: var(--muted); margin: 12px 0 0; }
.summary { margin: 16px 0 0; }
nav.toc { margin-top: 20px; font-size: 0.9375rem; }
nav.toc ul { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 4px 20px; }
.case { padding-top: 32px; margin-top: 32px; border-top: 1px solid var(--border); }
.prompt { margin: 12px 0 20px; padding: 0 0 0 14px; border-left: 1px solid var(--border); color: var(--muted); max-width: 44rem; }
.prompt p { margin: 0 0 8px; }
.pair { display: grid; grid-template-columns: 1fr; gap: 24px; }
@media (min-width: 900px) { .pair { grid-template-columns: 1fr 1fr; } }
.side { margin: 0; min-width: 0; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; }
.side-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 6px 16px; margin-bottom: 12px; }
.side-label { font-weight: 600; }
.stats { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 0.9375rem; }
.stat-k, .stat-muted { color: var(--muted); }
.stat strong { font-variant-numeric: tabular-nums; }
.frame { border: 1px solid var(--border); border-radius: 6px; overflow: hidden; background: var(--frame-bg); }
.frame iframe { display: block; width: 100%; height: 420px; border: 0; background: var(--frame-bg); }
@media (min-width: 900px) { .frame iframe { height: 560px; } }
.note { margin: 12px 0 0; font-size: 0.9375rem; }
.rules { margin-top: 12px; font-size: 0.9375rem; }
.rules summary { cursor: pointer; color: var(--muted); }
.rules ul { list-style: none; margin: 8px 0 0; padding: 0; }
.rules li { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--border); }
.rules li:last-child { border-bottom: 0; }
.rules code { overflow-wrap: anywhere; }
.rules-clean, .empty { margin: 12px 0 0; color: var(--muted); font-size: 0.9375rem; }
footer.bottom { margin-top: 48px; color: var(--muted); font-size: 0.875rem; max-width: 44rem; }
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <h1>${escHtml(title)}</h1>
    <p class="lede">Each prompt was given to the same agent twice: once on its own, once with the CRISP skills installed. The pages are shown as built, in sandboxed frames with scripts off.</p>
    <p class="summary">${summary}</p>
    ${cases.length > 1 ? `<nav class="toc" aria-label="Prompts"><ul>${cases.map(c => `<li><a href="#${escHtml(c.id)}">${escHtml(humanise(c.id))}</a></li>`).join('')}</ul></nav>` : ''}
  </header>
  <main>
${articles}
  </main>
  <footer class="bottom">
    <p>Grades come from /crisp-review. Detector counts come from the deterministic CRISP detector run on each page's source, so they measure known tells, not overall quality.</p>
  </footer>
</div>
</body>
</html>
`;
}

function main(argv) {
  let out = 'gallery';
  let title;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') out = argv[++i];
    else if (argv[i] === '--title') title = argv[++i];
    else rest.push(argv[i]);
  }
  const dir = rest[0];
  if (rest.length !== 1 || !existsSync(dir) || !statSync(dir).isDirectory()) {
    console.error('Usage: node scripts/gallery.mjs <pairs-or-results-dir> [--out gallery] [--title "..."]');
    return 1;
  }
  const cases = loadCases(dir);
  if (cases.length === 0) {
    console.error(`gallery: no pairs found in ${dir}. Expected <case>/without.html and <case>/with.html, or eval results with HTML outputs.`);
    return 1;
  }
  mkdirSync(out, { recursive: true });
  const file = join(out, 'index.html');
  writeFileSync(file, renderGallery(cases, { title }));
  console.log(`gallery: ${cases.length} prompt(s) written to ${resolve(file)}`);
  return 0;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) process.exitCode = main(process.argv.slice(2));
