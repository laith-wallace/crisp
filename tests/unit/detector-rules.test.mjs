/**
 * Unit tests for scripts/detector/rules.mjs.
 * Zero dependencies: node:test + node:assert. Run with `node --test tests/unit/`.
 *
 * Every rule in RULES needs an entry in CASES with at least one positive
 * sample (must produce a finding) and one negative sample (must not).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RULES, ruleById, rulesFor, lineOf, CODE_EXTENSIONS } from '../../scripts/detector/rules.mjs';

const CASES = {
  'gradient-text': {
    pos: ['h1 { background-clip: text; }', '<h1 className="bg-clip-text text-transparent">Hi</h1>'],
    neg: ['h1 { background-clip: padding-box; }', '<h1 className="text-slate-900">Hi</h1>'],
  },
  'purple-blue-gradient': {
    pos: ['.hero { background: linear-gradient(90deg, purple, blue); }', '<div className="bg-gradient-to-r from-indigo-500 to-blue-500">'],
    neg: ['.hero { background: linear-gradient(90deg, #f00, #fa0); }', '<div className="bg-gradient-to-r from-amber-500 to-orange-500">'],
  },
  'side-stripe-border': {
    pos: ['.callout { border-left: 4px solid #e11; }', '<div className="border-l-4 border-red-500">'],
    neg: ['.callout { border-left: 1px solid #e11; }', '<div className="border border-red-500">'],
  },
  'hero-eyebrow-kicker': {
    pos: ['<p class="eyebrow">Product</p>', '<span className="hero-kicker text-sm kicker">x</span>'],
    neg: ['<p class="lead">Product</p>'],
  },
  'bounce-elastic-easing': {
    pos: ['gsap.to(el, { ease: easeOutBounce })', "animate={{ x: 0 }} transition={{ type: 'spring' }}"],
    neg: ['transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);'],
  },
  'pure-black-or-white-text': {
    pos: ['p { color: #000; }', 'p { color: white; }'],
    neg: ['p { color: #1a1a2e; }', 'p { background-color: #fff; }'],
  },
  'generic-font-stack-only': {
    pos: ['body { font-family: Inter, system-ui, sans-serif; }'],
    neg: ['body { font-family: "Fraunces", Georgia, serif; }'],
  },
  'pre-disabled-submit': {
    pos: ['<button type="submit" disabled={!isValid}>Save</button>', '<button type="submit" disabled>Go</button>'],
    neg: ['<button type="submit" disabled={isSubmitting}>Save</button>'],
  },
  'missing-alt-text': {
    pos: ['<img src="a.png">'],
    neg: ['<img src="a.png" alt="Team photo">', '<img src="a.png" alt="">'],
  },
  'outline-none-without-focus-visible': {
    pos: ['button { outline: none; }'],
    neg: ['button { outline: none; }\nbutton:focus-visible { outline: 2px solid var(--ring); }'],
  },
  'marquee-or-blink': {
    pos: ['<marquee>Sale</marquee>', 'a { text-decoration: blink; }'],
    neg: ['a { text-decoration: underline; }'],
  },
  'nested-card-selector': {
    pos: ['.card .card { padding: 0; }', '.card > .card { margin: 0; }'],
    neg: ['.card .card-title { font-weight: 600; }', '.card, .panel { padding: 8px; }'],
  },
  'numbered-section-label': {
    pos: ['<span class="step-number">1</span>', '<span>01</span><h3>A</h3><span>02</span><h3>B</h3><span>03</span><h3>C</h3>'],
    neg: ['<span>01</span><h3>A</h3><span>02</span><h3>B</h3>', '<p>Call 01 234 567</p>'],
  },
  'em-dash-overuse': {
    pos: ['<p>Fast \u2014 and cheap</p>'],
    neg: ['<p>Fast - and cheap</p>'],
  },

  // Slop Check tells (v2)
  'glow-halo': {
    pos: [
      '.btn { box-shadow: 0 0 60px rgba(168, 85, 247, 0.6); }',
      '<div className="shadow-[0_0_80px_rgba(59,130,246,0.5)]">',
      '<button className="shadow-lg shadow-purple-500/50">Go</button>',
    ],
    neg: [
      '.card { box-shadow: 0 0 60px rgba(0, 0, 0, 0.1); }',
      '.btn { box-shadow: 0 0 12px rgba(168, 85, 247, 0.6); }',
      '<button className="shadow-lg shadow-slate-900/10">Go</button>',
      '<button className="shadow-sm shadow-blue-500/10">Go</button>',
    ],
  },
  'decorative-blur-blob': {
    pos: [
      '<div className="absolute -top-24 left-1/2 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />',
      '.blob { position: absolute; filter: blur(80px); }',
    ],
    neg: [
      '<div className="fixed inset-0 bg-black/40 backdrop-blur-3xl" />',
      '<div className="absolute rounded-full bg-white blur-sm" />',
      '.img { filter: blur(4px); }',
      '.glass { backdrop-filter: blur(60px); }',
    ],
  },
  'hero-pill-badge': {
    pos: [
      '<span className="inline-flex rounded-full border px-3 py-1 text-xs">New: AI reports</span>',
      '<div class="rounded-full bg-indigo-50 px-3"><span>\u2728</span> Introducing Flows</div>',
      '<a href="/blog" className="rounded-full border border-white/10">Announcing our Series A</a>',
    ],
    neg: [
      '<span className="rounded-full border px-3 py-1 text-xs">Pro plan</span>',
      '<p className="text-sm">New features ship every week.</p>',
    ],
  },
  'icon-tile-stack': {
    pos: [[
      '<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50"><Zap /></div>',
      '<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50"><Lock /></div>',
      '<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10"><Chart /></div>',
    ].join('\n')],
    neg: [
      [
        '<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50"><Zap /></div>',
        '<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50"><Lock /></div>',
      ].join('\n'),
      [
        '<img className="h-10 w-10 rounded-full" alt="a" />',
        '<img className="h-10 w-10 rounded-full" alt="b" />',
        '<img className="h-10 w-10 rounded-full" alt="c" />',
      ].join('\n'),
    ],
  },
  'template-copy': {
    pos: ['<h1>Supercharge your workflow</h1>', '<p>A seamless way to ship world-class apps.</p>'],
    neg: ['<div className="seamless-grid"><h1>Send invoices in two clicks</h1></div>', '<p className="effortless-card">Export a CSV of last month.</p>', '<span>S \u00b7 Seamless</span>'],
  },
  'aphoristic-cadence': {
    pos: ['<h2>Not a feature. A platform.</h2>', '<p>No meetings. No busywork.</p>', "<p>It's not a tool, it's a teammate.</p>"],
    neg: ['<p>Not every team needs this, so we made it optional.</p>', '<p>No credit card required.</p>'],
  },
  'cream-generic-sans': {
    pos: ['body { background: #FAF7F2; font-family: Inter, sans-serif; }', ':root { --bg: #fdf6e3; }\nbody { font-family: "Inter", system-ui; }'],
    neg: ['body { background: #FAF7F2; font-family: "Fraunces", serif; }', 'body { background: #ffffff; font-family: Inter, sans-serif; }'],
  },
  'grid-pattern-background': {
    pos: [
      '.grid { background-image: linear-gradient(to right, #eee 1px, transparent 1px), linear-gradient(to bottom, #eee 1px, transparent 1px); background-size: 24px 24px; }',
      '.dots { background-image: radial-gradient(#ccc 1px, transparent 1px); background-size: 16px 16px; }',
      '<div className="bg-[linear-gradient(to_right,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />',
    ],
    neg: ['.hero { background-image: linear-gradient(180deg, #fff, #f4f4f5); }', '.spot { background: radial-gradient(circle, #fff, #eee); }'],
  },
  'repeating-stripes-gradient': {
    pos: ['.stripes { background: repeating-linear-gradient(45deg, #eee 0 10px, #fff 10px 20px); }'],
    neg: ['.hero { background: linear-gradient(45deg, #eee, #fff); }'],
  },
  'thin-border-wide-shadow': {
    pos: [
      '<div className="rounded-2xl border border-white/10 shadow-2xl">',
      '.card { border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1); }',
    ],
    neg: [
      '<div className="rounded-2xl border border-slate-200 shadow-2xl">',
      '.card { border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }',
    ],
  },
  'hover-zoom': {
    pos: ['<div className="transition hover:scale-105">', '.card:hover { transform: scale(1.05); }', '<motion.div whileHover={{ scale: 1.1 }} />'],
    neg: ['<button className="active:scale-95 hover:bg-slate-100">', '.card:hover { transform: scale(1.01); }', '.card:hover { background: #f5f5f5; }'],
  },
  'pulsing-dot': {
    pos: ['<span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />', '<span class="size-2 animate-pulse rounded-full bg-emerald-400"></span>'],
    neg: ['<div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />', '<div className="h-4 w-full animate-pulse rounded bg-slate-200" />'],
  },
  'logo-marquee': {
    pos: ['<div className="flex animate-marquee gap-8">', '@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }'],
    neg: ['<div className="flex animate-spin">', '@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }'],
  },
  'emoji-heading-icon': {
    pos: ['<h2>\u{1F680} Fast deploys</h2>', '<button className="btn"><span>\u2728</span> Generate</button>'],
    neg: ['<h2>Fast deploys \u{1F680}</h2>', '<button className="btn">Generate</button>', '<button aria-label="Close">\u2715</button>'],
  },

  // Quality and accessibility (v2)
  'tiny-text': {
    pos: ['.legal { font-size: 10px; }', '<p className="text-[11px]">Terms</p>', '.x { font-size: 0.625rem; }', 'const s = { fontSize: 9 };'],
    neg: ['.legal { font-size: 12px; }', '<p className="text-[13px]">Terms</p>', '.x { font-size: 0.875rem; }', 'const s = { fontSize: 14 };'],
  },
  'viewport-zoom-disabled': {
    pos: ['<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">', '<meta name="viewport" content="width=device-width, user-scalable=no">', 'export const viewport = { maximumScale: 1 };'],
    neg: ['<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, maximum-scale=5">'],
  },
  'positive-tabindex': {
    pos: ['<div tabindex="3">x</div>', '<div tabIndex={1}>x</div>'],
    neg: ['<div tabindex="0">x</div>', '<div tabIndex={-1}>x</div>'],
  },
  'clickable-div': {
    pos: ['<div className="card" onClick={() => open(id)}>Open</div>', '<span @click="toggle">x</span>'],
    neg: ['<div role="button" tabIndex={0} onClick={() => open(id)}>Open</div>', '<button onClick={() => open(id)}>Open</button>'],
  },
  'icon-button-no-label': {
    pos: ['<button className="p-2"><XIcon className="h-4 w-4" /></button>', '<button><svg viewBox="0 0 24 24"><path d="M1 1"/></svg></button>'],
    neg: [
      '<button aria-label="Close"><XIcon /></button>',
      '<button><XIcon /><span className="sr-only">Close</span></button>',
      '<button><PlusIcon /> Add item</button>',
    ],
  },
  'placeholder-as-label': {
    pos: ['<input type="email" placeholder="Email" />'],
    neg: ['<input id="email" type="email" placeholder="you@x.com" />', '<label>Email <input placeholder="you@x.com" /></label>', '<input aria-label="Search" placeholder="Search" />'],
  },
  'autoplay-unmuted-video': {
    pos: ['<video src="a.mp4" autoplay loop></video>', '<video src="a.mp4" autoPlay playsInline />'],
    neg: ['<video src="a.mp4" autoplay muted loop></video>', '<video src="a.mp4" controls></video>'],
  },
  'transition-all': {
    pos: ['.btn { transition: all 200ms; }', '.m { transition: height 300ms ease, all 250ms; }', '<button className="transition-all duration-200">'],
    neg: ['.btn { transition: transform 200ms, opacity 200ms; }', '<button className="transition-colors duration-200">'],
  },
  'missing-reduced-motion': {
    pos: ['@keyframes spin { to { transform: rotate(360deg); } }\n.s { animation: spin 1s linear infinite; }', '.s { animation: spin 1s linear infinite; }'],
    neg: [
      '@keyframes spin { to { transform: rotate(360deg); } }\n@media (prefers-reduced-motion: reduce) { .s { animation: none; } }',
      '.s { transition: opacity 200ms; }',
    ],
  },
  'heading-level-skip': {
    pos: ['<h1>Title</h1><h3>Sub</h3>'],
    neg: ['<h1>Title</h1><h2>Sub</h2><h3>Deep</h3><h2>Next</h2>'],
  },
  'lorem-ipsum': {
    pos: ['<p>Lorem ipsum dolor sit amet</p>'],
    neg: ['<p>Track every invoice in one place.</p>'],
  },
  'dead-href': {
    pos: ['<a href="#">Learn more</a>', '<a className="x" href="">Docs</a>', '<a href={"#"}>x</a>'],
    neg: ['<a href="#pricing">Pricing</a>', '<a href="/docs">Docs</a>'],
  },
  'z-index-arms-race': {
    pos: ['.modal { z-index: 9999; }', '<div className="z-[1000]">', 'const s = { zIndex: 99999 };'],
    neg: ['.modal { z-index: 50; }', '<div className="z-50">'],
  },
  'low-contrast-pair': {
    pos: ['.muted { color: #aaa; background: #fff; }', '<p style="color: #999999; background-color: #ffffff">x</p>'],
    neg: ['.body { color: #333; background: #fff; }', '.x { color: #aaa; }'],
  },
  'paragraph-tight-leading': {
    pos: ['<p className="text-lg leading-tight">Long body copy</p>', '<p class="leading-none">x</p>'],
    neg: ['<p className="leading-relaxed">Body</p>', '<h1 className="leading-tight">Title</h1>'],
  },
};

const hits = (rule, sample) => rule.test(sample) || [];

test('every rule has a test entry with positive and negative samples', () => {
  const missing = RULES.filter(r => !CASES[r.id]).map(r => r.id);
  assert.deepEqual(missing, [], `rules with no test entry: ${missing.join(', ')}`);
  for (const r of RULES) {
    assert.ok(CASES[r.id].pos.length > 0, `${r.id} has no positive sample`);
    assert.ok(CASES[r.id].neg.length > 0, `${r.id} has no negative sample`);
  }
  const orphan = Object.keys(CASES).filter(id => !ruleById(id));
  assert.deepEqual(orphan, [], `test entries with no rule: ${orphan.join(', ')}`);
});

test('rule ids are unique', () => {
  const ids = RULES.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('rule shape is valid and messages contain no em dash', () => {
  for (const r of RULES) {
    assert.match(r.id, /^[a-z0-9-]+$/, r.id);
    assert.match(r.severity, /^P[0-3]$/, `${r.id} severity`);
    assert.equal(typeof r.category, 'string', `${r.id} category`);
    assert.ok(Array.isArray(r.extensions) && r.extensions.length > 0, `${r.id} extensions`);
    assert.equal(typeof r.test, 'function', `${r.id} test`);
    assert.ok(!r.message.includes('\u2014'), `${r.id} message contains an em dash`);
  }
});

test('registry helpers', () => {
  assert.equal(lineOf('a\nb\nc', 4), 3);
  assert.ok(CODE_EXTENSIONS.includes('.tsx'));
  assert.ok(rulesFor('.css').length > 0);
  assert.equal(rulesFor('.py').length, 0);
});

for (const [id, { pos, neg }] of Object.entries(CASES)) {
  const rule = ruleById(id);
  test(`${id}: positive samples match`, () => {
    for (const s of pos) {
      const found = hits(rule, s);
      assert.ok(found.length > 0, `expected a finding for: ${s}`);
      for (const f of found) {
        assert.equal(typeof f.index, 'number');
        assert.equal(typeof f.snippet, 'string');
      }
    }
  });
  test(`${id}: negative samples do not match`, () => {
    for (const s of neg) {
      assert.deepEqual(hits(rule, s), [], `unexpected finding for: ${s}`);
    }
  });
}
