/**
 * tests/unit/design-md.test.mjs
 *
 * Run: node --test tests/unit/design-md.test.mjs
 * Zero dependencies: node:test + node:assert only.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, utimesSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseDesignMd, lintDesignMd, diffDesignMd, loadDesignTokens, parseColor, contrastRatio, runDesignMd,
} from '../../scripts/design-md.mjs';
import { DESIGN_MD_RULES, normaliseHex } from '../../scripts/detector/rules-design-md.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VALID = readFileSync(join(ROOT, 'tests/fixtures/design-md/DESIGN.md'), 'utf8');
const BROKEN = readFileSync(join(ROOT, 'tests/fixtures/design-md/broken.DESIGN.md'), 'utf8');

const doc = (yaml, body = '') => `---\n${yaml.trim()}\n---\n${body}`;
const ids = findings => findings.map(f => f.id);
const has = (findings, id) => findings.some(f => f.id === id);

/** Run fn with cwd set to a fresh temp dir containing the given files. */
function inTempDir(files, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'crisp-design-md-'));
  const prev = process.cwd();
  try {
    for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
    process.chdir(dir);
    return fn(dir);
  } finally {
    process.chdir(prev);
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Capture console output while running a CLI call. */
function capture(fn) {
  const log = console.log, error = console.error;
  let out = '', err = '';
  console.log = (...a) => { out += a.join(' ') + '\n'; };
  console.error = (...a) => { err += a.join(' ') + '\n'; };
  try { return { code: fn(), out, err }; } finally { console.log = log; console.error = error; }
}

describe('parseDesignMd', () => {
  test('parses nested maps, scalars, quoted strings and the body', () => {
    const { tokens, body, errors } = parseDesignMd(VALID);
    assert.deepEqual(errors, []);
    assert.equal(tokens.version, 'alpha');
    assert.equal(tokens.name, 'Fixture Ledger');
    assert.equal(tokens.colors.primary, '#1A1C1E');
    assert.equal(tokens.colors.accent, '{colors.tertiary}');
    assert.equal(tokens.typography['headline-lg'].fontWeight, 600);
    assert.equal(tokens.typography['headline-lg'].lineHeight, 1.2);
    assert.equal(tokens.typography['headline-lg'].letterSpacing, '-0.02em');
    assert.equal(tokens.typography['body-md'].fontFamily, 'Public Sans');
    assert.equal(tokens.components['button-primary'].typography, '{typography.label-md}');
    assert.match(body, /^\n# Fixture Ledger/);
  });

  test('parses lists of strings and lists of maps (omitted)', () => {
    const { tokens, errors } = parseDesignMd(doc(`
omitted:
  - spacing
  - section: rounded
    reason: "No rounded corners in the brand book"
tags: [a, "b c", 3]
`));
    assert.deepEqual(errors, []);
    assert.deepEqual(tokens.omitted, ['spacing', { section: 'rounded', reason: 'No rounded corners in the brand book' }]);
    assert.deepEqual(tokens.tags, ['a', 'b c', 3]);
  });

  test('handles comments, single quotes, escapes and block scalars', () => {
    const { tokens, errors } = parseDesignMd(doc(`
# leading comment
name: 'Don''t panic' # trailing comment
description: |
  Line one
  # not a comment
colors:
  primary: "#000000" # ink
  quote: "say \\"hi\\""
`));
    assert.deepEqual(errors, []);
    assert.equal(tokens.name, "Don't panic");
    assert.equal(tokens.description, 'Line one\n# not a comment\n');
    assert.equal(tokens.colors.primary, '#000000');
    assert.equal(tokens.colors.quote, 'say "hi"');
  });

  test('unquoted #hex is a comment, so the value is null (matches real YAML)', () => {
    const { tokens } = parseDesignMd(doc('colors:\n  primary: #1A1C1E'));
    assert.equal(tokens.colors.primary, null);
  });

  test('no front matter returns tokens null and the whole text as body', () => {
    const r = parseDesignMd('# Title\n\nJust prose.');
    assert.equal(r.tokens, null);
    assert.equal(r.hasFrontMatter, false);
    assert.equal(r.body, '# Title\n\nJust prose.');
  });

  test('reports unclosed front matter, tabs, duplicate keys and bad quotes', () => {
    assert.equal(parseDesignMd('---\nname: x\n').errors[0].code, 'yaml-parse-error');
    assert.ok(parseDesignMd(doc('colors:\n\tprimary: "#000"')).errors.length > 0);
    assert.equal(parseDesignMd(doc('name: a\nname: b')).errors[0].code, 'duplicate-key');
    assert.equal(parseDesignMd(doc('name: "unterminated')).errors[0].code, 'yaml-parse-error');
  });
});

describe('parseColor and contrastRatio', () => {
  test('parses every color syntax the spec allows', () => {
    assert.equal(parseColor('#abc').hex, '#aabbcc');
    assert.equal(parseColor('#AABBCCDD').a.toFixed(2), (0xdd / 255).toFixed(2));
    assert.equal(parseColor('cornflowerblue').hex, '#6495ed');
    assert.equal(parseColor('rgb(255, 0, 0)').hex, '#ff0000');
    assert.equal(parseColor('rgb(255 0 0 / 50%)').a, 0.5);
    assert.equal(parseColor('hsl(120, 100%, 50%)').hex, '#00ff00');
    assert.equal(parseColor('hwb(0 0% 0%)').hex, '#ff0000');
    assert.equal(parseColor('oklch(0.6279 0.2577 29.23)').hex, '#ff0000');
    assert.equal(parseColor('lab(54.29 80.8 69.89)').hex, '#ff0000');
    assert.equal(parseColor('color-mix(in srgb, #000000, #ffffff)').hex, '#808080');
    assert.equal(parseColor('transparent').a, 0);
  });

  test('rejects non-colors', () => {
    for (const bad of ['', 'notacolor', '#12', '#ggg', 'rgb(1,2)', '16px', 'currentColor']) assert.equal(parseColor(bad), null, bad);
  });

  test('contrast ratio matches WCAG reference values', () => {
    assert.equal(contrastRatio(parseColor('#000'), parseColor('#fff')).toFixed(1), '21.0');
    assert.equal(contrastRatio(parseColor('#777'), parseColor('#fff')).toFixed(2), '4.48');
  });
});

describe('lintDesignMd', () => {
  test('valid fixture is clean', () => {
    assert.deepEqual(lintDesignMd(VALID), []);
  });

  test('broken fixture flags the broken ref and the low-contrast pair', () => {
    const f = lintDesignMd(BROKEN);
    assert.deepEqual(ids(f).sort(), ['broken-ref', 'contrast-ratio']);
    assert.ok(f.every(x => ['P0', 'P1', 'P2', 'P3'].includes(x.severity)));
    assert.equal(f.find(x => x.id === 'broken-ref').path, 'components.button-primary.textColor');
  });

  test('missing-front-matter', () => {
    assert.ok(has(lintDesignMd('# Just prose\n\n## Colors\n'), 'missing-front-matter'));
    assert.ok(!has(lintDesignMd(VALID), 'missing-front-matter'));
  });

  test('yaml-parse-error is P0', () => {
    const f = lintDesignMd('---\nname: "oops\n---\n');
    assert.ok(f.some(x => x.id === 'yaml-parse-error' && x.severity === 'P0'));
    assert.ok(!has(lintDesignMd(VALID), 'yaml-parse-error'));
  });

  test('unquoted-reference and duplicate-key', () => {
    assert.ok(has(lintDesignMd(doc('colors:\n  primary: "#000"\n  ink: {colors.primary}')), 'unquoted-reference'));
    assert.ok(has(lintDesignMd(doc('colors:\n  primary: "#000"\n  primary: "#fff"')), 'duplicate-key'));
  });

  test('broken-ref in any group, not just components', () => {
    const f = lintDesignMd(doc('colors:\n  primary: "#000000"\n  accent: "{colors.missing}"'));
    assert.ok(f.some(x => x.id === 'broken-ref' && x.path === 'colors.accent'));
    assert.ok(!has(lintDesignMd(doc('colors:\n  primary: "#000000"\n  accent: "{colors.primary}"')), 'broken-ref'));
  });

  test('circular-ref', () => {
    const f = lintDesignMd(doc('colors:\n  primary: "{colors.a}"\n  a: "{colors.b}"\n  b: "{colors.a}"'));
    assert.ok(has(f, 'circular-ref'));
    assert.ok(!has(f, 'broken-ref'));
    assert.ok(!has(lintDesignMd(VALID), 'circular-ref'));
  });

  test('ref-to-group outside components', () => {
    const y = 'colors:\n  primary: "#000"\ntypography:\n  body:\n    fontFamily: Inter\n    fontSize: 16px\n';
    assert.ok(has(lintDesignMd(doc(y + 'rounded:\n  md: "{typography.body}"')), 'ref-to-group'));
    assert.ok(!has(lintDesignMd(doc(y + 'components:\n  b:\n    typography: "{typography.body}"')), 'ref-to-group'));
  });

  test('invalid-color, including unquoted hex and refs to non-colors', () => {
    assert.ok(has(lintDesignMd(doc('colors:\n  primary: "not-a-color"')), 'invalid-color'));
    const unquoted = lintDesignMd(doc('colors:\n  primary: #1A1C1E'));
    assert.ok(unquoted.some(x => x.id === 'invalid-color' && /quote it/.test(x.message)));
    assert.ok(has(lintDesignMd(doc('spacing:\n  md: 16px\ncolors:\n  primary: "{spacing.md}"')), 'invalid-color'));
    assert.ok(!has(lintDesignMd(doc('colors:\n  primary: "oklch(0.5 0.2 240)"')), 'invalid-color'));
  });

  test('invalid-dimension for rounded and typography', () => {
    assert.ok(has(lintDesignMd(doc('rounded:\n  md: 8pt')), 'invalid-dimension'));
    assert.ok(has(lintDesignMd(doc('rounded:\n  md: big')), 'invalid-dimension'));
    assert.ok(has(lintDesignMd(doc('typography:\n  b:\n    fontSize: 16')), 'invalid-dimension'));
    assert.ok(!has(lintDesignMd(doc('rounded:\n  md: 0.5rem\ntypography:\n  b:\n    fontSize: 1rem\n    lineHeight: 1.5')), 'invalid-dimension'));
  });

  test('invalid-font-weight and unknown-typography-prop', () => {
    assert.ok(has(lintDesignMd(doc('typography:\n  b:\n    fontWeight: bold')), 'invalid-font-weight'));
    assert.ok(!has(lintDesignMd(doc('typography:\n  b:\n    fontWeight: "700"')), 'invalid-font-weight'));
    assert.ok(has(lintDesignMd(doc('typography:\n  b:\n    fontColour: red')), 'unknown-typography-prop'));
  });

  test('unknown-component-prop', () => {
    assert.ok(has(lintDesignMd(doc('components:\n  b:\n    borderColor: "#000"')), 'unknown-component-prop'));
    assert.ok(!has(lintDesignMd(doc('components:\n  b:\n    padding: 12px')), 'unknown-component-prop'));
  });

  test('contrast-ratio uses 4.5:1 for body text and 3:1 for large text', () => {
    const base = 'colors:\n  primary: "#000"\n  bg: "#F7F5F2"\n  fg: "#6C7278"\ntypography:\n  big:\n    fontSize: 32px\n  small:\n    fontSize: 14px\n';
    const small = lintDesignMd(doc(base + 'components:\n  c:\n    backgroundColor: "{colors.bg}"\n    textColor: "{colors.fg}"\n    typography: "{typography.small}"'));
    assert.ok(has(small, 'contrast-ratio'));
    const large = lintDesignMd(doc(base + 'components:\n  c:\n    backgroundColor: "{colors.bg}"\n    textColor: "{colors.fg}"\n    typography: "{typography.big}"'));
    assert.ok(!has(large, 'contrast-ratio'));
  });

  test('contrast-ratio on declared on-X / X color pairs', () => {
    assert.ok(has(lintDesignMd(doc('colors:\n  primary: "#FFD54F"\n  on-primary: "#FFFFFF"')), 'contrast-ratio'));
    assert.ok(!has(lintDesignMd(doc('colors:\n  primary: "#1A1C1E"\n  on-primary: "#FFFFFF"')), 'contrast-ratio'));
  });

  test('token-collision', () => {
    assert.ok(has(lintDesignMd(doc('colors:\n  primary-60: "#000"\n  primary:\n    60: "#111"')), 'token-collision'));
  });

  test('missing-primary, missing-typography, missing-sections', () => {
    const f = lintDesignMd(doc('colors:\n  ink: "#000"'));
    assert.ok(has(f, 'missing-primary'));
    assert.ok(has(f, 'missing-typography'));
    assert.equal(f.filter(x => x.id === 'missing-sections').length, 2);
    const omitted = lintDesignMd(doc('omitted:\n  - spacing\n  - rounded\n  - typography\ncolors:\n  primary: "#000"'));
    assert.ok(!has(omitted, 'missing-sections'));
    assert.ok(!has(omitted, 'missing-typography'));
    assert.ok(!has(omitted, 'missing-primary'));
  });

  test('unknown-omission and redundant-omission', () => {
    assert.ok(has(lintDesignMd(doc('omitted:\n  - icons')), 'unknown-omission'));
    assert.ok(has(lintDesignMd(doc('omitted:\n  - colors\ncolors:\n  primary: "#000"')), 'redundant-omission'));
  });

  test('unknown-key (typo) and token-like-ignored', () => {
    assert.ok(lintDesignMd(doc('colours:\n  primary: "#000"')).some(x => x.id === 'unknown-key' && /colors/.test(x.message)));
    assert.ok(has(lintDesignMd(doc('palette:\n  ink: "#000000"')), 'token-like-ignored'));
    assert.ok(!has(lintDesignMd(doc('meta:\n  owner: design team')), 'token-like-ignored'));
  });

  test('orphaned-tokens', () => {
    const y = 'colors:\n  primary: "#000"\n  on-primary: "#fff"\n  sparkle: "#ff00ff"\ncomponents:\n  b:\n    backgroundColor: "{colors.primary}"\n    textColor: "{colors.on-primary}"';
    const f = lintDesignMd(doc(y));
    assert.deepEqual(f.filter(x => x.id === 'orphaned-tokens').map(x => x.path), ['colors.sparkle']);
  });

  test('section-order and duplicate-section (code fences ignored)', () => {
    const y = 'colors:\n  primary: "#000"';
    assert.ok(has(lintDesignMd(doc(y, '\n## Colors\n\n## Overview\n')), 'section-order'));
    assert.ok(!has(lintDesignMd(doc(y, '\n## Brand & Style\n\n## Colors\n\n```md\n## Overview\n```\n')), 'section-order'));
    assert.ok(has(lintDesignMd(doc(y, '\n## Colors\n\n## Colors\n')), 'duplicate-section'));
  });

  test('nesting-too-deep', () => {
    let y = 'colors:\n';
    for (let i = 0; i < 23; i++) y += '  '.repeat(i + 1) + `l${i}:\n`;
    y += '  '.repeat(24) + 'x: "#000"';
    assert.ok(has(lintDesignMd(doc(y)), 'nesting-too-deep'));
  });
});

describe('diffDesignMd', () => {
  test('reports added, removed and changed token paths', () => {
    const a = doc('colors:\n  primary: "#000"\n  old: "#111"\nrounded:\n  md: 8px');
    const b = doc('colors:\n  primary: "#222"\n  new: "#333"\nrounded:\n  md: 8px');
    const d = diffDesignMd(a, b);
    assert.deepEqual(d.added, [{ path: 'colors.new', value: '#333' }]);
    assert.deepEqual(d.removed, [{ path: 'colors.old', value: '#111' }]);
    assert.deepEqual(d.changed, [{ path: 'colors.primary', before: '#000', after: '#222' }]);
  });

  test('identical documents produce an empty diff; references compare raw', () => {
    assert.deepEqual(diffDesignMd(VALID, VALID), { added: [], removed: [], changed: [] });
    const d = diffDesignMd(doc('colors:\n  a: "#000"\n  b: "{colors.a}"'), doc('colors:\n  a: "#000"\n  b: "#000"'));
    assert.equal(d.changed[0].path, 'colors.b');
  });
});

describe('loadDesignTokens', () => {
  test('returns null when there is no DESIGN.md', () => {
    inTempDir({}, () => assert.equal(loadDesignTokens(), null));
  });

  test('returns a flat map of resolved values, expanding composite refs', () => {
    inTempDir({ 'DESIGN.md': VALID }, dir => {
      const t = loadDesignTokens(dir);
      assert.equal(t['colors.primary'], '#1A1C1E');
      assert.equal(t['colors.accent'], '#B8422E');
      assert.equal(t['components.button-primary.backgroundColor'], '#1A1C1E');
      assert.equal(t['components.button-primary.typography.fontSize'], '14px');
      assert.equal(t['components.button-primary.rounded'], '8px');
      assert.equal(t.name, 'Fixture Ledger');
    });
  });
});

describe('runDesignMd CLI', () => {
  const fx = p => join(ROOT, 'tests/fixtures/design-md', p);

  test('lint exit codes: 0 clean, 2 findings, 1 error', () => {
    assert.equal(capture(() => runDesignMd(['lint', fx('DESIGN.md')])).code, 0);
    assert.equal(capture(() => runDesignMd(['lint', fx('broken.DESIGN.md')])).code, 2);
    assert.equal(capture(() => runDesignMd(['lint', fx('nope.md')])).code, 1);
    assert.equal(capture(() => runDesignMd(['bogus'])).code, 1);
  });

  test('lint defaults to ./DESIGN.md and emits JSON', () => {
    inTempDir({ 'DESIGN.md': BROKEN }, () => {
      const r = capture(() => runDesignMd(['lint', '--json']));
      assert.equal(r.code, 2);
      const json = JSON.parse(r.out);
      assert.equal(json.findingCount, 2);
      assert.equal(json.summary.P1, 2);
    });
  });

  test('diff exit codes: 0 no change, 2 changes, 1 error', () => {
    assert.equal(capture(() => runDesignMd(['diff', fx('DESIGN.md'), fx('DESIGN.md')])).code, 0);
    const r = capture(() => runDesignMd(['diff', fx('DESIGN.md'), fx('broken.DESIGN.md'), '--json']));
    assert.equal(r.code, 2);
    assert.ok(JSON.parse(r.out).changed.some(c => c.path === 'name'));
    assert.equal(capture(() => runDesignMd(['diff', fx('DESIGN.md')])).code, 1);
  });

  test('diff --git compares against a git ref', () => {
    inTempDir({ 'DESIGN.md': VALID }, dir => {
      const git = (...a) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' });
      try {
        git('init', '-q');
        git('add', 'DESIGN.md');
        git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'init');
      } catch { return; } // git unavailable: skip
      assert.equal(capture(() => runDesignMd(['diff', '--git', 'HEAD'])).code, 0);
      writeFileSync(join(dir, 'DESIGN.md'), VALID.replace('#B8422E', '#C0392B'));
      const r = capture(() => runDesignMd(['diff', '--git', 'HEAD', '--json']));
      assert.equal(r.code, 2);
      assert.deepEqual(JSON.parse(r.out).changed, [{ path: 'colors.tertiary', before: '#B8422E', after: '#C0392B' }]);
      assert.equal(capture(() => runDesignMd(['diff', '--git', 'no-such-ref'])).code, 1);
    });
  });
});

describe('DESIGN_MD_RULES', () => {
  const rule = id => DESIGN_MD_RULES.find(r => r.id === id);

  test('rules match the detector rule shape', () => {
    for (const r of DESIGN_MD_RULES) {
      assert.equal(typeof r.id, 'string');
      assert.ok(['P0', 'P1', 'P2', 'P3'].includes(r.severity));
      assert.equal(r.category, 'design-system');
      assert.equal(typeof r.message, 'string');
      assert.ok(Array.isArray(r.extensions) && r.extensions.includes('.css'));
      assert.equal(typeof r.test, 'function');
    }
    assert.equal(rule('off-token-color').severity, 'P2');
  });

  test('normaliseHex', () => {
    assert.equal(normaliseHex('#ABC'), '#aabbcc');
    assert.equal(normaliseHex('#aabbccdd'), '#aabbcc');
    assert.equal(normaliseHex('#abcd'), '#aabbcc');
  });

  test('off-token-color returns [] without a DESIGN.md', () => {
    inTempDir({}, () => assert.deepEqual(rule('off-token-color').test('a { color: #123456; }'), []));
  });

  test('off-token-color flags hex outside the token set, case-insensitive with short-hex normalisation', () => {
    const tokens = doc('colors:\n  primary: "#1A1C1E"\n  white: "#FFFFFF"\n  accent: "rgb(184, 66, 46)"');
    inTempDir({ 'DESIGN.md': tokens }, () => {
      const css = '.a { color: #1a1c1e; background: #FFF; border-color: #b8422e; }\n.b { color: #123456; fill: #ABC; }';
      const hits = rule('off-token-color').test(css).map(m => m.snippet);
      assert.deepEqual(hits, ['#123456', '#ABC']);
    });
  });

  test('off-token-color ignores fragment links, url(#id) refs and entities', () => {
    inTempDir({ 'DESIGN.md': doc('colors:\n  primary: "#000000"') }, () => {
      const html = '<a href="#add">x</a><svg fill="url(#bad)"></svg><p>&#123;</p><Link to="#fade" />';
      assert.deepEqual(rule('off-token-color').test(html), []);
    });
  });

  test('off-token-color sees a DESIGN.md change (cache keyed by mtime and cwd)', () => {
    inTempDir({ 'DESIGN.md': doc('colors:\n  primary: "#000000"') }, dir => {
      assert.equal(rule('off-token-color').test('a{color:#123456}').length, 1);
      writeFileSync(join(dir, 'DESIGN.md'), doc('colors:\n  primary: "#123456"'));
      const later = new Date(Date.now() + 5000);
      utimesSync(join(dir, 'DESIGN.md'), later, later);
      assert.equal(rule('off-token-color').test('a{color:#123456}').length, 0);
    });
  });

  test('off-token-radius flags px radii outside rounded tokens, [] without tokens', () => {
    inTempDir({ 'DESIGN.md': doc('rounded:\n  sm: 4px\n  md: 0.5rem') }, () => {
      const src = '.a{border-radius: 8px;}\n.b{border-radius: 6px;}\n<div className="rounded-[4px] rounded-t-[10px]" style={{ borderRadius: "3px" }} />\n.c{border-radius:0px;}';
      assert.deepEqual(rule('off-token-radius').test(src).map(m => m.snippet), ['border-radius: 6px', 'rounded-t-[10px]', 'borderRadius: "3px"']);
    });
    inTempDir({}, () => assert.deepEqual(rule('off-token-radius').test('.a{border-radius: 6px;}'), []));
  });
});
