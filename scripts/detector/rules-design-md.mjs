/**
 * scripts/detector/rules-design-md.mjs
 *
 * Detector rules that only fire when the project has a ./DESIGN.md (Google's
 * DESIGN.md format, see scripts/design-md.mjs). The DESIGN.md front matter is
 * the declared token set; these rules flag literal values in code that sit
 * outside it. No DESIGN.md means no opinion, so every rule returns [].
 *
 * Same rule shape as rules.mjs: { id, severity, category, message, extensions, test(text) }.
 * The engine calls rule.test(text) with no path, so the token set is read
 * from process.cwd() and cached by cwd + DESIGN.md mtime.
 */

import { statSync } from 'node:fs';
import { join } from 'node:path';
import { loadDesignTokens, parseColor } from '../design-md.mjs';

const STYLE_EXTENSIONS = ['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro'];

let cache = { key: null, value: null };

/** @returns {{ colors: Set<string>, radiiPx: Set<number> } | null} */
function tokenSets() {
  const cwd = process.cwd();
  const file = join(cwd, 'DESIGN.md');
  let mtime;
  try { mtime = statSync(file).mtimeMs; } catch { mtime = null; }
  const key = `${cwd}|${mtime}`;
  if (cache.key === key) return cache.value;

  let value = null;
  const tokens = mtime === null ? null : loadDesignTokens(cwd);
  if (tokens) {
    const colors = new Set();
    const radiiPx = new Set();
    for (const [path, v] of Object.entries(tokens)) {
      if (typeof v !== 'string') continue;
      if (path.startsWith('colors.') || /^components\.[^.]+\.[a-zA-Z]*[cC]olor$/.test(path)) {
        const c = parseColor(v);
        if (c) colors.add(c.hex);
      }
      if (path.startsWith('rounded.') || /^components\.[^.]+\.rounded$/.test(path)) {
        const px = dimensionToPx(v);
        if (px !== null) radiiPx.add(px);
      }
    }
    value = { colors, radiiPx };
  }
  cache = { key, value };
  return value;
}

function dimensionToPx(v) {
  const m = String(v).trim().match(/^(-?\d*\.?\d+)(px|rem|em)$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2].toLowerCase() === 'px' ? n : n * 16;
}

/** Normalise #abc / #abcd / #aabbcc / #aabbccdd to #aabbcc (alpha ignored: a translucent token color is still on-token). */
export function normaliseHex(hex) {
  let h = hex.replace('#', '').toLowerCase();
  if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
  return `#${h.slice(0, 6)}`;
}

// A hex literal not preceded by a word char or & (HTML entities, ids in identifiers).
const HEX_RE = /(?<![\w&#])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
// Fragment links and SVG references that happen to be valid hex (href="#bad", url(#fade)).
const NOT_A_COLOR_BEFORE = /(href|to|xlink:href|src|action)\s*=\s*["'{`]?\s*$|url\(\s*["']?$/i;

export const DESIGN_MD_RULES = [
  {
    id: 'off-token-color',
    severity: 'P2',
    category: 'design-system',
    extensions: STYLE_EXTENSIONS,
    message: 'Hex color not in DESIGN.md. Use a declared color token, or add the color to DESIGN.md if it is a real part of the palette.',
    test(text) {
      const sets = tokenSets();
      if (!sets || sets.colors.size === 0) return [];
      const out = [];
      HEX_RE.lastIndex = 0;
      let m;
      while ((m = HEX_RE.exec(text)) !== null) {
        const before = text.slice(Math.max(0, m.index - 40), m.index);
        if (NOT_A_COLOR_BEFORE.test(before)) continue;
        if (sets.colors.has(normaliseHex(m[0]))) continue;
        out.push({ index: m.index, snippet: m[0] });
      }
      return out;
    },
  },
  {
    id: 'off-token-radius',
    severity: 'P3',
    category: 'design-system',
    extensions: STYLE_EXTENSIONS,
    message: 'Pixel border radius not in DESIGN.md rounded tokens. Use a declared radius so corners stay consistent.',
    test(text) {
      const sets = tokenSets();
      if (!sets || sets.radiiPx.size === 0) return [];
      const out = [];
      // CSS `border-radius: 6px` (single value only), JSX `borderRadius: '6px'`, Tailwind `rounded-[6px]`.
      const re = /\bborder-radius\s*:\s*(\d*\.?\d+)px\s*(?:!important\s*)?[;}"'\n]|\bborderRadius\s*:\s*["'`](\d*\.?\d+)px["'`]|\brounded(?:-[trblse]{1,2})?-\[(\d*\.?\d+)px\]/g;
      let m;
      while ((m = re.exec(text)) !== null) {
        const px = parseFloat(m[1] ?? m[2] ?? m[3]);
        if (px === 0 || sets.radiiPx.has(px)) continue;
        out.push({ index: m.index, snippet: (m[1] !== undefined ? m[0].replace(/\s*(!important\s*)?[;}"'\n]$/, '') : m[0]).trim() });
      }
      return out;
    },
  },
];
