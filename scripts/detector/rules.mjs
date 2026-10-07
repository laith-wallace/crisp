/**
 * scripts/detector/rules.mjs
 *
 * The CRISP detector's rule registry. Each rule is a pure text scan over one
 * file's source: no DOM, no browser, no build step. That keeps false-positive
 * risk low and the tool runnable in CI, a pre-commit hook, or a Claude Code
 * hook with zero dependencies beyond Node itself.
 *
 * This is v2: 43 rules. The 14 v1 rules are kept; v2 adds 14 more Slop
 * Check tells from skills/_shared/slop-tells.md that are regex-detectable
 * with low noise (glow halos, blur blobs, hero pills, icon tiles, template
 * copy, aphoristic cadence, cream + generic sans, grid and stripe textures,
 * hairline-plus-wide-shadow, hover zoom, pulsing dots, logo marquees, emoji
 * icons) and 15 craft and accessibility checks a text scan can prove (tiny
 * text, disabled zoom, positive tabindex, clickable divs, unlabeled icon
 * buttons, placeholder-only inputs, unmuted autoplay, transition: all,
 * missing reduced-motion, heading skips, lorem ipsum, dead hrefs, z-index
 * arms races, hex color/background pairs under WCAG 4.5:1, tight paragraph
 * leading). numbered-section-label also counts 3+ ">01<" style text nodes.
 *
 * Tells that need rendered layout or real judgement (hero metric template,
 * identical card grids rendered from a .map(), glassmorphism as a default,
 * the saturated editorial lane, color-only error states) stay LLM-judgement
 * territory - documented in crisp-audit.md's AI Slop Check table, not here.
 * Don't add a rule here unless its false-positive rate is low enough to
 * surface automatically without a human gate. Prose rules (template copy,
 * aphoristic cadence) only read markup text nodes, never class names or code.
 *
 * Each rule: { id, severity, category, message, extensions, test(text) }
 * `test` returns an array of { index, snippet } matches; the engine turns
 * `index` into a line number and applies ignores. Every rule has a positive
 * and a negative case in tests/unit/detector-rules.test.mjs.
 */

const CODE_EXTENSIONS = ['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro'];
const STYLE_EXTENSIONS = ['.html', '.htm', '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro'];
const MARKUP_EXTENSIONS = ['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro'];
const CSS_ONLY = ['.css', '.scss', '.less'];
const SCRIPT_AND_MARKUP = ['.html', '.htm', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.astro'];
const STYLESHEET_HOSTS = ['.css', '.scss', '.less', '.html', '.htm', '.vue', '.svelte', '.astro'];

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

function hit(index, snippet) {
  return { index, snippet: String(snippet).replace(/\s+/g, ' ').trim().slice(0, 120) };
}

const GENERIC_FONT_TOKENS = new Set([
  'arial', 'inter', 'system-ui', '-apple-system', 'blinkmacsystemfont',
  'segoe ui', 'helvetica', 'helvetica neue', 'sans-serif', 'roboto', 'tahoma', 'verdana',
]);

function genericFontStacks(text) {
  const out = [];
  for (const m of matchesOf(text, /font-family\s*:\s*([^;{}\n]+);?/gi)) {
    const raw = text.slice(m.index, m.index + m.snippet.length);
    const value = raw.replace(/^font-family\s*:\s*/i, '').replace(/;$/, '');
    const tokens = value.split(',').map(t => t.trim().replace(/^["']|["']$/g, '').toLowerCase()).filter(Boolean);
    if (tokens.length > 0 && tokens.every(t => GENERIC_FONT_TOKENS.has(t))) out.push(m);
  }
  return out;
}

/* ---------- shared scanners ---------- */

/** Replace <script> and <style> bodies with spaces so text-node scans skip them (indices preserved). */
function blankScriptAndStyle(text) {
  return text.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, m => m.replace(/[^\n]/g, ' '));
}

/** Markup text nodes: the text between a `>` and the next `<`. Never class names or attribute values. */
function textNodes(text) {
  const src = blankScriptAndStyle(text);
  const out = [];
  const re = />([^<>]+)</g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (/\S/.test(m[1])) out.push({ index: m.index + 1, text: m[1] });
    re.lastIndex = m.index + 1 + m[1].length;
  }
  return out;
}

/** class / className / :class string values. */
function classLists(text) {
  const out = [];
  const re = /(?<![\w-])(?::class|class|className)\s*=\s*\{?\s*(["'`])([\s\S]*?)\1/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ index: m.index, value: m[2] });
  }
  return out;
}

/**
 * Opening tags whose name matches `names` (a regex alternation source).
 * Scans to the closing `>` while respecting quotes and JSX braces, so
 * `onClick={() => x}` does not end the tag early.
 */
function tagsOf(text, names, flags = 'g') {
  const out = [];
  const re = new RegExp(`<(${names})(?=[\\s/>])`, flags.includes('g') ? flags : flags + 'g');
  let m;
  while ((m = re.exec(text)) !== null) {
    let depth = 0;
    let quote = null;
    let end = -1;
    const limit = Math.min(text.length, m.index + 4000);
    for (let i = m.index + m[0].length; i < limit; i++) {
      const c = text[i];
      if (quote) {
        if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') quote = c;
      else if (c === '{') depth++;
      else if (c === '}') depth = Math.max(0, depth - 1);
      else if (c === '>' && depth === 0) { end = i + 1; break; }
    }
    if (end === -1) continue;
    out.push({ index: m.index, name: m[1], tag: text.slice(m.index, end), end });
  }
  return out;
}

function attrValue(tag, name) {
  const m = tag.match(new RegExp(`(?<![\\w-])${name}\\s*=\\s*(?:\\{\\s*)?(["'\`])([\\s\\S]*?)\\1`, 'i'));
  return m ? m[2] : null;
}

function hasAttr(tag, name) {
  return new RegExp(`(?<![\\w:-])${name}(?=[\\s=/>])`, 'i').test(tag);
}

/** CSS rule bodies or JS object literals without nested braces. */
function braceBlocks(text) {
  const out = [];
  const re = /\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push({ index: m.index, body: m[1] });
  return out;
}

function styleAttrs(text) {
  const out = [];
  const re = /(?<![\w-])style\s*=\s*(["'])([\s\S]*?)\1/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push({ index: m.index, body: m[2] });
  return out;
}

/* ---------- color helpers ---------- */

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance([r, g, b]) {
  const ch = v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const CHROMATIC_NAMES = /\b(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|magenta|pink|rose|gold|coral|turquoise|aqua)\b/i;

/** True when a CSS color string is a saturated color, not black, white or gray. */
function isChromatic(str) {
  const rgb = str.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (rgb) {
    const v = rgb.slice(1, 4).map(Number);
    return Math.max(...v) - Math.min(...v) > 40;
  }
  const hsl = str.match(/hsla?\(\s*[\d.]+(?:deg)?[\s,]+([\d.]+)%/i);
  if (hsl) return Number(hsl[1]) > 25;
  const hex = str.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
  if (hex) {
    const v = hexToRgb(hex[1]);
    return v ? Math.max(...v) - Math.min(...v) > 40 : false;
  }
  return CHROMATIC_NAMES.test(str);
}

/** Alpha of an rgba()/hsla()/`/ a` color, or 1 when none is present. */
function alphaOf(str) {
  const slash = str.match(/\/\s*([\d.]+)(%)?\s*\)/);
  if (slash) return slash[2] ? Number(slash[1]) / 100 : Number(slash[1]);
  const four = str.match(/(?:rgba|hsla)\([^,)]+,[^,)]+,[^,)]+,\s*([\d.]+)\s*\)/i);
  if (four) return Number(four[1]);
  return 1;
}

/** Split a CSS value on top-level commas. */
function splitTopLevel(value) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const c of value) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

/* ---------- rules ---------- */

const PROSE_COPY = /\b(supercharge[sd]?|world-class|best-in-class|cutting-edge|game-?changers?|game-changing|revolutioni[sz](?:e|es|ed|ing)|unlock the power|seamless(?:ly)?|effortless(?:ly)?|next-generation|elevate your|empower(?:s|ed|ing)?)\b/gi;

const APOS = "(?:'|\u2019|&apos;|&#39;|&rsquo;)";

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
    message: 'Purple-to-blue gradient - the single most recognizable "AI made this" tell. Pick one intentional accent instead.',
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
    extensions: MARKUP_EXTENSIONS.concat(CSS_ONLY),
    message: 'A kicker/eyebrow above a heading. This is a full ban - no brief earns it back. Delete the label and let the heading carry its own weight.',
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
      return matchesOf(text, /(?<![\w-])color\s*:\s*(#000(000)?\b|#fff(fff)?\b|black\b|white\b|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/i);
    },
  },
  {
    id: 'generic-font-stack-only',
    severity: 'P2',
    category: 'typography',
    extensions: STYLE_EXTENSIONS,
    message: 'Font stack is entirely generic/system fonts with no distinctive typeface. Every model trained on the same handful of defaults - this is the tell.',
    test(text) {
      return genericFontStacks(text);
    },
  },
  {
    id: 'pre-disabled-submit',
    severity: 'P1',
    category: 'ux',
    extensions: MARKUP_EXTENSIONS,
    message: 'Submit disabled until all fields are valid. This hides which fields are required and prevents error discovery - allow submission, surface validation on attempt.',
    test(text) {
      const conditional = matchesOf(text, /disabled\s*=\s*\{[^}]*!\s*\w*(valid|complete|filled|dirty)/i);
      const hardcoded = matchesOf(text, /<button[^>]*type\s*=\s*["']submit["'][^>]*(?<![\w-])disabled(?:\s*=\s*["'](?:disabled|true)?["']|\s*=\s*\{\s*true\s*\})?(?=[\s/>])/i);
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
    message: 'outline: none/0 removes the default focus ring. Verify a themed :focus-visible replacement exists nearby - if not, keyboard users lose focus indication entirely.',
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
    extensions: MARKUP_EXTENSIONS.concat(CSS_ONLY),
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
      return matchesOf(text, /\.card(?![\w-])[^{},]*\.card(?![\w-])|\.card\s*>\s*\.card(?![\w-])/i);
    },
  },
  {
    id: 'numbered-section-label',
    severity: 'P3',
    category: 'typography',
    extensions: MARKUP_EXTENSIONS,
    message: 'Decorative section numbering (01 / 02 / 03) unless the sequence itself carries information the reader needs.',
    test(text) {
      const out = matchesOf(text, /\b(class|className)\s*=\s*["'`][^"'`]*\b(section-number|sec-num|step-number)\b[^"'`]*["'`]/i);
      const numbered = textNodes(text).filter(n => /^\s*0[1-9]\s*[.)]?\s*$/.test(n.text));
      const distinct = new Set(numbered.map(n => n.text.trim().replace(/[.)]$/, '')));
      if (distinct.size >= 3) {
        out.push(hit(numbered[0].index, `${distinct.size} zero-padded number labels (${[...distinct].slice(0, 4).join(', ')})`));
      }
      return out;
    },
  },
  {
    id: 'em-dash-overuse',
    severity: 'P3',
    category: 'copy',
    extensions: MARKUP_EXTENSIONS.concat(['.md']),
    message: 'Em dash in UI copy. House style is a hyphen with spaces ( - ), not an em dash (U+2014).',
    test(text) {
      return matchesOf(text, /\u2014/g);
    },
  },

  /* ---------- Slop Check tells (v2) ---------- */

  {
    id: 'glow-halo',
    severity: 'P2',
    category: 'color',
    extensions: STYLE_EXTENSIONS,
    message: 'Colored glow halo (large zero-offset colored shadow). Glow behind a hero or button is a Slop Check tell - show importance through hierarchy, not light bleed.',
    test(text) {
      const out = [];
      for (const m of matchesOf(text, /(?:box-shadow|boxShadow)\s*:\s*['"]?([^;{}'"\n]+)/gi)) {
        const value = m.snippet.replace(/^(?:box-shadow|boxShadow)\s*:\s*['"]?/i, '');
        const glow = splitTopLevel(value).some(part => {
          const g = part.trim().match(/^0(?:px)?\s+0(?:px)?\s+(\d+)px/);
          return g && Number(g[1]) >= 40 && isChromatic(part);
        });
        if (glow) out.push(m);
      }
      for (const m of matchesOf(text, /(?<![\w-])shadow-\[([^\]\s'"`]+)\]/g)) {
        const value = m.snippet.slice(8, -1).replace(/_/g, ' ');
        const g = value.match(/^0(?:px)?\s+0(?:px)?\s+(\d+)px/);
        if (g && Number(g[1]) >= 40 && isChromatic(value)) out.push(m);
      }
      for (const m of matchesOf(text, /(?<![\w-])shadow-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?:\/(\d+))?(?![\w-])/g)) {
        const op = m.snippet.match(/\/(\d+)$/);
        if (!op || Number(op[1]) >= 25) out.push(m);
      }
      return out;
    },
  },
  {
    id: 'decorative-blur-blob',
    severity: 'P2',
    category: 'color',
    extensions: STYLE_EXTENSIONS,
    message: 'Decorative blurred color blob (absolute, rounded-full, heavy blur). A soft spotlight behind a section is a Slop Check tell - delete it or make the color decision structural.',
    test(text) {
      const out = [];
      for (const c of classLists(text)) {
        const v = c.value;
        const blur = v.match(/(?<![\w-])blur-(2xl|3xl|\[(\d+)px\])/);
        if (!blur) continue;
        if (blur[2] && Number(blur[2]) < 40) continue;
        if (/(?<![\w-])(absolute|fixed)(?![\w-])/.test(v) && /(?<![\w-])rounded-full(?![\w-])/.test(v) && /(?<![\w-])(bg|from)-/.test(v)) {
          out.push(hit(c.index, v));
        }
      }
      for (const m of matchesOf(text, /(?<![\w-])filter\s*:\s*blur\(\s*(\d+)px\s*\)/gi)) {
        if (Number(m.snippet.match(/blur\(\s*(\d+)/)[1]) >= 40) out.push(m);
      }
      return out;
    },
  },
  {
    id: 'hero-pill-badge',
    severity: 'P1',
    category: 'typography',
    extensions: MARKUP_EXTENSIONS,
    message: 'Hero pill badge ("New", "Introducing", sparkle emoji) above the headline. Same ban as the eyebrow kicker - delete it and let the headline carry the news.',
    test(text) {
      const out = [];
      for (const t of tagsOf(text, 'span|div|a|p|Badge')) {
        const cls = attrValue(t.tag, 'class(?:Name)?') || '';
        const isPill = (/(?<![\w-])rounded-full(?![\w-])/.test(cls) && /(?<![\w-])(border|bg-|ring-)/.test(cls)) || /(?<![\w-])(pill|announcement-badge|hero-badge)(?![\w-])/i.test(cls) || t.name === 'Badge';
        if (!isPill) continue;
        const after = text.slice(t.end, t.end + 200).replace(/<[^>]*>/g, ' ').replace(/\{\s*["']\s*["']\s*\}/g, ' ').trimStart();
        if (/^(\u2728|\u{1F389}|\u{1F680}|New\b|NEW\b|Introducing\b|Announcing\b|Now in beta\b|Now with\b|Now available\b)/u.test(after)) {
          out.push(hit(t.index, `${t.tag} ${after.slice(0, 40)}`));
        }
      }
      return out;
    },
  },
  {
    id: 'icon-tile-stack',
    severity: 'P2',
    category: 'layout',
    extensions: MARKUP_EXTENSIONS,
    message: 'Three or more icon tiles (tinted rounded square around an icon). An icon tile above every card heading is a Slop Check tell - drop the tiles or let one carry real meaning.',
    test(text) {
      const tiles = classLists(text).filter(({ value: v }) => {
        const size = /(?<![\w-])size-(10|11|12|14)(?![\w-])/.test(v) ||
          ['10', '11', '12', '14'].some(n => new RegExp(`(?<![\\w-])h-${n}(?![\\w-])`).test(v) && new RegExp(`(?<![\\w-])w-${n}(?![\\w-])`).test(v));
        const rounded = /(?<![\w-])rounded-(md|lg|xl|2xl)(?![\w-])/.test(v);
        const tint = /(?<![\w-])bg-[a-z]+-(50|100)(?![\w-])/.test(v) || /(?<![\w-])bg-[\w-]+\/(5|10|15|20)(?![\w-])/.test(v);
        const center = (/(?<![\w-])items-center(?![\w-])/.test(v) && /(?<![\w-])justify-center(?![\w-])/.test(v)) || /(?<![\w-])place-(items|content)-center(?![\w-])/.test(v);
        return size && rounded && tint && center;
      });
      if (tiles.length < 3) return [];
      return [hit(tiles[0].index, `${tiles.length} icon tiles: ${tiles[0].value}`)];
    },
  },
  {
    id: 'template-copy',
    severity: 'P2',
    category: 'copy',
    extensions: MARKUP_EXTENSIONS,
    message: 'Template marketing copy ("supercharge", "seamless", "world-class", "cutting-edge"). Say the specific thing the product does instead.',
    test(text) {
      const out = [];
      for (const n of textNodes(text)) {
        // A one-word label ("Seamless" as a named dimension or tab) is a name, not copy.
        if ((n.text.match(/[A-Za-z]{2,}/g) || []).length < 2) continue;
        const re = new RegExp(PROSE_COPY.source, 'gi');
        let m;
        while ((m = re.exec(n.text)) !== null) out.push(hit(n.index + m.index, n.text.trim()));
      }
      return out;
    },
  },
  {
    id: 'aphoristic-cadence',
    severity: 'P2',
    category: 'copy',
    extensions: MARKUP_EXTENSIONS,
    message: 'Aphoristic cadence ("Not X. Y.", "No X. No Y.", "It\'s not X, it\'s Y"). The set-up-and-reveal rhythm reads as generated - state the claim plainly.',
    test(text) {
      const patterns = [
        /(?<=(?:^|[.!?])\s*)Not (?:a |an |the |just |another )?[A-Za-z][\w' -]{0,30}\.\s+[A-Z][\w']*(?: [\w']+){0,6}\./g,
        /(?<=(?:^|[.!?])\s*)No [A-Za-z][\w' -]{0,25}\.\s+No [A-Za-z][\w' -]{0,25}\./g,
        new RegExp(`\\bIt${APOS}?s not [^.,;!?]{1,40}(?:,|;| -|\u2014)\\s*it${APOS}?s [^.!?<]{1,40}`, 'gi'),
      ];
      const out = [];
      for (const n of textNodes(text)) {
        for (const p of patterns) {
          const re = new RegExp(p.source, p.flags);
          let m;
          while ((m = re.exec(n.text)) !== null) out.push(hit(n.index + m.index, m[0]));
        }
      }
      return out;
    },
  },
  {
    id: 'cream-generic-sans',
    severity: 'P2',
    category: 'color',
    extensions: STYLE_EXTENSIONS,
    message: 'Cream off-white background paired with Inter or a generic system stack. The SaaS-cream-plus-generic-sans default is a Slop Check tell - make a real color and type decision.',
    test(text) {
      const usesGenericSans = genericFontStacks(text).length > 0 ||
        /font-family\s*:[^;{}]*["']?\bInter\b/i.test(text) || /\bInter\s*\(/.test(text) || /family=Inter\b/.test(text);
      if (!usesGenericSans) return [];
      const re = /(?:(?<![\w-])(?:background(?:-color)?|backgroundColor)\s*:\s*['"]?|--[\w-]*(?:bg|background|surface|cream|paper|canvas)[\w-]*\s*:\s*|(?<![\w-])bg-\[)(#[0-9a-f]{6}|#[0-9a-f]{3})(?![0-9a-f])/gi;
      let m;
      while ((m = re.exec(text)) !== null) {
        const rgb = hexToRgb(m[1]);
        if (!rgb) continue;
        const [r, g, b] = rgb;
        if (r >= 240 && r >= g && g >= b && r - b >= 5 && r - b <= 45) return [hit(m.index, m[0])];
      }
      return [];
    },
  },
  {
    id: 'grid-pattern-background',
    severity: 'P2',
    category: 'layout',
    extensions: STYLE_EXTENSIONS,
    message: 'Grid or dot pattern background (paired 1px gradients or a radial dot grid). Decorative graph-paper texture is a template default, not a brand decision.',
    test(text) {
      const out = [];
      // Two 1px linear gradients in one background declaration (CSS or JS string).
      for (const m of matchesOf(text, /background(?:-image)?\s*:[^;{}]*linear-gradient\([^;{}]*1px[^;{}]*linear-gradient\([^;{}]*1px[^;{}]*/gi)) out.push(m);
      // Radial dot grid: radial-gradient in a background declaration with background-size in the same block.
      for (const b of braceBlocks(text)) {
        if (/background(?:-image)?\s*:[^;]*radial-gradient\([^;]*1px/i.test(b.body) && /background-size\s*:/i.test(b.body)) {
          out.push(hit(b.index, b.body));
        }
      }
      // Tailwind arbitrary gradients.
      for (const c of classLists(text)) {
        const v = c.value;
        if (/bg-\[linear-gradient\(to_(?:right|bottom)[^\]]*1px/.test(v) ||
          (/bg-\[radial-gradient\(/.test(v) && /(?:bg-\[size:|\[background-size:|bg-size-)/.test(v))) {
          out.push(hit(c.index, v));
        }
      }
      return out;
    },
  },
  {
    id: 'repeating-stripes-gradient',
    severity: 'P3',
    category: 'color',
    extensions: STYLE_EXTENSIONS,
    message: 'repeating-linear-gradient stripes as decoration. Diagonal stripe texture is a template default unless it encodes a real state (disabled, pending).',
    test(text) {
      return matchesOf(text, /repeating-linear-gradient\(/gi);
    },
  },
  {
    id: 'thin-border-wide-shadow',
    severity: 'P3',
    category: 'layout',
    extensions: STYLE_EXTENSIONS,
    message: 'Near-transparent hairline border plus a wide soft shadow on the same element. The floating-glass-card default - pick one elevation cue that matches the depth system.',
    test(text) {
      const out = [];
      for (const c of classLists(text)) {
        const v = c.value;
        const faint = /(?<![\w-])border-(?:white|black|[a-z]+-\d{2,3})\/(?:5|10|\[0?\.0\d\]|\[0?\.1\])(?![\w-])/.test(v);
        const wide = /(?<![\w-])shadow-(?:xl|2xl)(?![\w-])/.test(v) ||
          /(?<![\w-])shadow-\[[^\]]*?_(\d+)px_/.test(v) && Number(v.match(/(?<![\w-])shadow-\[[^\]]*?_(\d+)px_/)[1]) >= 24;
        if (faint && wide) out.push(hit(c.index, v));
      }
      for (const b of braceBlocks(text)) {
        const border = b.body.match(/border(?:-\w+)?\s*:\s*['"]?1px\s+solid\s+((?:rgba|hsla|rgb|hsl)\([^)]*\))/i);
        if (!border || alphaOf(border[1]) > 0.1) continue;
        const shadow = b.body.match(/(?:box-shadow|boxShadow)\s*:\s*([^;}]+)/i);
        if (!shadow) continue;
        const px = [...shadow[1].matchAll(/(\d+)px/g)].map(x => Number(x[1]));
        if (px.some(n => n >= 24)) out.push(hit(b.index, b.body));
      }
      return out;
    },
  },
  {
    id: 'hover-zoom',
    severity: 'P3',
    category: 'motion',
    extensions: STYLE_EXTENSIONS,
    message: 'Hover zoom (scale 1.03 or more) on a card or image. Decorative motion with no state change is a Slop Check tell - use a color or border shift instead.',
    test(text) {
      const out = [];
      out.push(...matchesOf(text, /(?<![\w-])(?:group-)?hover:scale-(?:10[5-9]|1[1-9]\d)(?![\w-])/g));
      for (const m of matchesOf(text, /(?<![\w-])(?:group-)?hover:scale-\[(\d*\.?\d+)\]/g)) {
        if (Number(m.snippet.match(/\[(\d*\.?\d+)\]/)[1]) >= 1.03) out.push(m);
      }
      const hoverRe = /:hover[^{};]*\{([^{}]*)\}/g;
      let h;
      while ((h = hoverRe.exec(text)) !== null) {
        const sc = h[1].match(/scale(?:\(\s*|\s*:\s*)(\d*\.?\d+)/);
        if (sc && Number(sc[1]) >= 1.03) out.push(hit(h.index, h[0]));
      }
      for (const m of matchesOf(text, /whileHover\s*=\s*\{\{[^}]*scale\s*:\s*(\d*\.?\d+)/g)) {
        if (Number(m.snippet.match(/scale\s*:\s*(\d*\.?\d+)/)[1]) >= 1.03) out.push(m);
      }
      return out;
    },
  },
  {
    id: 'pulsing-dot',
    severity: 'P3',
    category: 'motion',
    extensions: MARKUP_EXTENSIONS,
    message: 'Pulsing status dot (animate-ping/animate-pulse on a small rounded-full dot). Decorative "live" motion is a Slop Check tell unless it reflects a real live state.',
    test(text) {
      const out = [];
      for (const c of classLists(text)) {
        const v = c.value;
        if (!/(?<![\w-])animate-(ping|pulse)(?![\w-])/.test(v)) continue;
        if (!/(?<![\w-])rounded-full(?![\w-])/.test(v)) continue;
        const small = /(?<![\w-])size-(1\.5|2|2\.5|3)(?![\w-])/.test(v) || /(?<![\w-])h-(1\.5|2|2\.5|3)(?![\w-])/.test(v);
        if (small) out.push(hit(c.index, v));
      }
      return out;
    },
  },
  {
    id: 'logo-marquee',
    severity: 'P3',
    category: 'motion',
    extensions: STYLE_EXTENSIONS,
    message: 'Auto-scrolling logo strip (marquee/infinite-scroll animation). Moving social proof is a Slop Check tell and a motion hazard - show a static row.',
    test(text) {
      const tw = matchesOf(text, /(?<![\w-])animate-(?:marquee|scroll|infinite-scroll|logo-scroll|scroll-x)(?![\w-])/g);
      const kf = matchesOf(text, /@keyframes\s+(?:marquee|scroll-x|infinite-scroll|logo[\w-]*)(?![\w-])/gi);
      return [...tw, ...kf];
    },
  },
  {
    id: 'emoji-heading-icon',
    severity: 'P2',
    category: 'typography',
    extensions: MARKUP_EXTENSIONS,
    message: 'Emoji used as the icon at the start of a heading or button. Emoji-as-iconography is a Slop Check tell - use a real icon set or none.',
    test(text) {
      const out = [];
      for (const t of tagsOf(text, 'h[1-6]|button', 'gi')) {
        const after = text.slice(t.end, t.end + 120).replace(/^(?:\s|<[^>]*>|\{\s*["']\s*["']\s*\})*/, '');
        if (/^(?:[\u{1F300}-\u{1FAFF}]|[\u2600-\u2712\u2719-\u27BF]|\u2B50|\u2B55)/u.test(after)) {
          out.push(hit(t.index, `${t.tag}${after.slice(0, 30)}`));
        }
      }
      return out;
    },
  },

  /* ---------- quality and accessibility (v2) ---------- */

  {
    id: 'tiny-text',
    severity: 'P2',
    category: 'typography',
    extensions: STYLE_EXTENSIONS,
    message: 'Font size below 12px. Text this small fails legibility for most readers - 12px is the floor, 14px+ for body.',
    test(text) {
      const out = [];
      for (const m of matchesOf(text, /font-size\s*:\s*(\d*\.?\d+)(px|rem)\b/gi)) {
        const [, n, unit] = m.snippet.match(/(\d*\.?\d+)(px|rem)/i);
        const px = unit.toLowerCase() === 'rem' ? Number(n) * 16 : Number(n);
        if (px > 0 && px < 12) out.push(m);
      }
      for (const m of matchesOf(text, /(?<![\w-])text-\[(\d*\.?\d+)px\]/g)) {
        const px = Number(m.snippet.match(/\[(\d*\.?\d+)px/)[1]);
        if (px > 0 && px < 12) out.push(m);
      }
      for (const m of matchesOf(text, /\bfontSize\s*:\s*['"]?(\d*\.?\d+)(?:px)?['"]?(?=[\s,}])/g)) {
        const px = Number(m.snippet.match(/(\d*\.?\d+)/)[1]);
        if (px > 0 && px < 12) out.push(m);
      }
      return out;
    },
  },
  {
    id: 'viewport-zoom-disabled',
    severity: 'P1',
    category: 'accessibility',
    extensions: SCRIPT_AND_MARKUP,
    message: 'Viewport disables pinch zoom (user-scalable=no or maximum-scale=1). Low-vision users need to zoom - remove the restriction (WCAG 1.4.4).',
    test(text) {
      const out = [];
      for (const m of matchesOf(text, /<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*>/gi)) {
        if (/user-scalable\s*=\s*(no|0)\b|maximum-scale\s*=\s*1(?:\.0+)?(?![\d.])/i.test(m.snippet)) out.push(m);
      }
      out.push(...matchesOf(text, /\buserScalable\s*:\s*false\b|\bmaximumScale\s*:\s*1(?![\d.])/g));
      return out;
    },
  },
  {
    id: 'positive-tabindex',
    severity: 'P1',
    category: 'accessibility',
    extensions: MARKUP_EXTENSIONS,
    message: 'tabindex greater than 0. Positive tabindex hijacks the natural focus order - use 0 or -1 and fix the DOM order instead.',
    test(text) {
      return matchesOf(text, /(?<![\w-])tabindex\s*=\s*(?:["']|\{\s*["']?)\s*[1-9]\d*\b/gi);
    },
  },
  {
    id: 'clickable-div',
    severity: 'P1',
    category: 'accessibility',
    extensions: MARKUP_EXTENSIONS,
    message: 'A <div> or <span> with a click handler and no role. Keyboard and screen-reader users cannot reach it - use a <button> or <a>.',
    test(text) {
      const out = [];
      for (const t of tagsOf(text, 'div|span')) {
        if (/(?<![\w-])(?:onClick|@click|on:click|v-on:click)\s*=/.test(t.tag) && !hasAttr(t.tag, 'role')) out.push(hit(t.index, t.tag));
      }
      return out;
    },
  },
  {
    id: 'icon-button-no-label',
    severity: 'P1',
    category: 'accessibility',
    extensions: MARKUP_EXTENSIONS,
    message: 'Icon-only button with no accessible name. Add aria-label, aria-labelledby, or visually hidden text so screen readers announce what it does.',
    test(text) {
      const out = [];
      for (const t of tagsOf(text, 'button|Button')) {
        if (t.tag.endsWith('/>')) continue;
        if (/(?<![\w-])(aria-label|aria-labelledby|title)\s*=/.test(t.tag) || /\{\s*\.\.\./.test(t.tag)) continue;
        const close = text.indexOf(`</${t.name}>`, t.end);
        if (close === -1 || close - t.end > 3000) continue;
        const inner = text.slice(t.end, close);
        const stripped = inner
          .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
          .replace(/<[A-Z][\w.]*\b[^<>]*\/>/g, '')
          .replace(/<i\b[^>]*>\s*<\/i>/gi, '');
        if (stripped === inner) continue; // no icon in it
        if (stripped.replace(/<[^>]*>/g, '').trim() === '') out.push(hit(t.index, t.tag + inner.trim().slice(0, 40)));
      }
      return out;
    },
  },
  {
    id: 'placeholder-as-label',
    severity: 'P2',
    category: 'accessibility',
    extensions: MARKUP_EXTENSIONS,
    message: 'An <input> with a placeholder but no label hook (no id for <label for>, aria-label, or aria-labelledby). Placeholder text vanishes on typing and is not a label.',
    test(text) {
      const out = [];
      for (const t of tagsOf(text, 'input')) {
        if (!hasAttr(t.tag, 'placeholder')) continue;
        if (/(?<![\w-])(aria-label|aria-labelledby|id)\s*=/.test(t.tag) || /\{\s*\.\.\./.test(t.tag)) continue;
        if (/type\s*=\s*["'](hidden|submit|button|checkbox|radio)["']/i.test(t.tag)) continue;
        const before = text.slice(0, t.index);
        if (before.lastIndexOf('<label') > before.lastIndexOf('</label')) continue; // wrapped in a <label>
        out.push(hit(t.index, t.tag));
      }
      return out;
    },
  },
  {
    id: 'autoplay-unmuted-video',
    severity: 'P2',
    category: 'accessibility',
    extensions: MARKUP_EXTENSIONS,
    message: 'A <video> that autoplays without muted. Browsers block it and users get sound they did not ask for - add muted and visible controls.',
    test(text) {
      const out = [];
      for (const t of tagsOf(text, 'video')) {
        if (hasAttr(t.tag, 'autoplay') && !hasAttr(t.tag, 'muted')) out.push(hit(t.index, t.tag));
      }
      return out;
    },
  },
  {
    id: 'transition-all',
    severity: 'P3',
    category: 'motion',
    extensions: STYLE_EXTENSIONS,
    message: 'transition: all animates every property, including layout ones. Name the properties you mean (transform, opacity, color).',
    test(text) {
      const css = matchesOf(text, /transition(?:-property)?\s*:\s*(?:[^;{}"'\n]*,\s*)?all\b[^;{}"'\n]*/gi);
      const tw = matchesOf(text, /(?<![\w-])transition-all(?![\w-])/g);
      return [...css, ...tw];
    },
  },
  {
    id: 'missing-reduced-motion',
    severity: 'P2',
    category: 'motion',
    extensions: STYLESHEET_HOSTS,
    message: 'Animations defined with no prefers-reduced-motion query anywhere in the file. Add a reduced-motion override so vestibular-sensitive users can opt out.',
    test(text) {
      if (/prefers-reduced-motion/i.test(text)) return [];
      const kf = text.search(/@keyframes\b/i);
      if (kf !== -1) return [hit(kf, text.slice(kf, kf + 60).split('{')[0])];
      const anim = /(?<![\w-])animation\s*:\s*(?!none\b)[^;{}]+/i.exec(text);
      return anim ? [hit(anim.index, anim[0])] : [];
    },
  },
  {
    id: 'heading-level-skip',
    severity: 'P2',
    category: 'accessibility',
    extensions: MARKUP_EXTENSIONS,
    message: 'Heading level jumps more than one step (for example h1 then h3). Screen-reader users navigate by heading outline - do not skip levels, restyle instead.',
    test(text) {
      const out = [];
      let prev = 0;
      for (const m of matchesOf(text, /<h([1-6])(?=[\s>])/gi)) {
        const level = Number(m.snippet[2]);
        if (prev && level > prev + 1) out.push(hit(m.index, `h${prev} then h${level}`));
        prev = level;
      }
      return out;
    },
  },
  {
    id: 'lorem-ipsum',
    severity: 'P1',
    category: 'copy',
    extensions: SCRIPT_AND_MARKUP,
    message: 'Lorem ipsum placeholder text. Real copy shapes the layout - placeholder text ships bugs in hierarchy and length.',
    test(text) {
      return matchesOf(text, /\blorem ipsum\b|\bdolor sit amet\b/gi);
    },
  },
  {
    id: 'dead-href',
    severity: 'P2',
    category: 'ux',
    extensions: MARKUP_EXTENSIONS,
    message: 'A link with href="#" or an empty href. It goes nowhere - use a <button> for actions or give the link a real destination.',
    test(text) {
      const out = [];
      for (const t of tagsOf(text, 'a')) {
        if (/(?<![\w:-])href\s*=\s*(?:\{\s*)?(["'`])#?\1/.test(t.tag)) out.push(hit(t.index, t.tag));
      }
      return out;
    },
  },
  {
    id: 'z-index-arms-race',
    severity: 'P3',
    category: 'layout',
    extensions: STYLE_EXTENSIONS,
    message: 'z-index of 999 or more. Arms-race stacking values hide a missing layering scale - define named z-index tokens.',
    test(text) {
      const out = [];
      for (const m of matchesOf(text, /(?:z-index|zIndex)\s*:\s*['"]?(\d+)|(?<![\w-])z-\[(\d+)\]/g)) {
        const n = Number(m.snippet.match(/(\d+)/)[1]);
        if (n >= 999) out.push(m);
      }
      return out;
    },
  },
  {
    id: 'low-contrast-pair',
    severity: 'P1',
    category: 'accessibility',
    extensions: STYLE_EXTENSIONS,
    message: 'Text color and background hex in the same rule fall below WCAG AA 4.5:1 contrast. Darken the text or lighten the background.',
    test(text) {
      const out = [];
      const blocks = [...braceBlocks(text), ...styleAttrs(text)];
      for (const b of blocks) {
        const fg = b.body.match(/(?<![\w-])color\s*:\s*['"]?(#[0-9a-f]{6}|#[0-9a-f]{3})(?![0-9a-f])/i);
        const bg = b.body.match(/(?<![\w-])(?:background(?:-color)?|backgroundColor)\s*:\s*['"]?(#[0-9a-f]{6}|#[0-9a-f]{3})(?![0-9a-f])/i);
        if (!fg || !bg) continue;
        const a = hexToRgb(fg[1]);
        const c = hexToRgb(bg[1]);
        if (!a || !c) continue;
        const ratio = contrastRatio(a, c);
        if (ratio < 4.5) out.push(hit(b.index, `${fg[1]} on ${bg[1]} = ${ratio.toFixed(2)}:1`));
      }
      return out;
    },
  },
  {
    id: 'paragraph-tight-leading',
    severity: 'P3',
    category: 'typography',
    extensions: MARKUP_EXTENSIONS,
    message: 'Paragraph set with leading-none or leading-tight. Body copy needs 1.5 or more line-height to stay readable.',
    test(text) {
      const out = [];
      for (const t of tagsOf(text, 'p')) {
        const cls = attrValue(t.tag, 'class(?:Name)?') || '';
        if (/(?<![\w-])leading-(none|tight)(?![\w-])/.test(cls)) out.push(hit(t.index, t.tag));
      }
      return out;
    },
  },
];

export function rulesFor(extension) {
  return RULES.filter(r => r.extensions.includes(extension));
}

export function ruleById(id) {
  return RULES.find(r => r.id === id);
}

export { lineOf, CODE_EXTENSIONS, contrastRatio, hexToRgb };
