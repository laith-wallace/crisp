#!/usr/bin/env node
/**
 * scripts/worlds.mjs
 *
 * CRISP Worlds: a curated library of visual directions (skills/crisp-worlds/worlds/*.md)
 * and the direction picker the crisp-worlds skill writes before any code.
 *
 *   crisp worlds list [--register product|brand] [--fights <text>] [--json]
 *   crisp worlds show <id> [--json|--css]
 *   crisp worlds picker <spec.json> [--out .crisp/worlds/index.html]
 *   crisp worlds serve [--port 4478] [--dir .crisp/worlds]
 *   crisp worlds choice [--json] [--dir .crisp/worlds]
 *   crisp worlds to-design-md <id> [--out DESIGN.md] [--force]
 *
 * Exit codes: 0 ok, 1 usage or validation error, 3 no choice recorded yet.
 * Zero dependencies. World front matter is read with the DESIGN.md YAML parser,
 * so a world and a DESIGN.md share one dialect.
 *
 * Exports: loadWorlds, parseWorld, validateWorld, worldContrast, worldToDesignMd,
 * validateSpec, renderPicker, startServer, runWorlds.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, dirname, resolve, sep, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDesignMd, parseColor, contrastRatio } from './design-md.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const WORLDS_DIR = join(__dirname, '..', 'skills', 'crisp-worlds', 'worlds');
const DEFAULT_DIR = join('.crisp', 'worlds');
const DEFAULT_PORT = 4478;
const REQUIRED_COLORS = ['bg', 'surface', 'ink', 'muted', 'accent'];
const REGISTERS = ['product', 'brand'];
const BODY_SECTIONS = ['Layout grammar', 'Signature moves', 'Avoid', 'In product UI'];
const WCAG_AA = 4.5;
const DIRECTION_IDS = ['A', 'B', 'C', 'D', 'E'];

// ── Worlds ──────────────────────────────────────────────────────────

/** Split a world body into its `## ` sections. */
function bodySections(body) {
  const out = {};
  let current = null;
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) { current = m[1]; out[current] = []; continue; }
    if (current) out[current].push(line);
  }
  for (const k of Object.keys(out)) out[k] = out[k].join('\n').trim();
  return out;
}

const listItems = text => (text || '').split(/\r?\n/).map(l => l.match(/^\s*(?:\d+\.|[-*])\s+(.*)$/)).filter(Boolean).map(m => m[1].trim());

/**
 * Parse one world file.
 * @returns {{ world: object|null, errors: string[] }}
 */
export function parseWorld(text, file = 'world.md') {
  const parsed = parseDesignMd(text);
  if (!parsed.hasFrontMatter) return { world: null, errors: [`${file}: no front matter`] };
  if (parsed.errors.length) return { world: null, errors: parsed.errors.map(e => `${file}:${e.line}: ${e.message}`) };
  const fm = parsed.tokens || {};
  const sections = bodySections(parsed.body);
  const world = {
    ...fm,
    file: basename(file),
    sections,
    signatureMoves: listItems(sections['Signature moves']),
    avoid: listItems(sections.Avoid),
  };
  return { world, errors: [] };
}

/** Every ink-like colour that must be readable on bg, with its measured ratio. */
export function worldContrast(world) {
  const c = world?.tokens?.colors || {};
  const p = k => parseColor(c[k]);
  const pairs = [];
  const add = (fg, bg) => {
    const f = p(fg), b = p(bg);
    if (f && b) pairs.push({ fg, bg, ratio: contrastRatio(f, b) });
  };
  for (const k of Object.keys(c)) {
    // bg/surface are grounds, line is a border, fill-* are decorative fills, on-accent is checked on accent.
    if (['bg', 'surface', 'line', 'on-accent'].includes(k) || k.startsWith('fill-')) continue;
    add(k, 'bg');
    if (k === 'ink' || k === 'muted') add(k, 'surface');
  }
  if (c['on-accent']) add('on-accent', 'accent');
  return pairs;
}

/** @returns {string[]} problems, empty when the world is valid */
export function validateWorld(world) {
  const errs = [];
  const id = world?.id || world?.file || '?';
  const need = (cond, msg) => { if (!cond) errs.push(`${id}: ${msg}`); };
  const str = v => typeof v === 'string' && v.trim().length > 0;
  need(str(world.id) && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(world.id), 'id must be lowercase-hyphenated');
  need(!world.file || world.file === `${world.id}.md`, `file name must be ${world.id}.md`);
  need(str(world.name), 'name missing');
  need(str(world.thesis), 'thesis missing');
  need(str(world.inspiration), 'inspiration missing');
  need(Array.isArray(world.registers) && world.registers.length > 0 && world.registers.every(r => REGISTERS.includes(r)), 'registers must list product and/or brand');
  need(Array.isArray(world.fights) && world.fights.length >= 1 && world.fights.every(str), 'fights must list at least one category default');
  const t = world.tokens || {};
  const c = t.colors || {};
  for (const k of REQUIRED_COLORS) need(str(c[k]) && /^oklch\(/.test(c[k]) && parseColor(c[k]), `tokens.colors.${k} must be an oklch() colour`);
  for (const [k, v] of Object.entries(c)) need(str(v) && /^oklch\(/.test(v) && parseColor(v), `tokens.colors.${k} must be an oklch() colour`);
  const ty = t.typography || {};
  for (const k of ['display', 'text']) {
    need(ty[k] && str(ty[k].family), `tokens.typography.${k}.family missing`);
    need(ty[k] && ['google', 'system'].includes(ty[k].source), `tokens.typography.${k}.source must be google or system`);
  }
  if (ty.mono) need(str(ty.mono.family) && ['google', 'system'].includes(ty.mono.source), 'tokens.typography.mono needs family and source');
  need(/^\d+(\.\d+)?px$/.test(String(ty.base || '')), 'tokens.typography.base must be px');
  need(typeof ty.scale === 'number' && ty.scale >= 1.1 && ty.scale <= 1.7, 'tokens.typography.scale must be a ratio between 1.1 and 1.7');
  need(/^\d+(\.\d+)?px$/.test(String(t.radius ?? '')), 'tokens.radius must be px');
  need(/^\d+(\.\d+)?px$/.test(String(t.spacing ?? '')), 'tokens.spacing must be px');
  need(Number.isInteger(t.density) && t.density >= 1 && t.density <= 10, 'tokens.density must be an integer 1-10');
  need(str(t.motion), 'tokens.motion missing');
  need(str(t.depth), 'tokens.depth missing');
  for (const s of BODY_SECTIONS) need(str(world.sections?.[s]), `body section "## ${s}" missing`);
  need(world.signatureMoves?.length === 3, 'Signature moves must list exactly 3 moves');
  for (const pr of worldContrast(world)) {
    need(pr.ratio >= WCAG_AA, `${pr.fg} on ${pr.bg} is ${pr.ratio.toFixed(2)}:1, below WCAG AA ${WCAG_AA}:1`);
  }
  return errs;
}

/**
 * Load every world in the library, sorted by id.
 * @returns {{ worlds: object[], errors: string[] }}
 */
export function loadWorlds(dir = WORLDS_DIR) {
  const worlds = [], errors = [];
  if (!existsSync(dir)) return { worlds, errors: [`worlds folder not found: ${dir}`] };
  for (const f of readdirSync(dir).filter(n => n.endsWith('.md')).sort()) {
    const { world, errors: e } = parseWorld(readFileSync(join(dir, f), 'utf8'), f);
    if (world) worlds.push(world);
    errors.push(...e);
  }
  return { worlds, errors };
}

function findWorld(id) {
  const { worlds } = loadWorlds();
  return worlds.find(w => w.id === id) || null;
}

// ── Type helpers ────────────────────────────────────────────────────

const px = v => parseFloat(String(v));
const familyStack = (t, fallback) => {
  if (!t) return fallback;
  if (t.source === 'system') return t.family;
  return `"${t.family}", ${fallback}`;
};
const GENERIC = { display: 'system-ui, sans-serif', text: 'system-ui, sans-serif', mono: 'ui-monospace, monospace' };

/** Google Fonts CSS2 URL for the google-sourced families of one or more worlds, or null. */
export function googleFontsUrl(worlds) {
  const fams = new Map();
  for (const w of worlds) {
    const ty = w?.tokens?.typography || {};
    for (const k of ['display', 'text', 'mono']) {
      const t = ty[k];
      if (!t || t.source !== 'google') continue;
      const weights = fams.get(t.family) || new Set();
      weights.add(Number(t.weight) || 400);
      if (k === 'text') { weights.add(400); weights.add(600); }
      fams.set(t.family, weights);
    }
  }
  if (fams.size === 0) return null;
  const q = [...fams].sort(([a], [b]) => a.localeCompare(b))
    .map(([f, ws]) => `family=${f.replace(/ /g, '+')}:wght@${[...ws].sort((a, b) => a - b).join(';')}`).join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

/** CSS custom properties for a world, for agents writing previews. */
export function worldCss(world) {
  const t = world.tokens;
  const ty = t.typography;
  const lines = [`/* CRISP world: ${world.id} (${world.name}) */`, ':root {'];
  for (const [k, v] of Object.entries(t.colors)) lines.push(`  --${k}: ${v};`);
  lines.push(`  --font-display: ${familyStack(ty.display, GENERIC.display)};`);
  lines.push(`  --font-text: ${familyStack(ty.text, GENERIC.text)};`);
  if (ty.mono) lines.push(`  --font-mono: ${familyStack(ty.mono, GENERIC.mono)};`);
  lines.push(`  --weight-display: ${ty.display.weight ?? 700};`);
  const base = px(ty.base), r = ty.scale;
  ['-1', '0', '1', '2', '3', '4', '5'].forEach(step => lines.push(`  --step-${step.replace('-', 'n')}: ${Math.round(base * r ** Number(step) * 10) / 10}px;`));
  lines.push(`  --radius: ${t.radius};`, `  --space: ${t.spacing};`, `  --density: ${t.density};`, '}');
  const url = googleFontsUrl([world]);
  return { css: lines.join('\n'), fontsUrl: url };
}

// ── DESIGN.md ───────────────────────────────────────────────────────

const q = v => JSON.stringify(String(v));
const round = v => Math.round(v);

/** Convert a world into a DESIGN.md in Google's format that passes `crisp design-md lint`. */
export function worldToDesignMd(world) {
  const t = world.tokens;
  const c = t.colors;
  const ty = t.typography;
  const base = px(ty.base), r = ty.scale;
  const size = n => `${round(base * r ** n)}px`;
  const radius = px(t.radius), space = px(t.spacing);
  const extras = Object.keys(c).filter(k => !['bg', 'surface', 'ink', 'muted', 'accent', 'on-accent', 'line'].includes(k));
  const onAccent = c['on-accent'] || (contrastRatio(parseColor(c.ink), parseColor(c.accent)) >= WCAG_AA ? c.ink : c.bg);
  const Y = [];
  Y.push('---', 'version: alpha', `name: ${q(`${world.name} direction`)}`);
  Y.push(`description: ${q(`${world.thesis} From the CRISP world ${world.id}, inspired by ${world.inspiration}.`)}`);
  Y.push('colors:');
  Y.push(`  primary: ${q(c.accent)}`, `  on-primary: ${q(onAccent)}`);
  Y.push(`  background: ${q(c.bg)}`, `  on-background: ${q(c.ink)}`);
  Y.push(`  surface: ${q(c.surface)}`, `  on-surface: ${q(c.ink)}`);
  Y.push(`  muted: ${q(c.muted)}`);
  if (c.line) Y.push(`  outline: ${q(c.line)}`);
  for (const k of extras) Y.push(`  ${k}: ${q(c[k])}`);
  Y.push('typography:');
  const level = (name, fam, n, weight, lh, ls) => {
    Y.push(`  ${name}:`, `    fontFamily: ${q(fam.family)}`, `    fontSize: ${size(n)}`, `    fontWeight: ${weight}`, `    lineHeight: ${lh}`);
    if (ls) Y.push(`    letterSpacing: ${ls}`);
  };
  const dw = Number(ty.display.weight) || 700;
  level('display', ty.display, 4, dw, 1.05, '-0.01em');
  level('headline', ty.display, 3, dw, 1.15);
  level('title', ty.text, 1, 600, 1.3);
  level('body', ty.text, 0, Number(ty.text.weight) || 400, 1.55);
  level('label', ty.mono || ty.text, -1, 500, 1.4, '0.02em');
  if (ty.mono) level('mono', ty.mono, 0, Number(ty.mono.weight) || 400, 1.5);
  Y.push('rounded:', `  sm: ${round(radius / 2)}px`, `  md: ${radius}px`, `  lg: ${radius * 2}px`);
  Y.push('spacing:', `  xs: ${space / 2}px`, `  sm: ${space}px`, `  md: ${space * 2}px`, `  lg: ${space * 3}px`, `  xl: ${space * 6}px`);
  Y.push('components:');
  const comp = (name, props) => { Y.push(`  ${name}:`); for (const [k, v] of Object.entries(props)) Y.push(`    ${k}: ${v}`); };
  comp('page', { backgroundColor: q('{colors.background}'), textColor: q('{colors.on-background}'), typography: q('{typography.body}') });
  comp('card', { backgroundColor: q('{colors.surface}'), textColor: q('{colors.on-surface}'), rounded: q('{rounded.md}'), padding: q('{spacing.md}') });
  comp('button-primary', { backgroundColor: q('{colors.primary}'), textColor: q('{colors.on-primary}'), typography: q('{typography.label}'), rounded: q('{rounded.md}'), padding: q('{spacing.sm}') });
  comp('link', { backgroundColor: q('{colors.background}'), textColor: q('{colors.primary}') });
  comp('caption', { backgroundColor: q('{colors.background}'), textColor: q('{colors.muted}'), typography: q('{typography.label}') });
  if (ty.mono) comp('data', { backgroundColor: q('{colors.surface}'), textColor: q('{colors.on-surface}'), typography: q('{typography.mono}') });
  if (c.line) comp('divider', { backgroundColor: q('{colors.outline}'), height: '1px' });
  for (const k of extras) {
    if (k.startsWith('fill-')) comp(`${k}-block`, { backgroundColor: q(`{colors.${k}}`), textColor: q('{colors.on-background}') });
    else comp(`status-${k}`, { backgroundColor: q('{colors.background}'), textColor: q(`{colors.${k}}`), typography: q('{typography.label}') });
  }
  Y.push('---');

  // fill-* blocks carry ink text, so only keep those that pass; drop failing ones to a Don't.
  let yaml = Y.join('\n');
  const dontFills = [];
  for (const k of extras.filter(x => x.startsWith('fill-'))) {
    const ratio = contrastRatio(parseColor(c.ink), parseColor(c[k]));
    if (ratio < WCAG_AA) {
      dontFills.push(`- Don't set body text on ${k} (${ratio.toFixed(2)}:1 with ink); it is a decorative fill.`);
      yaml = yaml.replace(`  ${k}-block:\n    backgroundColor: "{colors.${k}}"\n    textColor: "{colors.on-background}"`, `  ${k}-block:\n    backgroundColor: "{colors.${k}}"\n    height: 4px`);
    }
  }

  const s = world.sections || {};
  const bullets = arr => arr.map(x => `- ${x}`).join('\n');
  const colorLines = Object.entries(c).map(([k, v]) => `- **${k}** \`${v}\``).join('\n');
  const body = [
    '',
    `# ${world.name}`,
    '',
    '## Overview',
    '',
    `Direction, not a clone: built from the CRISP world \`${world.id}\`, inspired by ${world.inspiration}. ${world.thesis}`,
    '',
    `Counters these category defaults: ${world.fights.join(', ')}.`,
    '',
    '## Colors',
    '',
    `The accent is the primary action colour and the only saturated hue used for text. Every text colour clears WCAG AA (4.5:1) on the background.`,
    '',
    colorLines,
    '',
    '## Typography',
    '',
    `Display: ${ty.display.family}. Text: ${ty.text.family}.${ty.mono ? ` Mono: ${ty.mono.family}.` : ''} Base size ${ty.base} on a ${ty.scale} ratio.`,
    '',
    '## Layout',
    '',
    s['Layout grammar'] || '',
    '',
    `Spacing base ${t.spacing}. Density ${t.density} of 10.`,
    '',
    '## Elevation & Depth',
    '',
    t.depth,
    '',
    `Motion: ${t.motion}`,
    '',
    '## Shapes',
    '',
    `Corner radius ${t.radius} on controls and cards, half of that on small inline elements.`,
    '',
    '## Components',
    '',
    s['In product UI'] || '',
    '',
    "## Do's and Don'ts",
    '',
    bullets(world.signatureMoves.map(m => `Do: ${m}`)),
    bullets(world.avoid.map(m => `Don't: ${m}`)),
    ...dontFills,
    '',
  ].join('\n');
  return `${yaml}\n${body}`;
}

// ── Picker ──────────────────────────────────────────────────────────

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Validate a picker spec against the world library.
 * @returns {string[]} errors
 */
export function validateSpec(spec, worldsById) {
  const errs = [];
  if (!spec || typeof spec !== 'object') return ['spec must be a JSON object'];
  const dirs = spec.directions;
  if (!Array.isArray(dirs) || dirs.length < 2 || dirs.length > 5) return ['spec.directions must list 2 to 5 directions'];
  const seen = new Set();
  let baselines = 0;
  dirs.forEach((d, i) => {
    const at = `directions[${i}]`;
    if (!DIRECTION_IDS.includes(d.id)) errs.push(`${at}.id must be one of A-E`);
    if (seen.has(d.id)) errs.push(`${at}.id "${d.id}" is repeated`);
    seen.add(d.id);
    if (typeof d.title !== 'string' || !d.title.trim()) errs.push(`${at}.title missing`);
    if (typeof d.thesis !== 'string' || !d.thesis.trim()) errs.push(`${at}.thesis missing`);
    if (!Array.isArray(d.decisions) || d.decisions.length !== 3 || !d.decisions.every(x => typeof x === 'string' && x.trim())) errs.push(`${at}.decisions must be exactly 3 strings`);
    if (typeof d.html !== 'string' || !d.html.trim()) errs.push(`${at}.html missing (self-contained preview markup)`);
    if (d.isBaseline) {
      baselines++;
      if (d.worldId) errs.push(`${at} is the baseline, so worldId must be null`);
    } else if (!d.worldId || !worldsById.has(d.worldId)) {
      errs.push(`${at}.worldId "${d.worldId}" is not a world in the library (crisp worlds list)`);
    }
    if (d.borrowedFrom !== undefined && !Array.isArray(d.borrowedFrom)) errs.push(`${at}.borrowedFrom must be an array`);
  });
  if (baselines > 1) errs.push('at most one direction may be the baseline');
  const recs = dirs.filter(d => d.recommended === true);
  if (recs.length > 1) errs.push('at most one direction may be recommended');
  if (spec.recommended && !dirs.some(d => d.id === spec.recommended)) errs.push(`spec.recommended "${spec.recommended}" is not a direction id`);
  return errs;
}

function recommendedId(spec) {
  if (spec.recommended) return spec.recommended;
  const flagged = spec.directions.find(d => d.recommended === true);
  if (flagged) return flagged.id;
  const borrowed = spec.directions.find(d => Array.isArray(d.borrowedFrom) && d.borrowedFrom.length > 0);
  return borrowed ? borrowed.id : null;
}

function borrowedText(b) {
  if (typeof b === 'string') return b;
  if (b && typeof b === 'object') {
    const from = b.from ? `${b.from}: ` : '';
    return `${from}${b.what || ''}${b.why ? ` (${b.why})` : ''}`.trim();
  }
  return '';
}

function swatches(colors) {
  const order = ['bg', 'surface', 'ink', 'muted', 'accent'];
  const keys = [...order.filter(k => colors[k]), ...Object.keys(colors).filter(k => !order.includes(k) && k !== 'on-accent' && k !== 'line')].slice(0, 7);
  return `<ul class="swatches" aria-label="Palette">${keys.map(k => `<li><span class="chip" style="background:${esc(colors[k])}"></span><span class="chip-name">${esc(k)}</span></li>`).join('')}</ul>`;
}

function specimen(world) {
  const ty = world.tokens.typography;
  const d = familyStack(ty.display, GENERIC.display), t = familyStack(ty.text, GENERIC.text);
  const first = s => s.split(',')[0].replace(/"/g, '');
  return `<div class="specimen">
          <span class="specimen-glyph" style="font-family:${esc(d)};font-weight:${esc(ty.display.weight ?? 700)}" aria-hidden="true">Aa</span>
          <div class="specimen-meta">
            <span style="font-family:${esc(t)}">${esc(first(ty.display.family))} <span class="dim">display</span></span>
            <span style="font-family:${esc(t)}">${esc(first(ty.text.family))} <span class="dim">text</span>${ty.mono ? ` · ${esc(first(ty.mono.family))} <span class="dim">mono</span>` : ''}</span>
          </div>
        </div>`;
}

function card(d, world, recId) {
  const isRec = d.id === recId;
  const tags = [];
  if (d.isBaseline && !/category default/i.test(d.title)) tags.push('<span class="tag tag-baseline">Category default</span>');
  if (d.isBaseline && /category default/i.test(d.title)) tags.push('<span class="tag tag-baseline">Baseline</span>');
  if (isRec) tags.push('<span class="tag tag-rec">Recommended</span>');
  const colors = world ? world.tokens.colors : (d.palette && typeof d.palette === 'object' ? d.palette : null);
  const borrowed = (d.borrowedFrom || []).map(borrowedText).filter(Boolean);
  const source = world
    ? `From world <strong>${esc(world.name)}</strong> <span class="dim">(${esc(world.id)})</span>. Inspiration: ${esc(world.inspiration)}.`
    : 'No world. This is what the category usually ships, built on purpose so the cost of doing nothing is visible.';
  return `
    <article class="card${d.isBaseline ? ' is-baseline' : ''}${isRec ? ' is-rec' : ''}" id="dir-${esc(d.id)}" data-id="${esc(d.id)}" data-world="${esc(d.worldId || '')}" aria-labelledby="title-${esc(d.id)}">
      <header class="card-head">
        <span class="dir-id" aria-hidden="true">${esc(d.id)}</span>
        <h2 id="title-${esc(d.id)}"><span class="visually-hidden">Direction ${esc(d.id)}: </span>${esc(d.title)}</h2>
        <div class="tags">${tags.join('')}</div>
      </header>
      <div class="frame" title="${esc(world ? `${world.name}: ${world.inspiration}` : 'Category default')}">
        <iframe class="preview" sandbox="" referrerpolicy="no-referrer" tabindex="-1" aria-hidden="true" title="Preview of direction ${esc(d.id)}" srcdoc="${esc(d.html)}"></iframe>
        <button type="button" class="enlarge" data-id="${esc(d.id)}" aria-label="Enlarge preview of direction ${esc(d.id)}, ${esc(d.title)}"><span class="enlarge-hint">Enlarge</span></button>
      </div>
      <div class="card-body">
        <p class="thesis">${esc(d.thesis)}</p>
        ${isRec && borrowed.length ? `<div class="improved"><p class="label">Improved by</p><ul>${borrowed.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>` : ''}
        <div class="block">
          <p class="label">Key decisions</p>
          <ol class="decisions">${d.decisions.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
        </div>
        ${colors || world ? `<div class="block tokens">
          ${colors ? swatches(colors) : ''}
          ${world ? specimen(world) : ''}
        </div>` : ''}
      </div>
      <footer class="card-foot">
        <p class="source">${source}</p>
        <div class="actions">
          <button type="button" class="btn btn-ghost enlarge-text" data-id="${esc(d.id)}">Enlarge</button>
          <button type="button" class="btn btn-build" data-id="${esc(d.id)}" data-world="${esc(d.worldId || '')}">Build this</button>
        </div>
      </footer>
    </article>`;
}

const PICKER_CSS = `
:root{
  --bg:oklch(0.975 0.002 260);--surface:oklch(0.995 0.001 260);--sunken:oklch(0.955 0.003 260);
  --ink:oklch(0.22 0.006 260);--muted:oklch(0.47 0.008 260);--line:oklch(0.89 0.004 260);--line-strong:oklch(0.78 0.006 260);
  --act:oklch(0.25 0.01 260);--on-act:oklch(0.985 0.002 260);--rec:oklch(0.45 0.09 160);--rec-wash:oklch(0.96 0.025 160);
  --focus:oklch(0.55 0.15 250);--radius:12px;--gutter:clamp(16px,3vw,40px);
  --font:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  color-scheme:light dark;
}
@media (prefers-color-scheme:dark){:root{
  --bg:oklch(0.18 0.004 260);--surface:oklch(0.22 0.005 260);--sunken:oklch(0.16 0.004 260);
  --ink:oklch(0.94 0.004 260);--muted:oklch(0.74 0.008 260);--line:oklch(0.3 0.006 260);--line-strong:oklch(0.42 0.008 260);
  --act:oklch(0.93 0.004 260);--on-act:oklch(0.2 0.005 260);--rec:oklch(0.8 0.1 160);--rec-wash:oklch(0.26 0.03 160);--focus:oklch(0.75 0.13 250);
}}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 var(--font);}
.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.skip{position:absolute;left:var(--gutter);top:-40px;background:var(--act);color:var(--on-act);padding:8px 12px;border-radius:8px;z-index:10}
.skip:focus{top:12px}
:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.page{max-width:1720px;margin:0 auto;padding:clamp(24px,4vw,48px) var(--gutter) 64px}
.masthead{display:grid;gap:12px;margin-bottom:clamp(24px,3vw,40px);max-width:72ch}
.eyebrow{margin:0;font:600 12px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
h1{margin:0;font-size:clamp(24px,2.2vw + 12px,34px);line-height:1.15;font-weight:650;letter-spacing:-.01em;text-wrap:balance}
.brief{margin:0;color:var(--muted);font-size:16px;text-wrap:pretty}
.meta{margin:4px 0 0;display:flex;flex-wrap:wrap;gap:6px 16px;color:var(--muted);font-size:13px}
.meta strong{color:var(--ink);font-weight:600}
.grid{display:grid;gap:clamp(16px,2vw,24px);grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));align-items:stretch}
.card{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;min-width:0}
.card.is-baseline{border-style:dashed;border-color:var(--line-strong);background:var(--sunken)}
.card.is-rec{border-color:var(--rec);box-shadow:0 0 0 1px var(--rec)}
.card.is-chosen{box-shadow:0 0 0 2px var(--act)}
.card-head{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:center;padding:16px 16px 12px}
.dir-id{display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--line-strong);border-radius:8px;font:600 13px/1 var(--mono)}
.card h2{margin:0;font-size:16px;font-weight:600;line-height:1.3;min-width:0}
.tags{grid-column:2;display:flex;flex-wrap:wrap;gap:6px}
.tags:empty{display:none}
.tag{font-size:12px;line-height:1;padding:5px 8px;border-radius:999px;border:1px solid var(--line-strong);color:var(--muted);white-space:nowrap}
.tag-rec{border-color:var(--rec);color:var(--rec);font-weight:600}
.frame{position:relative;aspect-ratio:16/10;overflow:hidden;border-block:1px solid var(--line);background:var(--sunken)}
.preview{position:absolute;top:0;left:0;width:1280px;height:800px;border:0;transform-origin:0 0;transform:scale(var(--s,.28));pointer-events:none;background:#fff}
.enlarge{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;cursor:zoom-in;display:flex;align-items:flex-end;justify-content:flex-end;padding:10px}
.enlarge-hint{font-size:12px;padding:5px 8px;border-radius:6px;background:var(--surface);color:var(--ink);border:1px solid var(--line);opacity:0;transition:opacity .15s ease}
.enlarge:hover .enlarge-hint,.enlarge:focus-visible .enlarge-hint{opacity:1}
.enlarge:focus-visible{outline-offset:-3px}
.card-body{display:grid;gap:16px;padding:16px}
.thesis{margin:0;font-size:15px;line-height:1.5;text-wrap:pretty}
.label{margin:0 0 6px;font:600 11px/1.2 var(--mono);letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
.decisions{margin:0;padding-left:20px;display:grid;gap:4px;font-size:14px}
.decisions li::marker{color:var(--muted);font:500 12px var(--mono)}
.improved{padding:12px;border-radius:8px;background:var(--rec-wash)}
.improved .label{color:var(--rec)}
.improved ul{margin:0;padding-left:18px;font-size:14px;display:grid;gap:4px}
.tokens{display:grid;gap:12px;padding-top:12px;border-top:1px solid var(--line)}
.swatches{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:10px}
.swatches li{display:grid;justify-items:center;gap:4px;width:48px}
.chip{width:32px;height:32px;border-radius:8px;border:1px solid var(--line-strong)}
.chip-name{font:11px/1.2 var(--mono);color:var(--muted);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.specimen{display:flex;align-items:center;gap:14px;min-width:0}
.specimen-glyph{font-size:40px;line-height:1;flex:none}
.specimen-meta{display:grid;gap:2px;font-size:13px;min-width:0}
.dim{color:var(--muted)}
.card-foot{margin-top:auto;display:grid;gap:12px;padding:12px 16px 16px;border-top:1px solid var(--line)}
.source{margin:0;font-size:12.5px;line-height:1.45;color:var(--muted)}
.source strong{color:var(--ink);font-weight:600}
.actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.btn{font:600 14px/1 var(--font);min-height:40px;padding:0 16px;border-radius:8px;cursor:pointer;border:1px solid transparent;transition:background-color .15s ease,color .15s ease}
.btn-ghost{background:transparent;border-color:var(--line-strong);color:var(--ink)}
.btn-ghost:hover{background:var(--sunken)}
.btn-build{background:var(--act);color:var(--on-act)}
.btn-build:hover{opacity:.9}
.btn-build[aria-pressed="true"]{background:var(--rec);color:var(--on-act)}
.status{position:sticky;bottom:16px;margin:24px auto 0;max-width:640px;padding:12px 16px;border-radius:10px;background:var(--act);color:var(--on-act);font-size:14px;display:none;box-shadow:0 8px 24px oklch(0 0 0 / .18)}
.status.show{display:block}
.status code{font:600 14px var(--mono);padding:2px 6px;border-radius:4px;background:color-mix(in oklch,var(--on-act) 14%,transparent)}
.howto{margin-top:40px;color:var(--muted);font-size:13px;max-width:72ch}
.howto code{font:12.5px var(--mono);color:var(--ink)}
dialog{width:min(1280px,calc(100vw - 32px));height:min(880px,calc(100vh - 32px));max-width:none;max-height:none;padding:0;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);color:var(--ink)}
dialog::backdrop{background:oklch(0.15 0.01 260 / .6)}
.dlg{display:grid;grid-template-rows:auto 1fr;height:100%}
.dlg-head{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid var(--line)}
.dlg-head h2{margin:0;font-size:16px;font-weight:600}
.dlg-tools{display:flex;gap:8px;flex-wrap:wrap}
.seg{display:inline-flex;border:1px solid var(--line-strong);border-radius:8px;overflow:hidden}
.seg button{font:500 13px var(--font);min-height:36px;padding:0 12px;border:0;background:transparent;color:var(--ink);cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--act);color:var(--on-act)}
.dlg-stage{display:flex;justify-content:center;background:var(--sunken);overflow:auto}
.dlg-stage iframe{width:100%;height:100%;border:0;background:#fff;transition:width .2s ease}
.dlg-stage.narrow iframe{width:390px;border-inline:1px solid var(--line)}
@media (max-width:520px){.actions .btn{flex:1}.dlg-tools{width:100%}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

const PICKER_JS = `
(function(){
  var frames=[].slice.call(document.querySelectorAll('.frame'));
  function fit(f){var w=f.clientWidth;var i=f.querySelector('iframe');if(w&&i)i.style.setProperty('--s',(w/1280).toFixed(4));}
  if('ResizeObserver' in window){var ro=new ResizeObserver(function(es){es.forEach(function(e){fit(e.target);});});frames.forEach(function(f){ro.observe(f);});}
  else{frames.forEach(fit);window.addEventListener('resize',function(){frames.forEach(fit);});}

  var dlg=document.getElementById('enlarged'),dlgFrame=dlg.querySelector('iframe'),dlgTitle=dlg.querySelector('h2'),dlgBuild=dlg.querySelector('.btn-build'),stage=dlg.querySelector('.dlg-stage'),opener=null;
  function card(id){return document.getElementById('dir-'+id);}
  function open(id,from){
    var c=card(id);if(!c)return;opener=from||null;
    dlgTitle.textContent='Direction '+id+': '+c.querySelector('h2').textContent.replace(/^Direction [A-E]: /,'');
    dlgFrame.setAttribute('srcdoc',c.querySelector('iframe.preview').getAttribute('srcdoc'));
    dlgFrame.title='Full preview of direction '+id;
    dlgBuild.dataset.id=id;dlgBuild.dataset.world=c.dataset.world||'';
    if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
  }
  dlg.addEventListener('close',function(){dlgFrame.removeAttribute('srcdoc');if(opener)opener.focus();});
  dlg.querySelector('.dlg-close').addEventListener('click',function(){dlg.close();});
  dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close();});
  [].forEach.call(dlg.querySelectorAll('.seg button'),function(b){b.addEventListener('click',function(){
    [].forEach.call(dlg.querySelectorAll('.seg button'),function(x){x.setAttribute('aria-pressed',String(x===b));});
    stage.classList.toggle('narrow',b.dataset.width==='narrow');
  });});
  [].forEach.call(document.querySelectorAll('.enlarge,.enlarge-text'),function(b){b.addEventListener('click',function(){open(b.dataset.id,b);});});
  document.addEventListener('keydown',function(e){
    if(!dlg.open||(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'))return;
    var ids=[].map.call(document.querySelectorAll('.card'),function(c){return c.dataset.id;});
    var i=ids.indexOf(dlgBuild.dataset.id);var n=ids[(i+(e.key==='ArrowRight'?1:ids.length-1))%ids.length];
    open(n,opener);
  });

  var status=document.getElementById('status');
  function say(html){status.innerHTML=html;status.classList.add('show');}
  function mark(id){
    [].forEach.call(document.querySelectorAll('.card'),function(c){c.classList.toggle('is-chosen',c.dataset.id===id);});
    [].forEach.call(document.querySelectorAll('.card .btn-build'),function(b){var on=b.dataset.id===id;b.setAttribute('aria-pressed',String(on));b.textContent=on?'Chosen':'Build this';});
  }
  function copy(text){
    if(navigator.clipboard&&window.isSecureContext){return navigator.clipboard.writeText(text);}
    return new Promise(function(res,rej){var t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();var ok=false;try{ok=document.execCommand('copy');}catch(_){}document.body.removeChild(t);ok?res():rej();});
  }
  function offline(id){
    var cmd='build '+id;
    copy(cmd).then(function(){say('Copied <code>'+cmd+'</code>. Paste this into your agent.');},function(){say('Paste this into your agent: <code>'+cmd+'</code>');});
  }
  function build(id,world){
    mark(id);
    if(dlg.open)dlg.close();
    if(location.protocol==='http:'||location.protocol==='https:'){
      fetch('choice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id,worldId:world||null})})
        .then(function(r){if(!r.ok)throw new Error(r.status);return r.json();})
        .then(function(){say('Recorded direction <code>'+id+'</code>. Your agent can build it now; you can close this tab.');})
        .catch(function(){offline(id);});
    } else offline(id);
  }
  [].forEach.call(document.querySelectorAll('.btn-build'),function(b){b.addEventListener('click',function(){build(b.dataset.id,b.dataset.world);});});
})();
`;

/**
 * Render the picker page. Pure: no file IO.
 * @param {object} spec
 * @param {Map<string, object>} worldsById
 */
export function renderPicker(spec, worldsById) {
  const recId = recommendedId(spec);
  const used = spec.directions.map(d => (d.worldId ? worldsById.get(d.worldId) : null)).filter(Boolean);
  const fonts = googleFontsUrl(used);
  const baseline = spec.directions.find(d => d.isBaseline);
  const subject = spec.surface || spec.project || 'this surface';
  const title = `Pick a direction for ${subject}`;
  const csp = [
    "default-src 'none'",
    "style-src 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com',
    "script-src 'unsafe-inline'",
    'img-src data:',
    "connect-src 'self'",
    "frame-src 'self' about: data:",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
  const metaBits = [
    `<span><strong>${spec.directions.length}</strong> directions</span>`,
    baseline ? `<span>Baseline <strong>${esc(baseline.id)}</strong></span>` : '',
    recId ? `<span>Recommended <strong>${esc(recId)}</strong></span>` : '',
    spec.register ? `<span>Register <strong>${esc(spec.register)}</strong></span>` : '',
  ].filter(Boolean).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${esc(csp)}">
<meta name="generator" content="crisp worlds picker">
<title>${esc(spec.project ? `Directions: ${spec.project}` : 'CRISP Worlds')}</title>
${fonts ? `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="${esc(fonts)}">` : ''}
<style>${PICKER_CSS}</style>
</head>
<body>
<a class="skip" href="#directions">Skip to directions</a>
<main class="page">
  <header class="masthead">
    <p class="eyebrow">CRISP Worlds${spec.project ? ` · ${esc(spec.project)}` : ''}</p>
    <h1>${esc(title)}</h1>
    ${spec.brief ? `<p class="brief">${esc(spec.brief)}</p>` : ''}
    <p class="meta">${metaBits}</p>
  </header>
  <section id="directions" class="grid" aria-label="Directions">
${spec.directions.map(d => card(d, d.worldId ? worldsById.get(d.worldId) : null, recId)).join('\n')}
  </section>
  <div id="status" class="status" role="status" aria-live="polite"></div>
  <p class="howto">Click a preview to enlarge it; left and right arrow keys move between directions while enlarged. <strong>Build this</strong> records your choice when the page is served by <code>crisp worlds serve</code>, or copies <code>build &lt;id&gt;</code> for you to paste into your agent when opened as a file.</p>
</main>
<dialog id="enlarged" aria-labelledby="enlarged-title">
  <div class="dlg">
    <div class="dlg-head">
      <h2 id="enlarged-title">Direction</h2>
      <div class="dlg-tools">
        <div class="seg" role="group" aria-label="Preview width">
          <button type="button" data-width="wide" aria-pressed="true">Desktop</button>
          <button type="button" data-width="narrow" aria-pressed="false">Phone</button>
        </div>
        <button type="button" class="btn btn-build" data-id="" data-world="">Build this</button>
        <button type="button" class="btn btn-ghost dlg-close">Close</button>
      </div>
    </div>
    <div class="dlg-stage"><iframe sandbox="" referrerpolicy="no-referrer" title="Full preview"></iframe></div>
  </div>
</dialog>
<script>${PICKER_JS}</script>
</body>
</html>
`;
}

// ── Server ──────────────────────────────────────────────────────────

const MIME = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

/**
 * Serve a worlds folder on loopback only and accept POST /choice.
 * @returns {Promise<import('node:http').Server>}
 */
export function startServer({ dir = DEFAULT_DIR, port = DEFAULT_PORT, host = '127.0.0.1' } = {}) {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    const send = (code, body, type = 'text/plain; charset=utf-8') => {
      res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(body);
    };
    const actualPort = server.address().port;
    const okHosts = new Set([`127.0.0.1:${actualPort}`, `localhost:${actualPort}`]);
    // Refuse other hostnames, because DNS rebinding could otherwise reach the loopback server.
    if (!okHosts.has(String(req.headers.host || ''))) return send(403, 'Forbidden host');
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/choice' && req.method === 'POST') {
      const origin = req.headers.origin;
      // A cross-site page must not record a choice for the user.
      if (origin && origin !== 'null' && !okHosts.has(origin.replace(/^https?:\/\//, ''))) return send(403, 'Forbidden origin');
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) return send(415, 'Expected application/json');
      let raw = '';
      req.setEncoding('utf8');
      req.on('data', chunk => { raw += chunk; if (raw.length > 4096) req.destroy(); });
      req.on('end', () => {
        let body;
        try { body = JSON.parse(raw); } catch { return send(400, 'Invalid JSON'); }
        if (!body || !DIRECTION_IDS.includes(body.id)) return send(400, 'id must be A-E');
        let worldId = typeof body.worldId === 'string' && body.worldId ? body.worldId : null;
        const specFile = join(root, 'spec.json');
        if (existsSync(specFile)) {
          try {
            const spec = JSON.parse(readFileSync(specFile, 'utf8'));
            const d = (spec.directions || []).find(x => x.id === body.id);
            if (!d) return send(400, `No direction ${body.id} in spec.json`);
            worldId = d.worldId || null; // the spec is authoritative, not the request
          } catch { /* unreadable spec: fall back to the request */ }
        }
        if (worldId !== null && !/^[a-z0-9-]{1,64}$/.test(worldId)) return send(400, 'Invalid worldId');
        const choice = { id: body.id, worldId, chosenAt: new Date().toISOString() };
        try {
          mkdirSync(root, { recursive: true });
          writeFileSync(join(root, 'choice.json'), JSON.stringify(choice, null, 2) + '\n');
        } catch (e) { return send(500, `Could not write choice.json: ${e.message}`); }
        send(200, JSON.stringify({ ok: true, choice }), 'application/json; charset=utf-8');
      });
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'Method not allowed');
    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch { return send(400, 'Bad path'); }
    if (rel.endsWith('/')) rel += 'index.html';
    const file = resolve(root, '.' + rel);
    if (file !== root && !file.startsWith(root + sep)) return send(403, 'Forbidden');
    if (!existsSync(file) || !statSync(file).isFile()) return send(404, 'Not found');
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    res.end(readFileSync(file));
  });
  return new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(port, host, () => { server.off('error', fail); ok(server); });
  });
}

// ── CLI ─────────────────────────────────────────────────────────────

const USAGE = `Usage:
  crisp worlds list [--register product|brand] [--fights <text>] [--json]
  crisp worlds show <id> [--json|--css]
  crisp worlds picker <spec.json> [--out .crisp/worlds/index.html]
  crisp worlds serve [--port 4478] [--dir .crisp/worlds]
  crisp worlds choice [--json] [--dir .crisp/worlds]
  crisp worlds to-design-md <id> [--out DESIGN.md] [--force]`;

function parseArgs(argv) {
  const flags = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (['json', 'css', 'force'].includes(k)) flags[k] = true;
      else if (next !== undefined && !next.startsWith('--')) { flags[k] = next; i++; }
      else flags[k] = true;
    } else pos.push(a);
  }
  return { flags, pos };
}

const summary = w => ({ id: w.id, name: w.name, thesis: w.thesis, inspiration: w.inspiration, registers: w.registers, fights: w.fights, density: w.tokens.density });

/**
 * @param {string[]} argv - arguments after `worlds`
 * @returns {number|Promise<number>} exit code
 */
export function runWorlds(argv) {
  const [cmd, ...rest] = argv;
  const { flags, pos } = parseArgs(rest);

  if (cmd === 'list') {
    const { worlds, errors } = loadWorlds();
    if (errors.length) { console.error(errors.join('\n')); return 1; }
    let out = worlds;
    if (flags.register) {
      if (!REGISTERS.includes(flags.register)) { console.error(`--register must be product or brand`); return 1; }
      out = out.filter(w => w.registers.includes(flags.register));
    }
    if (typeof flags.fights === 'string') {
      const needle = flags.fights.toLowerCase();
      out = out.filter(w => w.fights.some(f => f.toLowerCase().includes(needle)));
    }
    if (flags.json) { console.log(JSON.stringify(out.map(summary), null, 2)); return 0; }
    if (out.length === 0) { console.log('crisp worlds: no worlds match.'); return 0; }
    const width = Math.max(...out.map(w => w.id.length));
    for (const w of out) console.log(`${w.id.padEnd(width)}  ${w.registers.join('+').padEnd(13)}  ${w.thesis}`);
    console.log(`\n${out.length} world(s). crisp worlds show <id> for tokens and layout grammar.`);
    return 0;
  }

  if (cmd === 'show') {
    const id = pos[0];
    if (!id) { console.error(USAGE); return 1; }
    const w = findWorld(id);
    if (!w) { console.error(`crisp worlds: no world "${id}". Run crisp worlds list.`); return 1; }
    if (flags.json) { console.log(JSON.stringify(w, null, 2)); return 0; }
    if (flags.css) {
      const { css, fontsUrl } = worldCss(w);
      if (fontsUrl) console.log(`/* <link rel="stylesheet" href="${fontsUrl}"> */`);
      console.log(css);
      return 0;
    }
    const t = w.tokens, ty = t.typography;
    console.log(`${w.name} (${w.id})  [${w.registers.join(', ')}]`);
    console.log(`Thesis:      ${w.thesis}`);
    console.log(`Inspiration: ${w.inspiration}`);
    console.log(`Fights:      ${w.fights.join('; ')}`);
    console.log(`Colours:     ${Object.entries(t.colors).map(([k, v]) => `${k} ${v}`).join(', ')}`);
    console.log(`Type:        display ${ty.display.family} ${ty.display.weight ?? ''}, text ${ty.text.family}${ty.mono ? `, mono ${ty.mono.family}` : ''}; base ${ty.base}, ratio ${ty.scale}`);
    console.log(`Shape:       radius ${t.radius}, spacing ${t.spacing}, density ${t.density}/10`);
    console.log(`Motion:      ${t.motion}`);
    console.log(`Depth:       ${t.depth}`);
    for (const s of BODY_SECTIONS) console.log(`\n${s}\n${w.sections[s]}`);
    return 0;
  }

  if (cmd === 'picker') {
    const specPath = pos[0];
    if (!specPath) { console.error(USAGE); return 1; }
    let spec;
    try { spec = JSON.parse(readFileSync(specPath, 'utf8')); } catch (e) {
      console.error(`crisp worlds: cannot read ${specPath} (${e.code || e.message}).`);
      return 1;
    }
    const { worlds } = loadWorlds();
    const byId = new Map(worlds.map(w => [w.id, w]));
    const errs = validateSpec(spec, byId);
    if (errs.length) { console.error(`crisp worlds: spec is invalid:\n${errs.map(e => `  - ${e}`).join('\n')}`); return 1; }
    const out = typeof flags.out === 'string' ? flags.out : join(DEFAULT_DIR, 'index.html');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, renderPicker(spec, byId));
    writeFileSync(join(dirname(out), 'spec.json'), JSON.stringify(spec, null, 2) + '\n');
    console.log(`crisp worlds: wrote ${out} (${spec.directions.length} directions) and ${join(dirname(out), 'spec.json')}.`);
    console.log(`Open it as a file, or run: crisp worlds serve --dir ${dirname(out)}`);
    return 0;
  }

  if (cmd === 'serve') {
    const port = flags.port === undefined ? DEFAULT_PORT : Number(flags.port);
    if (!Number.isInteger(port) || port < 0 || port > 65535) { console.error('--port must be 0-65535'); return 1; }
    const dir = typeof flags.dir === 'string' ? flags.dir : DEFAULT_DIR;
    if (!existsSync(join(dir, 'index.html'))) { console.error(`crisp worlds: no ${join(dir, 'index.html')}. Run crisp worlds picker <spec.json> first.`); return 1; }
    return startServer({ dir, port }).then(server => {
      const p = server.address().port;
      console.log(`crisp worlds: serving ${dir} at http://127.0.0.1:${p}/ (loopback only). Ctrl+C to stop.`);
      console.log('Build this writes choice.json; read it with: crisp worlds choice');
      return new Promise(done => {
        const stop = () => server.close(() => done(0));
        process.once('SIGINT', stop);
        process.once('SIGTERM', stop);
      });
    }, err => {
      console.error(`crisp worlds: cannot listen on 127.0.0.1:${port} (${err.code || err.message}).`);
      return 1;
    });
  }

  if (cmd === 'choice') {
    const dir = typeof flags.dir === 'string' ? flags.dir : DEFAULT_DIR;
    const file = join(dir, 'choice.json');
    if (!existsSync(file)) {
      if (flags.json) console.log(JSON.stringify({ choice: null }));
      else console.log('crisp worlds: no choice recorded yet.');
      return 3;
    }
    let choice;
    try { choice = JSON.parse(readFileSync(file, 'utf8')); } catch (e) {
      console.error(`crisp worlds: ${file} is not valid JSON (${e.message}).`);
      return 1;
    }
    if (flags.json) console.log(JSON.stringify(choice, null, 2));
    else console.log(`Chosen: ${choice.id}${choice.worldId ? ` (world ${choice.worldId})` : ' (category default)'} at ${choice.chosenAt}`);
    return 0;
  }

  if (cmd === 'to-design-md') {
    const id = pos[0];
    if (!id) { console.error(USAGE); return 1; }
    const w = findWorld(id);
    if (!w) { console.error(`crisp worlds: no world "${id}". Run crisp worlds list.`); return 1; }
    const text = worldToDesignMd(w);
    const out = typeof flags.out === 'string' ? flags.out : 'DESIGN.md';
    if (out === '-') { process.stdout.write(text); return 0; }
    if (existsSync(out) && !flags.force) {
      console.error(`crisp worlds: ${out} exists. Pass --force to overwrite, or --out DESIGN.worlds.md.`);
      return 1;
    }
    writeFileSync(out, text);
    console.log(`crisp worlds: wrote ${out} from world ${id}. Check it with: crisp design-md lint ${out}`);
    return 0;
  }

  console.error(USAGE);
  return 1;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  Promise.resolve(runWorlds(process.argv.slice(2))).then(code => process.exit(code));
}
