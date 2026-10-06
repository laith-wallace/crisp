#!/usr/bin/env node
/**
 * scripts/design-md.mjs
 *
 * Zero-dependency support for DESIGN.md, Google's open format for design
 * systems (https://github.com/google-labs-code/design.md): machine-readable
 * design tokens in YAML front matter plus a markdown body of rationale.
 *
 * Matched against spec version "alpha" (docs/spec.md) and the lint rules of
 * the reference CLI `@google/design.md` 0.4.0 (packages/cli/src/linter).
 *
 * Consumed two ways:
 *   - `crisp design-md lint [file] [--json]`          (bin/crisp.mjs delegates here)
 *   - `crisp design-md diff <old> <new> [--json]`
 *   - `crisp design-md diff --git <ref> [--json]`     ./DESIGN.md vs `git show <ref>:DESIGN.md`
 *   - `node scripts/design-md.mjs ...` directly
 *
 * Exit codes - lint: 0 clean, 2 findings, 1 error. diff: 0 no change, 2 changes, 1 error.
 *
 * Exports: parseDesignMd, lintDesignMd, diffDesignMd, loadDesignTokens,
 * parseColor, contrastRatio, runDesignMd.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

export const SPEC_VERSION = 'alpha';

const SCHEMA_KEYS = ['version', 'name', 'description', 'omitted', 'colors', 'typography', 'rounded', 'spacing', 'components'];
const TOKEN_GROUPS = ['colors', 'typography', 'rounded', 'spacing', 'components'];
const TYPOGRAPHY_PROPS = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontFeature', 'fontVariation'];
const COMPONENT_PROPS = ['backgroundColor', 'textColor', 'typography', 'rounded', 'padding', 'size', 'height', 'width'];
const SPEC_UNITS = new Set(['px', 'em', 'rem']);
const CSS_UNITS = new Set(['px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'ex', 'pt', 'pc', 'cm', 'mm', 'in', 'q', 'lh', 'rlh', 'svh', 'lvh', 'dvh', 'svw', 'lvw', 'dvw', 'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax']);
const SECTIONS = [
  { canonical: 'Overview', aliases: ['Brand & Style'] },
  { canonical: 'Colors', aliases: [] },
  { canonical: 'Typography', aliases: [] },
  { canonical: 'Layout', aliases: ['Layout & Spacing'] },
  { canonical: 'Elevation & Depth', aliases: ['Elevation'] },
  { canonical: 'Shapes', aliases: [] },
  { canonical: 'Components', aliases: [] },
  { canonical: "Do's and Don'ts", aliases: [] },
];
const MAX_REFERENCE_DEPTH = 10;
const MAX_NESTING_DEPTH = 20;
const WCAG_AA = 4.5;
const WCAG_AA_LARGE = 3;
const REF_RE = /^\{([a-zA-Z0-9._-]+)\}$/;

// ── YAML subset parser ───────────────────────────────────────────────
//
// Enough YAML for DESIGN.md front matter: block maps, block lists (of scalars
// or maps), quoted and plain scalars, simple flow lists/maps, `|`/`>` block
// scalars and comments. Anchors, tags, multi-document streams and multi-line
// flow collections are out of scope and reported as errors, not guessed.

function stripComment(s) {
  let quote = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === '\\' && quote === '"') { i++; continue; }
      if (c === quote) {
        if (quote === "'" && s[i + 1] === "'") { i++; continue; }
        quote = null;
      }
      continue;
    }
    const prev = i === 0 ? ' ' : s[i - 1];
    if ((c === '"' || c === "'") && /[\s:[{,-]/.test(prev)) { quote = c; continue; }
    if (c === '#' && /\s/.test(prev)) return s.slice(0, i);
  }
  return s;
}

function splitFlow(inner) {
  const parts = [];
  let depth = 0, quote = null, cur = '';
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (quote) {
      cur += c;
      if (c === '\\' && quote === '"') { cur += inner[++i] ?? ''; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; cur += c; continue; }
    if (c === '[' || c === '{') depth++;
    if (c === ']' || c === '}') depth--;
    if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim() !== '') parts.push(cur);
  return parts.map(p => p.trim());
}

function unescapeDouble(s) {
  return s.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/g, (_, e) => {
    if (e[0] === 'u' || e[0] === 'x') return String.fromCharCode(parseInt(e.slice(1), 16));
    return { n: '\n', t: '\t', r: '\r', '0': '\0', '"': '"', '\\': '\\', '/': '/', ' ': ' ' }[e] ?? e;
  });
}

/** Find the `key: value` separator in a line, honouring a quoted key. */
function splitKey(text) {
  if (text[0] === '"' || text[0] === "'") {
    const q = text[0];
    let i = 1;
    for (; i < text.length; i++) {
      if (q === '"' && text[i] === '\\') { i++; continue; }
      if (text[i] === q) {
        if (q === "'" && text[i + 1] === "'") { i++; continue; }
        break;
      }
    }
    const rest = text.slice(i + 1);
    const m = rest.match(/^\s*:(\s|$)/);
    if (!m) return null;
    const raw = text.slice(1, i);
    const key = q === '"' ? unescapeDouble(raw) : raw.replace(/''/g, "'");
    return { key, rest: rest.slice(m[0].length).trim() };
  }
  const m = text.match(/^([^\s#][^:]*?)\s*:(\s|$)/);
  if (!m) return null;
  return { key: m[1], rest: text.slice(m[0].length).trim() };
}

function parseYamlSubset(src, lineOffset = 0) {
  const errors = [];
  const err = (lineNo, message, code = 'yaml-parse-error') => errors.push({ line: lineNo + lineOffset, message, code });
  const raw = src.split(/\r?\n/);
  const lines = [];
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i];
    const lead = r.match(/^[ \t]*/)[0];
    const body = stripComment(r.slice(lead.length)).replace(/\s+$/, '');
    if (body === '') {
      // Comment-only lines are kept (as skippable) because block scalars treat them as content.
      lines.push(r.trim() === '' ? null : { n: i + 1, indent: lead.replace(/\t/g, '  ').length, text: '', raw: r, comment: true });
      continue;
    }
    if (lead.includes('\t')) err(i + 1, 'Tab characters are not allowed in YAML indentation.');
    lines.push({ n: i + 1, indent: lead.replace(/\t/g, '  ').length, text: body, raw: r });
  }
  let pos = 0;
  const skip = () => { while (pos < lines.length && (lines[pos] === null || lines[pos].comment)) pos++; };
  const peek = () => { skip(); return lines[pos]; };
  const isListItem = t => t === '-' || t.startsWith('- ');

  function scalar(text, n) {
    const t = text.trim();
    if (t === '' || t === '~' || t === 'null' || t === 'Null' || t === 'NULL') return null;
    if (t[0] === '"') {
      const m = t.match(/^"((?:[^"\\]|\\.)*)"$/);
      if (!m) { err(n, `Unterminated or malformed double-quoted string: ${t}`); return t; }
      return unescapeDouble(m[1]);
    }
    if (t[0] === "'") {
      const m = t.match(/^'((?:[^']|'')*)'$/);
      if (!m) { err(n, `Unterminated or malformed single-quoted string: ${t}`); return t; }
      return m[1].replace(/''/g, "'");
    }
    if (t[0] === '[') {
      if (!t.endsWith(']')) { err(n, 'Multi-line or unterminated flow sequences are not supported.'); return t; }
      return splitFlow(t.slice(1, -1)).map(p => scalar(p, n));
    }
    if (t[0] === '{') {
      if (REF_RE.test(t)) {
        err(n, `Unquoted token reference ${t}: YAML reads {...} as a mapping. Quote it: "${t}".`, 'unquoted-reference');
        return t;
      }
      if (!t.endsWith('}')) { err(n, 'Multi-line or unterminated flow mappings are not supported.'); return t; }
      const obj = {};
      for (const part of splitFlow(t.slice(1, -1))) {
        const kv = splitKey(part);
        if (!kv) { err(n, `Malformed flow mapping entry: ${part}`); continue; }
        obj[kv.key] = scalar(kv.rest, n);
      }
      return obj;
    }
    if (t[0] === '&' || t[0] === '*' || t[0] === '!') { err(n, `Anchors, aliases and tags are not supported: ${t}`); return t; }
    if (t === 'true' || t === 'True' || t === 'TRUE') return true;
    if (t === 'false' || t === 'False' || t === 'FALSE') return false;
    if (/^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(t)) return Number(t);
    return t;
  }

  function blockScalar(indicator, parentIndent) {
    const folded = indicator[0] === '>';
    const chomp = indicator.includes('-') ? 'strip' : indicator.includes('+') ? 'keep' : 'clip';
    const collected = [];
    let blockIndent = null;
    while (pos < lines.length) {
      const l = lines[pos];
      if (l === null) { collected.push(''); pos++; continue; }
      if (l.indent <= parentIndent) break;
      // Block scalars keep `#` text: re-read the raw line.
      const rawLine = l.raw.replace(/\t/g, '  ');
      if (blockIndent === null) blockIndent = l.indent;
      collected.push(rawLine.slice(Math.min(blockIndent, l.indent)));
      pos++;
    }
    let trailing = 0;
    while (collected.length && collected[collected.length - 1] === '') { collected.pop(); trailing++; }
    let out = folded
      ? collected.reduce((acc, line, i) => (i === 0 ? line : acc + (line === '' ? '\n' : (collected[i - 1] === '' ? '' : ' ') + line)), '')
      : collected.join('\n');
    if (chomp === 'clip') out += '\n';
    if (chomp === 'keep') out += '\n'.repeat(trailing + 1);
    return out;
  }

  function valueAfterKey(rest, keyLine) {
    if (/^[|>][-+]?\d*$/.test(rest)) return blockScalar(rest, keyLine.indent);
    if (rest !== '') return scalar(rest, keyLine.n);
    const next = peek();
    if (!next) return null;
    if (next.indent > keyLine.indent) return block(next.indent);
    if (next.indent === keyLine.indent && isListItem(next.text)) return list(next.indent);
    return null;
  }

  function map(indent) {
    const obj = {};
    for (;;) {
      const l = peek();
      if (!l || l.indent < indent) break;
      if (l.indent > indent) { err(l.n, `Unexpected indentation: ${l.text}`); pos++; continue; }
      if (isListItem(l.text)) break;
      const kv = splitKey(l.text);
      if (!kv) { err(l.n, `Expected "key: value", got: ${l.text}`); pos++; continue; }
      pos++;
      const value = valueAfterKey(kv.rest, l);
      if (Object.prototype.hasOwnProperty.call(obj, kv.key)) {
        err(l.n, `Duplicate key "${kv.key}". YAML map keys must be unique.`, 'duplicate-key');
      }
      obj[kv.key] = value;
    }
    return obj;
  }

  function list(indent) {
    const arr = [];
    for (;;) {
      const l = peek();
      if (!l || l.indent !== indent || !isListItem(l.text)) break;
      const content = l.text === '-' ? '' : l.text.slice(2).replace(/^\s+/, '');
      if (content === '') {
        pos++;
        const next = peek();
        arr.push(next && next.indent > indent ? block(next.indent) : null);
        continue;
      }
      const offset = l.text.length - content.length;
      if (!/^["'[{]/.test(content) && splitKey(content)) {
        // `- key: value` starts a map whose keys align with `key`.
        lines[pos] = { ...l, indent: indent + offset, text: content };
        arr.push(map(indent + offset));
        continue;
      }
      if (/^["']/.test(content)) {
        const kv = splitKey(content);
        if (kv) { lines[pos] = { ...l, indent: indent + offset, text: content }; arr.push(map(indent + offset)); continue; }
      }
      pos++;
      arr.push(scalar(content, l.n));
    }
    return arr;
  }

  function block(indent) {
    const l = peek();
    if (!l) return null;
    return isListItem(l.text) ? list(indent) : map(indent);
  }

  const first = peek();
  let result = null;
  if (first) {
    if (first.text === '---' || first.text === '...') { err(first.n, 'Multiple YAML documents are not supported.'); }
    else if (!isListItem(first.text) && !splitKey(first.text)) result = scalar(first.text, first.n), pos++;
    else result = block(first.indent);
  }
  const leftover = peek();
  if (leftover) err(leftover.n, `Could not parse: ${leftover.text}`);
  return { value: result, errors };
}

// ── Document parser ──────────────────────────────────────────────────

/**
 * Split a DESIGN.md into front matter tokens and the markdown body.
 * @param {string} text
 * @returns {{ tokens: object|null, body: string, errors: {line:number, message:string, code:string}[], hasFrontMatter: boolean, bodyStartLine: number }}
 */
export function parseDesignMd(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const lines = src.split(/\r?\n/);
  if (lines[0] !== '---') {
    return { tokens: null, body: src, errors: [], hasFrontMatter: false, bodyStartLine: 1 };
  }
  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { close = i; break; }
  }
  if (close === -1) {
    return {
      tokens: null,
      body: '',
      errors: [{ line: 1, message: 'Front matter opened with --- but never closed with a --- line.', code: 'yaml-parse-error' }],
      hasFrontMatter: true,
      bodyStartLine: lines.length + 1,
    };
  }
  const yaml = lines.slice(1, close).join('\n');
  const { value, errors } = parseYamlSubset(yaml, 1);
  let tokens = value;
  if (tokens === null) tokens = {};
  if (typeof tokens !== 'object' || Array.isArray(tokens)) {
    errors.push({ line: 2, message: 'Front matter must be a YAML mapping of keys to values.', code: 'yaml-parse-error' });
    tokens = {};
  }
  return { tokens, body: lines.slice(close + 1).join('\n'), errors, hasFrontMatter: true, bodyStartLine: close + 2 };
}

// ── Colors ───────────────────────────────────────────────────────────

const NAMED_COLORS = 'aliceblue:f0f8ff antiquewhite:faebd7 aqua:00ffff aquamarine:7fffd4 azure:f0ffff beige:f5f5dc bisque:ffe4c4 black:000000 blanchedalmond:ffebcd blue:0000ff blueviolet:8a2be2 brown:a52a2a burlywood:deb887 cadetblue:5f9ea0 chartreuse:7fff00 chocolate:d2691e coral:ff7f50 cornflowerblue:6495ed cornsilk:fff8dc crimson:dc143c cyan:00ffff darkblue:00008b darkcyan:008b8b darkgoldenrod:b8860b darkgray:a9a9a9 darkgrey:a9a9a9 darkgreen:006400 darkkhaki:bdb76b darkmagenta:8b008b darkolivegreen:556b2f darkorange:ff8c00 darkorchid:9932cc darkred:8b0000 darksalmon:e9967a darkseagreen:8fbc8f darkslateblue:483d8b darkslategray:2f4f4f darkslategrey:2f4f4f darkturquoise:00ced1 darkviolet:9400d3 deeppink:ff1493 deepskyblue:00bfff dimgray:696969 dimgrey:696969 dodgerblue:1e90ff firebrick:b22222 floralwhite:fffaf0 forestgreen:228b22 fuchsia:ff00ff gainsboro:dcdcdc ghostwhite:f8f8ff gold:ffd700 goldenrod:daa520 gray:808080 grey:808080 green:008000 greenyellow:adff2f honeydew:f0fff0 hotpink:ff69b4 indianred:cd5c5c indigo:4b0082 ivory:fffff0 khaki:f0e68c lavender:e6e6fa lavenderblush:fff0f5 lawngreen:7cfc00 lemonchiffon:fffacd lightblue:add8e6 lightcoral:f08080 lightcyan:e0ffff lightgoldenrodyellow:fafad2 lightgray:d3d3d3 lightgrey:d3d3d3 lightgreen:90ee90 lightpink:ffb6c1 lightsalmon:ffa07a lightseagreen:20b2aa lightskyblue:87cefa lightslategray:778899 lightslategrey:778899 lightsteelblue:b0c4de lightyellow:ffffe0 lime:00ff00 limegreen:32cd32 linen:faf0e6 magenta:ff00ff maroon:800000 mediumaquamarine:66cdaa mediumblue:0000cd mediumorchid:ba55d3 mediumpurple:9370db mediumseagreen:3cb371 mediumslateblue:7b68ee mediumspringgreen:00fa9a mediumturquoise:48d1cc mediumvioletred:c71585 midnightblue:191970 mintcream:f5fffa mistyrose:ffe4e1 moccasin:ffe4b5 navajowhite:ffdead navy:000080 oldlace:fdf5e6 olive:808000 olivedrab:6b8e23 orange:ffa500 orangered:ff4500 orchid:da70d6 palegoldenrod:eee8aa palegreen:98fb98 paleturquoise:afeeee palevioletred:db7093 papayawhip:ffefd5 peachpuff:ffdab9 peru:cd853f pink:ffc0cb plum:dda0dd powderblue:b0e0e6 purple:800080 rebeccapurple:663399 red:ff0000 rosybrown:bc8f8f royalblue:4169e1 saddlebrown:8b4513 salmon:fa8072 sandybrown:f4a460 seagreen:2e8b57 seashell:fff5ee sienna:a0522d silver:c0c0c0 skyblue:87ceeb slateblue:6a5acd slategray:708090 slategrey:708090 snow:fffafa springgreen:00ff7f steelblue:4682b4 tan:d2b48c teal:008080 thistle:d8bfd8 tomato:ff6347 turquoise:40e0d0 violet:ee82ee wheat:f5deb3 white:ffffff whitesmoke:f5f5f5 yellow:ffff00 yellowgreen:9acd32 transparent:00000000'
  .split(' ').reduce((acc, pair) => { const [k, v] = pair.split(':'); acc[k] = v; return acc; }, {});

const clamp01 = v => Math.min(1, Math.max(0, v));
const gammaEncode = v => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
const linearToRgb255 = (r, g, b) => [r, g, b].map(v => clamp01(gammaEncode(v)) * 255);

function hexToRgba(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
}

function num(s, pctScale = 1) {
  if (s === 'none') return 0;
  const m = String(s).match(/^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(%?)$/i);
  if (!m) return NaN;
  return m[2] ? (parseFloat(m[1]) / 100) * pctScale : parseFloat(m[1]);
}

function hue(s) {
  if (s === 'none') return 0;
  const m = String(s).match(/^([-+]?(?:\d+\.?\d*|\.\d+))(deg|rad|grad|turn)?$/i);
  if (!m) return NaN;
  const v = parseFloat(m[1]);
  const unit = (m[2] || 'deg').toLowerCase();
  const deg = unit === 'rad' ? (v * 180) / Math.PI : unit === 'grad' ? v * 0.9 : unit === 'turn' ? v * 360 : v;
  return ((deg % 360) + 360) % 360;
}

function alpha(s) {
  if (s === undefined) return 1;
  const v = num(s, 1);
  return Number.isNaN(v) ? NaN : clamp01(v);
}

function hslToRgb(h, s, l) {
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function hwbToRgb(h, w, b) {
  if (w + b >= 1) { const g = (w / (w + b)) * 255; return [g, g, g]; }
  return hslToRgb(h, 1, 0.5).map(v => (v / 255) * (1 - w - b) * 255 + w * 255);
}

function labToRgb(L, a, b) {
  const e = 216 / 24389, k = 24389 / 27;
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const xr = fx ** 3 > e ? fx ** 3 : (116 * fx - 16) / k;
  const yr = L > k * e ? fy ** 3 : L / k;
  const zr = fz ** 3 > e ? fz ** 3 : (116 * fz - 16) / k;
  const X50 = xr * 0.96422, Y50 = yr, Z50 = zr * 0.82521;
  const X = 0.9554734527042182 * X50 - 0.023098536874261423 * Y50 + 0.0632593086610217 * Z50;
  const Y = -0.028369706963208136 * X50 + 1.0099954580058226 * Y50 + 0.021041398966943008 * Z50;
  const Z = 0.012314001688319899 * X50 - 0.020507696433477912 * Y50 + 1.3303659366080753 * Z50;
  return linearToRgb255(
    3.2409699419045226 * X - 1.537383177570094 * Y - 0.4986107602930034 * Z,
    -0.9692436362808796 * X + 1.8759675015077202 * Y + 0.04155505740717559 * Z,
    0.05563007969699366 * X - 0.20397695888897652 * Y + 1.0569715142428786 * Z,
  );
}

function oklabToRgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return linearToRgb255(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  );
}

function splitArgs(inner) {
  const [main, a] = inner.split('/').map(s => s.trim());
  const parts = main.includes(',') ? main.split(',').map(s => s.trim()) : main.split(/\s+/);
  if (a !== undefined) parts.push(a);
  return parts.filter(p => p !== '');
}

/**
 * Parse any CSS color the spec allows into sRGB.
 * @param {string} input
 * @returns {{r:number,g:number,b:number,a:number,hex:string}|null} r/g/b 0-255, a 0-1
 */
export function parseColor(input, depth = 0) {
  if (typeof input !== 'string' || depth > 4) return null;
  const s = input.trim().toLowerCase();
  if (s.length === 0 || s.length > 200) return null;
  let rgba = null;
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(s)) rgba = hexToRgba(s);
  else if (Object.prototype.hasOwnProperty.call(NAMED_COLORS, s)) rgba = hexToRgba(NAMED_COLORS[s]);
  else {
    const m = s.match(/^([a-z-]+)\((.*)\)$/);
    if (!m) return null;
    const fn = m[1];
    if (fn === 'color-mix') return parseColorMix(m[2], depth);
    const p = splitArgs(m[2]);
    if (p.length < 3 || p.length > 4) return null;
    let rgb;
    if (fn === 'rgb' || fn === 'rgba') rgb = p.slice(0, 3).map(v => num(v, 255));
    else if (fn === 'hsl' || fn === 'hsla') rgb = hslToRgb(hue(p[0]), clamp01(num(p[1].endsWith('%') ? p[1] : p[1] + '%', 1)), clamp01(num(p[2].endsWith('%') ? p[2] : p[2] + '%', 1)));
    else if (fn === 'hwb') rgb = hwbToRgb(hue(p[0]), clamp01(num(p[1], 1)), clamp01(num(p[2], 1)));
    else if (fn === 'lab') rgb = labToRgb(num(p[0], 100), num(p[1], 125), num(p[2], 125));
    else if (fn === 'lch') { const L = num(p[0], 100), C = num(p[1], 150), H = (hue(p[2]) * Math.PI) / 180; rgb = labToRgb(L, C * Math.cos(H), C * Math.sin(H)); }
    else if (fn === 'oklab') rgb = oklabToRgb(num(p[0], 1), num(p[1], 0.4), num(p[2], 0.4));
    else if (fn === 'oklch') { const L = num(p[0], 1), C = num(p[1], 0.4), H = (hue(p[2]) * Math.PI) / 180; rgb = oklabToRgb(L, C * Math.cos(H), C * Math.sin(H)); }
    else return null;
    const a = alpha(p[3]);
    if (rgb.some(v => Number.isNaN(v)) || Number.isNaN(a)) return null;
    rgba = { r: Math.min(255, Math.max(0, rgb[0])), g: Math.min(255, Math.max(0, rgb[1])), b: Math.min(255, Math.max(0, rgb[2])), a };
  }
  const h = v => Math.round(v).toString(16).padStart(2, '0');
  return { ...rgba, hex: `#${h(rgba.r)}${h(rgba.g)}${h(rgba.b)}` };
}

function parseColorMix(inner, depth) {
  const parts = splitFlow(inner);
  if (parts.length !== 3 || !/^in\s+srgb$/.test(parts[0])) return null;
  const parsePart = part => {
    const m = part.match(/^(.*?)(?:\s+([\d.]+)%)?$/);
    const c = parseColor(m[1], depth + 1);
    return c ? { c, w: m[2] !== undefined ? parseFloat(m[2]) / 100 : null } : null;
  };
  const a = parsePart(parts[1]), b = parsePart(parts[2]);
  if (!a || !b) return null;
  let wa = a.w, wb = b.w;
  if (wa === null && wb === null) { wa = 0.5; wb = 0.5; } else if (wa === null) wa = 1 - wb; else if (wb === null) wb = 1 - wa;
  const total = wa + wb || 1;
  wa /= total; wb /= total;
  const mix = k => a.c[k] * wa + b.c[k] * wb;
  const out = { r: mix('r'), g: mix('g'), b: mix('b'), a: mix('a') };
  const h = v => Math.round(v).toString(16).padStart(2, '0');
  return { ...out, hex: `#${h(out.r)}${h(out.g)}${h(out.b)}` };
}

function luminance({ r, g, b }) {
  const lin = v => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG 2.x contrast ratio between two parsed colors. A translucent foreground is composited over the background. */
export function contrastRatio(fg, bg) {
  const f = fg.a < 1 ? { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) } : fg;
  const l1 = luminance(f), l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ── Model ────────────────────────────────────────────────────────────

const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

function parseDimension(v) {
  if (typeof v !== 'string' || v.length > 64) return null;
  const m = v.match(/^(-?\d*\.?\d+)([a-zA-Z%]+)$/);
  if (!m) return null;
  return { value: parseFloat(m[1]), unit: m[2].toLowerCase() };
}

function toPx(v) {
  if (typeof v === 'number') return v;
  const d = parseDimension(v);
  if (!d) return null;
  if (d.unit === 'px') return d.value;
  if (d.unit === 'rem' || d.unit === 'em') return d.value * 16;
  if (d.unit === 'pt') return (d.value * 4) / 3;
  return null;
}

/**
 * Build the symbol table: every leaf under a token group keyed by dotted path.
 * Group nodes (typography levels, components, nested color groups) are kept
 * in `groups` so references to composites can resolve.
 */
function buildModel(tokens) {
  const leaves = new Map();
  const groups = new Map();
  const findings = [];
  const walk = (node, path, depth, root) => {
    if (depth > MAX_NESTING_DEPTH) {
      if (!findings.some(f => f.path === root && f.id === 'nesting-too-deep')) {
        findings.push({ id: 'nesting-too-deep', severity: 'P1', path: root, message: `Token nesting depth exceeds the maximum of ${MAX_NESTING_DEPTH}.` });
      }
      return;
    }
    if (isPlainObject(node)) {
      groups.set(path, node);
      for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, depth + 1, root);
    } else {
      leaves.set(path, node);
    }
  };
  for (const g of TOKEN_GROUPS) {
    if (tokens[g] === undefined || tokens[g] === null) continue;
    if (!isPlainObject(tokens[g])) {
      findings.push({ id: 'invalid-group', severity: 'P1', path: g, message: `'${g}' must be a map of token names to values.` });
      continue;
    }
    walk(tokens[g], g, 0, g);
  }
  return { leaves, groups, findings };
}

/**
 * Resolve a value through `{path}` references.
 * @returns {{ value: any, kind: 'value'|'group', error?: 'broken'|'circular'|'depth', chain: string[] }}
 */
function resolve(model, value, seen = [], depth = 0) {
  if (typeof value !== 'string') return { value, kind: 'value', chain: seen };
  const m = value.trim().match(REF_RE);
  if (!m) return { value, kind: 'value', chain: seen };
  const path = m[1];
  if (seen.includes(path)) return { value, kind: 'value', error: 'circular', chain: [...seen, path] };
  if (depth >= MAX_REFERENCE_DEPTH) return { value, kind: 'value', error: 'depth', chain: [...seen, path] };
  if (model.leaves.has(path)) return resolve(model, model.leaves.get(path), [...seen, path], depth + 1);
  if (model.groups.has(path)) return { value: model.groups.get(path), kind: 'group', path, chain: [...seen, path] };
  return { value, kind: 'value', error: 'broken', chain: [...seen, path] };
}

function resolveDeep(model, node, seen = []) {
  if (isPlainObject(node)) {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = resolveDeep(model, v, seen);
    return out;
  }
  const r = resolve(model, node, seen);
  if (r.error) return node;
  if (r.kind === 'group') return resolveDeep(model, r.value, r.chain);
  return r.value;
}

// ── Lint ─────────────────────────────────────────────────────────────

function levenshtein(a, b) {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function colorFamily(name) {
  return name.replace(/^on-/, '').replace(/^inverse-/, '').replace(/^on-/, '')
    .replace(/-container.*$/, '').replace(/-fixed.*$/, '').replace(/-(dim|bright|tint|variant)$/, '');
}
const MD3_FAMILIES = new Set(['primary', 'secondary', 'tertiary', 'error', 'surface', 'background', 'outline']);

function canonicalSection(heading) {
  const h = heading.trim().toLowerCase();
  for (const s of SECTIONS) {
    if (s.canonical.toLowerCase() === h || s.aliases.some(a => a.toLowerCase() === h)) return s.canonical;
  }
  return null;
}

function bodyHeadings(body) {
  const out = [];
  let fence = null;
  for (const line of body.split(/\r?\n/)) {
    const f = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const m = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (m && !line.startsWith('###')) out.push(m[1]);
  }
  return out;
}

function hasTokenLikeContent(obj, depth = 0) {
  for (const [k, v] of Object.entries(obj)) {
    if (TYPOGRAPHY_PROPS.slice(0, 5).includes(k)) return true;
    if (typeof v === 'string' && v.length <= 64 && (/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v) || /^-?\d*\.?\d+[a-zA-Z%]+$/.test(v))) return true;
    if (isPlainObject(v) && depth < 1 && hasTokenLikeContent(v, depth + 1)) return true;
  }
  return false;
}

/**
 * Lint a DESIGN.md document. Mirrors the checks in `@google/design.md lint`
 * plus CRISP extras (circular refs reported separately, refs checked in every
 * group, large-text contrast threshold, on-X/X color pairs).
 * @param {string} text
 * @returns {{id:string, severity:'P0'|'P1'|'P2'|'P3', path:string, message:string}[]}
 */
export function lintDesignMd(text) {
  const parsed = parseDesignMd(text);
  const findings = [];
  const add = (id, severity, path, message) => findings.push({ id, severity, path, message });

  for (const e of parsed.errors) {
    if (e.code === 'unquoted-reference') add('unquoted-reference', 'P1', `line ${e.line}`, e.message);
    else if (e.code === 'duplicate-key') add('duplicate-key', 'P1', `line ${e.line}`, e.message);
    else add('yaml-parse-error', 'P0', `line ${e.line}`, `Front matter YAML could not be parsed: ${e.message}`);
  }

  // Body checks run whether or not there are tokens.
  const headings = bodyHeadings(parsed.body);
  const known = headings.map(canonicalSection).filter(Boolean);
  const seenSections = new Set();
  for (const s of known) {
    if (seenSections.has(s)) add('duplicate-section', 'P1', `## ${s}`, `Section '${s}' appears more than once. The spec rejects files with duplicate section headings.`);
    seenSections.add(s);
  }
  const order = SECTIONS.map(s => s.canonical);
  for (let i = 0; i < known.length - 1; i++) {
    if (order.indexOf(known[i]) > order.indexOf(known[i + 1])) {
      add('section-order', 'P2', `## ${known[i]}`, `Section '${known[i]}' appears before '${known[i + 1]}', which is out of order. Expected order: ${order.join(', ')}.`);
      break;
    }
  }

  if (!parsed.hasFrontMatter) {
    add('missing-front-matter', 'P1', 'DESIGN.md', 'No YAML front matter found. Design tokens belong between a leading --- line and a closing --- line.');
    return findings;
  }
  if (parsed.tokens === null) return findings;
  const tokens = parsed.tokens;

  // Unknown and token-like top-level keys.
  for (const key of Object.keys(tokens)) {
    if (SCHEMA_KEYS.includes(key)) continue;
    let best = null, bestDist = Infinity;
    for (const k of SCHEMA_KEYS) {
      if (Math.abs(key.length - k.length) > 2) continue;
      const d = levenshtein(key.toLowerCase(), k);
      if (d < bestDist) { bestDist = d; best = k; }
    }
    if (best && bestDist <= 2) add('unknown-key', 'P2', key, `Unknown key "${key}" - did you mean "${best}"?`);
    else if (isPlainObject(tokens[key]) && hasTokenLikeContent(tokens[key])) {
      add('token-like-ignored', 'P2', key, `"${key}" looks like a design-token map but is not a recognized schema key (${TOKEN_GROUPS.join(', ')}). Tools will silently ignore it.`);
    }
  }

  const model = buildModel(tokens);
  findings.push(...model.findings);

  // Grouped keys that flatten onto an existing name (primary-60 vs primary: {60}).
  for (const g of ['colors', 'rounded', 'spacing']) {
    const seen = new Map();
    for (const path of model.leaves.keys()) {
      if (!path.startsWith(`${g}.`)) continue;
      const name = path.slice(g.length + 1);
      const norm = name.replace(/\./g, '-');
      if (seen.has(norm)) add('token-collision', 'P1', path, `Grouped ${g} token flattens to '${norm}', which is already defined at ${g}.${seen.get(norm)}.`);
      else seen.set(norm, name);
    }
  }

  // References everywhere.
  const referenced = new Set();
  for (const [path, value] of model.leaves) {
    if (typeof value !== 'string' || !REF_RE.test(value.trim())) continue;
    const r = resolve(model, value);
    r.chain.forEach(p => referenced.add(p));
    if (r.error === 'broken') add('broken-ref', 'P1', path, `Reference ${value} does not resolve to any defined token.`);
    else if (r.error === 'circular') add('circular-ref', 'P1', path, `Reference ${value} is circular: ${[path, ...r.chain].join(' -> ')}.`);
    else if (r.error === 'depth') add('circular-ref', 'P1', path, `Reference ${value} exceeds the maximum reference depth of ${MAX_REFERENCE_DEPTH}.`);
    else if (r.kind === 'group' && !path.startsWith('components.')) {
      add('ref-to-group', 'P1', path, `Reference ${value} points to a group, not a value. Only components may reference composite tokens.`);
    }
  }

  // Colors.
  const colors = new Map();
  for (const [path, value] of model.leaves) {
    if (!path.startsWith('colors.')) continue;
    const r = resolve(model, value);
    if (r.error || r.kind === 'group') continue;
    const c = parseColor(typeof r.value === 'string' ? r.value : '');
    const name = path.slice('colors.'.length);
    if (!c) {
      const via = r.value !== value ? ` (resolved from ${value})` : '';
      const hint = r.value === null ? ' An unquoted #hex is read as a YAML comment - quote it.' : '';
      add('invalid-color', 'P1', path, `'${r.value}'${via} is not a valid color. Expected a CSS color value (e.g. #ffffff, rgb(0 0 0), oklch(0.5 0.2 240)).${hint}`);
    } else colors.set(name, c);
  }

  // Rounded.
  for (const [path, value] of model.leaves) {
    if (!path.startsWith('rounded.')) continue;
    const r = resolve(model, value);
    if (r.error || r.kind === 'group') continue;
    const d = parseDimension(r.value);
    if (!d || !CSS_UNITS.has(d.unit)) add('invalid-dimension', 'P1', path, `'${r.value}' is not a valid dimension. Use a number with px, rem or em.`);
    else if (!SPEC_UNITS.has(d.unit)) add('invalid-dimension', 'P1', path, `'${r.value}' has an invalid unit '${d.unit}'. Only px, rem and em are allowed.`);
  }

  // Typography.
  const typography = isPlainObject(tokens.typography) ? tokens.typography : {};
  for (const [level, props] of Object.entries(typography)) {
    const base = `typography.${level}`;
    if (!isPlainObject(props)) { add('invalid-typography', 'P1', base, `Typography level '${level}' must be a map of font properties.`); continue; }
    for (const [prop, rawV] of Object.entries(props)) {
      const path = `${base}.${prop}`;
      if (!TYPOGRAPHY_PROPS.includes(prop)) { add('unknown-typography-prop', 'P2', path, `'${prop}' is not a recognized typography property. Valid properties: ${TYPOGRAPHY_PROPS.join(', ')}.`); continue; }
      const r = resolve(model, rawV);
      if (r.error || r.kind === 'group') continue;
      const v = r.value;
      if (prop === 'fontFamily' && typeof v === 'string' && parseColor(v) && !/^[A-Z]/.test(v.trim())) {
        add('invalid-font-family', 'P1', path, `'${v}' appears to be a color, not a font family.`);
      }
      if (prop === 'fontWeight' && (v === null || Number.isNaN(Number(v)) || typeof v === 'boolean')) {
        add('invalid-font-weight', 'P1', path, `'${v}' is not a valid font weight. Expected a number such as 400 or 700.`);
      }
      if (prop === 'fontSize' || prop === 'letterSpacing' || (prop === 'lineHeight' && typeof v !== 'number' && !/^-?\d*\.?\d+$/.test(String(v)))) {
        const d = parseDimension(typeof v === 'number' ? '' : v);
        if (typeof v === 'number' && prop !== 'lineHeight') add('invalid-dimension', 'P1', path, `'${v}' needs a unit. Use px, rem or em.`);
        else if (!d || !CSS_UNITS.has(d.unit)) add('invalid-dimension', 'P1', path, `'${v}' is not a valid dimension.`);
        else if (!SPEC_UNITS.has(d.unit)) add('invalid-dimension', 'P1', path, `'${v}' has an invalid unit '${d.unit}'. Only px, rem and em are allowed.`);
      }
    }
  }

  // Components: sub-tokens, literal colors, contrast.
  const components = isPlainObject(tokens.components) ? tokens.components : {};
  for (const [comp, props] of Object.entries(components)) {
    const base = `components.${comp}`;
    if (!isPlainObject(props)) { add('invalid-component', 'P1', base, `Component '${comp}' must be a map of sub-token names to values.`); continue; }
    for (const prop of Object.keys(props)) {
      if (!COMPONENT_PROPS.includes(prop)) add('unknown-component-prop', 'P2', `${base}.${prop}`, `'${prop}' is not a recognized component sub-token. Valid sub-tokens: ${COMPONENT_PROPS.join(', ')}.`);
    }
    const colorOf = prop => {
      if (props[prop] === undefined) return null;
      const r = resolve(model, props[prop]);
      if (r.error || r.kind === 'group') return null;
      const c = parseColor(typeof r.value === 'string' ? r.value : '');
      if (!c) add('invalid-color', 'P1', `${base}.${prop}`, `'${r.value}' is not a valid color.`);
      return c;
    };
    const bg = colorOf('backgroundColor');
    const fg = colorOf('textColor');
    if (bg && fg && bg.a === 1) {
      let large = false;
      if (props.typography !== undefined) {
        const t = resolve(model, props.typography);
        if (t.kind === 'group' && isPlainObject(t.value)) {
          const typo = resolveDeep(model, t.value, t.chain);
          const px = toPx(typo.fontSize);
          const weight = Number(typo.fontWeight);
          large = px !== null && (px >= 24 || (px >= 18.66 && weight >= 700));
        }
      }
      const min = large ? WCAG_AA_LARGE : WCAG_AA;
      const ratio = contrastRatio(fg, bg);
      if (ratio < min) {
        add('contrast-ratio', 'P1', base, `textColor (${fg.hex}) on backgroundColor (${bg.hex}) has contrast ratio ${ratio.toFixed(2)}:1, below the WCAG AA minimum of ${min}:1${large ? ' for large text' : ''}.`);
      }
    }
  }

  // Declared foreground/background color pairs: on-X over X (MD3 / spec naming convention).
  for (const [name, fg] of colors) {
    if (!name.startsWith('on-')) continue;
    const bg = colors.get(name.slice(3));
    if (!bg || bg.a < 1) continue;
    const ratio = contrastRatio(fg, bg);
    if (ratio < WCAG_AA) {
      add('contrast-ratio', 'P1', `colors.${name}`, `${name} (${fg.hex}) on ${name.slice(3)} (${bg.hex}) has contrast ratio ${ratio.toFixed(2)}:1, below the WCAG AA minimum of ${WCAG_AA}:1.`);
    }
  }

  // Coverage rules.
  const omittedRaw = Array.isArray(tokens.omitted) ? tokens.omitted : [];
  const omitted = omittedRaw.map(i => (typeof i === 'string' ? i : isPlainObject(i) && typeof i.section === 'string' ? i.section : null)).filter(Boolean).map(s => s.toLowerCase());
  const groupSize = g => (isPlainObject(tokens[g]) ? Object.keys(tokens[g]).length : 0);
  for (const s of omitted) {
    if (!TOKEN_GROUPS.includes(s)) add('unknown-omission', 'P2', 'omitted', `Unknown section name '${s}' in omitted. Valid: ${TOKEN_GROUPS.join(', ')}.`);
    else if (groupSize(s) > 0) add('redundant-omission', 'P2', 'omitted', `${s} is listed in omitted but ${s} tokens are defined, so the omission has no effect.`);
  }
  if (groupSize('colors') > 0 && !colors.has('primary') && !model.leaves.has('colors.primary')) {
    add('missing-primary', 'P2', 'colors', "No 'primary' color defined. Agents will invent key colors, reducing control over the palette.");
  }
  if (groupSize('colors') > 0 && groupSize('typography') === 0 && !omitted.includes('typography')) {
    add('missing-typography', 'P2', 'typography', 'No typography tokens defined. Agents will fall back to default font choices.');
  }
  for (const g of ['spacing', 'rounded']) {
    if (groupSize('colors') > 0 && groupSize(g) === 0 && !omitted.includes(g)) {
      add('missing-sections', 'P3', g, `No '${g}' section defined. ${g === 'spacing' ? 'Layout spacing' : 'Corner rounding'} will fall back to agent defaults.`);
    }
  }

  // Orphaned colors: defined but never reached from any component.
  if (groupSize('components') > 0) {
    const fromComponents = new Set();
    for (const [path, value] of model.leaves) {
      if (!path.startsWith('components.')) continue;
      resolve(model, value).chain.forEach(p => fromComponents.add(p));
    }
    const families = new Set([...fromComponents].filter(p => p.startsWith('colors.')).map(p => colorFamily(p.slice(7))));
    for (const name of colors.keys()) {
      const path = `colors.${name}`;
      const fam = colorFamily(name);
      if (fromComponents.has(path) || families.has(fam) || MD3_FAMILIES.has(fam)) continue;
      add('orphaned-tokens', 'P3', path, `'${name}' is defined but never referenced by any component.`);
    }
  }

  return findings;
}

// ── Diff ─────────────────────────────────────────────────────────────

function flattenAll(node, prefix, out) {
  if (isPlainObject(node)) {
    const keys = Object.keys(node);
    if (keys.length === 0 && prefix) out.set(prefix, {});
    for (const k of keys) flattenAll(node[k], prefix ? `${prefix}.${k}` : k, out);
  } else if (prefix) {
    out.set(prefix, node);
  }
  return out;
}

/**
 * Token-path level diff of two DESIGN.md documents (raw values, so a changed
 * reference shows as a change even when it resolves to the same color).
 * @returns {{ added:{path,value}[], removed:{path,value}[], changed:{path,before,after}[] }}
 */
export function diffDesignMd(oldText, newText) {
  const a = flattenAll(parseDesignMd(oldText).tokens || {}, '', new Map());
  const b = flattenAll(parseDesignMd(newText).tokens || {}, '', new Map());
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const added = [], removed = [], changed = [];
  for (const [path, value] of b) {
    if (!a.has(path)) added.push({ path, value });
    else if (!same(a.get(path), value)) changed.push({ path, before: a.get(path), after: value });
  }
  for (const [path, value] of a) if (!b.has(path)) removed.push({ path, value });
  const byPath = (x, y) => x.path.localeCompare(y.path);
  return { added: added.sort(byPath), removed: removed.sort(byPath), changed: changed.sort(byPath) };
}

// ── Token loading for other tools ────────────────────────────────────

/**
 * Read ./DESIGN.md (relative to cwd) and return a flat map of token path to
 * resolved value. Composite references (a component's typography) expand to
 * sub-paths. Returns null when there is no DESIGN.md.
 * @param {string} [cwd]
 * @returns {Record<string, any>|null}
 */
export function loadDesignTokens(cwd = process.cwd()) {
  const file = join(cwd, 'DESIGN.md');
  if (!existsSync(file)) return null;
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { return null; }
  const { tokens } = parseDesignMd(text);
  if (!tokens) return {};
  const model = buildModel(tokens);
  const out = {};
  const put = (path, value) => {
    if (isPlainObject(value)) for (const [k, v] of Object.entries(value)) put(`${path}.${k}`, v);
    else out[path] = value;
  };
  for (const key of ['version', 'name', 'description']) if (tokens[key] !== undefined && !isPlainObject(tokens[key])) out[key] = tokens[key];
  for (const [path, value] of model.leaves) {
    const r = resolve(model, value);
    if (r.error) out[path] = value;
    else if (r.kind === 'group') put(path, resolveDeep(model, r.value, r.chain));
    else out[path] = r.value;
  }
  return out;
}

// ── CLI ──────────────────────────────────────────────────────────────

const SEVERITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };
const USAGE = 'Usage:\n  crisp design-md lint [file] [--json]\n  crisp design-md diff <old> <new> [--json]\n  crisp design-md diff --git <ref> [--json]';

const fmt = v => (typeof v === 'string' ? v : JSON.stringify(v));

/**
 * @param {string[]} argv - arguments after `design-md`
 * @returns {number} exit code
 */
export function runDesignMd(argv) {
  const json = argv.includes('--json');
  const args = argv.filter(a => a !== '--json');
  const [cmd, ...rest] = args;

  if (cmd === 'lint') {
    const file = rest[0] || 'DESIGN.md';
    let text;
    try { text = readFileSync(file, 'utf8'); } catch (err) {
      console.error(`crisp design-md: cannot read ${file} (${err.code || err.message}).`);
      return 1;
    }
    const findings = lintDesignMd(text).sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
    const summary = { P0: 0, P1: 0, P2: 0, P3: 0 };
    findings.forEach(f => { summary[f.severity]++; });
    if (json) {
      console.log(JSON.stringify({ file, specVersion: SPEC_VERSION, findingCount: findings.length, summary, findings }, null, 2));
    } else if (findings.length === 0) {
      console.log(`crisp design-md: ${file} is clean - 0 findings.`);
    } else {
      for (const f of findings) console.log(`${file}  [${f.severity}] ${f.id}  ${f.path}: ${f.message}`);
      console.log(`\ncrisp design-md: ${findings.length} finding(s) in ${file}.`);
    }
    return findings.length > 0 ? 2 : 0;
  }

  if (cmd === 'diff') {
    let oldText, newText, oldLabel, newLabel;
    try {
      if (rest[0] === '--git') {
        const ref = rest[1];
        if (!ref) { console.error(USAGE); return 1; }
        oldLabel = `${ref}:DESIGN.md`;
        newLabel = 'DESIGN.md';
        oldText = execFileSync('git', ['show', `${ref}:DESIGN.md`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
        newText = readFileSync('DESIGN.md', 'utf8');
      } else {
        if (rest.length < 2) { console.error(USAGE); return 1; }
        [oldLabel, newLabel] = rest;
        oldText = readFileSync(oldLabel, 'utf8');
        newText = readFileSync(newLabel, 'utf8');
      }
    } catch (err) {
      const detail = err.stderr ? String(err.stderr).trim() : (err.code || err.message);
      console.error(`crisp design-md: cannot read input (${detail}).`);
      return 1;
    }
    for (const [label, t] of [[oldLabel, oldText], [newLabel, newText]]) {
      const p = parseDesignMd(t);
      const fatal = p.errors.filter(e => e.code === 'yaml-parse-error');
      if (fatal.length) { console.error(`crisp design-md: ${label} front matter does not parse (line ${fatal[0].line}: ${fatal[0].message}).`); return 1; }
    }
    const diff = diffDesignMd(oldText, newText);
    const total = diff.added.length + diff.removed.length + diff.changed.length;
    if (json) {
      console.log(JSON.stringify({ before: oldLabel, after: newLabel, changeCount: total, ...diff }, null, 2));
    } else if (total === 0) {
      console.log(`crisp design-md: no token changes between ${oldLabel} and ${newLabel}.`);
    } else {
      for (const a of diff.added) console.log(`+ ${a.path}: ${fmt(a.value)}`);
      for (const r of diff.removed) console.log(`- ${r.path}: ${fmt(r.value)}`);
      for (const c of diff.changed) console.log(`~ ${c.path}: ${fmt(c.before)} -> ${fmt(c.after)}`);
      console.log(`\ncrisp design-md: ${total} token change(s) (${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed).`);
    }
    return total > 0 ? 2 : 0;
  }

  console.error(USAGE);
  return 1;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  process.exit(runDesignMd(process.argv.slice(2)));
}
