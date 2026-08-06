/**
 * scripts/detector/rules.mjs
 *
 * The CRISP detector's rule registry. Each rule is a pure text scan over one
 * file's source: no DOM, no browser, no build step. That keeps false-positive
 * risk low and the tool runnable in CI, a pre-commit hook, or a Claude Code
 * hook with zero dependencies beyond Node itself.
 *
 * This is v1: the 14 tells that are reliably regex-detectable with low noise.
 * Tells that need real contrast computation, DOM structure, or rendered
 * layout (cream-palette-plus-generic-sans, icon-only nav, color-only error
 * states) stay LLM-judgement territory - documented in crisp-audit.md's AI
 * Slop Check table, not here. Don't add a rule here unless its false-positive
 * rate is low enough to surface automatically without a human gate.
 *
 * Each rule: { id, severity, category, message, extensions, test(text) }
 * `test` returns an array of { index, snippet } matches; the engine turns
 * `index` into a line number and applies ignores.
 */

const CODE_EXTENSIONS = ['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro'];
const STYLE_EXTENSIONS = ['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro'];
const MARKUP_EXTENSIONS = ['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro'];

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  return line;
}

function matchesOf(text, regex) {
  const out = [];
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ index: m.index, snippet: m[0].trim().slice(0, 120) });
    if (m[0].length === 0) re.lastIndex++; // avoid infinite loop on zero-width matches
  }
  return out;
}

const GENERIC_FONT_TOKENS = new Set([
  'arial', 'inter', 'system-ui', '-apple-system', 'blinkmacsystemfont',
  'segoe ui', 'helvetica', 'helvetica neue', 'sans-serif', 'roboto', 'tahoma', 'verdana',
]);

export const RULES = [
  {
    id: 'gradient-text',
    severity: 'P1',
    category: 'color',
    extensions: STYLE_EXTENSIONS,
    message: 'Gradient-clipped text. Emphasis comes from weight or size, not a background-clip gradient on the text itself.',
    test(text) {
      const css = matchesOf(text, /-?webkit-background-clip\s*:\s*text|background-clip\s*:\s*text/i);
      const tw = matchesOf(text, /\bbg-clip-text\b/);
      return [...css, ...tw];
    },
  },
  {
    id: 'purple-blue-gradient',
    severity: 'P1',
    category: 'color',
    extensions: STYLE_EXTENSIONS,
    message: 'Purple-to-blue gradient — the single most recognizable "AI made this" tell. Pick one intentional accent instead.',
    test(text) {
      const out = [];
      for (const m of matchesOf(text, /linear-gradient\([^)]*\)/gi)) {
        if (/purple|violet|indigo/i.test(m.snippet) && /blue|cyan|sky/i.test(m.snippet)) out.push(m);
      }
      for (const m of matchesOf(text, /\bbg-gradient-to-\w+\b[^"'`\n]{0,80}/gi)) {
        if (/\b(purple|violet|indigo)-\d{2,3}\b/.test(m.snippet) && /\b(blue|cyan|sky)-\d{2,3}\b/.test(m.snippet)) out.push(m);
      }
      return out;
    },
  },
  {
    id: 'side-stripe-border',
    severity: 'P2',
    category: 'layout',
    extensions: STYLE_EXTENSIONS,
    message: 'A colored border-left/border-right above 1px on a card, list item, callout, or alert. This is the lazy default, not a depth system.',
    test(text) {
      const css = matchesOf(text, /border-(left|right)\s*:\s*([2-9]|\d{2,})px\s+(solid|dashed|dotted)[^;]*/i);
      const tw = matchesOf(text, /\bborder-[lr]-(2|3|4|8)\b/);
      return [...css, ...tw];
    },
  },
  {
    id: 'hero-eyebrow-kicker',
    severity: 'P1',
    category: 'typography',
    extensions: MARKUP_EXTENSIONS.concat(['.css', '.scss', '.less']),
    message: 'A kicker/eyebrow above a heading. This is a full ban — no brief earns it back. Delete the label and let the heading carry its own weight.',
    test(text) {
      return matchesOf(text, /\b(class|className|id)\s*=\s*["'`][^"'`]*\b(eyebrow|kicker|overline|pretitle|pre-heading)\b[^"'`]*["'`]/i);
    },
  },
  {
    id: 'bounce-elastic-easing',
    severity: 'P2',
    category: 'motion',
    extensions: STYLE_EXTENSIONS,
    message: 'Bounce/elastic easing feels dated. Use an exponential ease-out instead.',
    test(text) {
      const named = matchesOf(text, /\b(easeOutBounce|easeInBounce|easeInOutBounce|easeOutElastic|easeInElastic)\b/);
      const tw = matchesOf(text, /\bease-bounce\b/);
      const type = matchesOf(text, /type\s*:\s*["']spring["']/);
      return [...named, ...tw, ...type];
    },
  },
  {
    id: 'pure-black-or-white-text',
    severity: 'P2',
    category: 'color',
    extensions: STYLE_EXTENSIONS,
    message: 'Pure black/white text. Always tint from the palette instead of #000/#fff.',
    test(text) {
      return matchesOf(text, /\bcolor\s*:\s*(#000(000)?\b|#fff(fff)?\b|black\b|white\b|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/i);
    },
  },
  {
    id: 'generic-font-stack-only',
    severity: 'P2',
    category: 'typography',
    extensions: STYLE_EXTENSIONS,
    message: 'Font stack is entirely generic/system fonts with no distinctive typeface. Every model trained on the same handful of defaults — this is the tell.',
    test(text) {
      const out = [];
      for (const m of matchesOf(text, /font-family\s*:\s*([^;{}\n]+);?/gi)) {
        const raw = text.slice(m.index, m.index + m.snippet.length);
        const value = raw.replace(/^font-family\s*:\s*/i, '').replace(/;$/, '');
        const tokens = value.split(',').map(t => t.trim().replace(/^["']|["']$/g, '').toLowerCase()).filter(Boolean);
        if (tokens.length > 0 && tokens.every(t => GENERIC_FONT_TOKENS.has(t))) out.push(m);
      }
      return out;
    },
  },
  {
    id: 'pre-disabled-submit',
    severity: 'P1',
    category: 'ux',
    extensions: MARKUP_EXTENSIONS,
    message: 'Submit disabled until all fields are valid. This hides which fields are required and prevents error discovery — allow submission, surface validation on attempt.',
    test(text) {
      const conditional = matchesOf(text, /disabled\s*=\s*\{[^}]*!\s*\w*(valid|complete|filled|dirty)/i);
      const hardcoded = matchesOf(text, /<button[^>]*type\s*=\s*["']submit["'][^>]*\bdisabled\b/i);
      return [...conditional, ...hardcoded];
    },
  },
  {
    id: 'missing-alt-text',
    severity: 'P1',
    category: 'accessibility',
    extensions: MARKUP_EXTENSIONS,
    message: 'An <img> with no alt attribute. Every content image needs a descriptive alt, even alt="" must be a deliberate decorative choice.',
    test(text) {
      const out = [];
      for (const m of matchesOf(text, /<img\b[^>]*>/gi)) {
        if (!/\balt\s*=/.test(m.snippet)) out.push(m);
      }
      return out;
    },
  },
  {
    id: 'outline-none-without-focus-visible',
    severity: 'P1',
    category: 'accessibility',
    extensions: STYLE_EXTENSIONS,
    message: 'outline: none/0 removes the default focus ring. Verify a themed :focus-visible replacement exists nearby — if not, keyboard users lose focus indication entirely.',
    test(text) {
      const out = [];
      for (const m of matchesOf(text, /outline\s*:\s*(none|0)\b/i)) {
        const window = text.slice(Math.max(0, m.index - 400), m.index + 400);
        if (!/:focus-visible/.test(window)) out.push(m);
      }
      return out;
    },
  },
  {
    id: 'marquee-or-blink',
    severity: 'P2',
    category: 'motion',
    extensions: MARKUP_EXTENSIONS.concat(['.css', '.scss', '.less']),
    message: 'A <marquee>/<blink> element or text-decoration: blink. Dated and a known accessibility hazard for motion/vestibular sensitivity.',
    test(text) {
      const tags = matchesOf(text, /<(marquee|blink)\b/i);
      const css = matchesOf(text, /text-decoration\s*:\s*[^;]*\bblink\b/i);
      return [...tags, ...css];
    },
  },
  {
    id: 'nested-card-selector',
    severity: 'P2',
    category: 'layout',
    extensions: ['.css', '.scss', '.less', '.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro'],
    message: 'A .card selector nested inside another .card. Cards are the lazy container; nested cards are always wrong.',
    test(text) {
      return matchesOf(text, /\.card[^{},]*\.card\b|\.card\s*>\s*\.card\b/i);
    },
  },
  {
    id: 'numbered-section-label',
    severity: 'P3',
    category: 'typography',
    extensions: MARKUP_EXTENSIONS,
    message: 'Decorative section numbering (01 / 02 / 03) unless the sequence itself carries information the reader needs.',
    test(text) {
      return matchesOf(text, /\b(class|className)\s*=\s*["'`][^"'`]*\b(section-number|sec-num|step-number)\b[^"'`]*["'`]/i);
    },
  },
  {
    id: 'em-dash-overuse',
    severity: 'P3',
    category: 'copy',
    extensions: MARKUP_EXTENSIONS.concat(['.md']),
    message: 'Em dash in UI copy. House style is a hyphen with spaces ( - ), not an em dash (—).',
    test(text) {
      return matchesOf(text, /—/g);
    },
  },
];

export function rulesFor(extension) {
  return RULES.filter(r => r.extensions.includes(extension));
}

export function ruleById(id) {
  return RULES.find(r => r.id === id);
}

export { lineOf, CODE_EXTENSIONS };
