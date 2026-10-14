import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildComment, crispCommand, isUiFile, MARKER } from '../../.github/actions/crisp-design-review/review.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ACTION = join(ROOT, '.github', 'actions', 'crisp-design-review', 'action.yml');
const EXAMPLE = join(ROOT, '.github', 'actions', 'crisp-design-review', 'example-workflow.yml');

/**
 * A deliberately small YAML reader: block maps, block lists, plain and quoted
 * scalars, `|` block scalars, and flow values kept as raw strings. It covers
 * the shapes GitHub workflow files use and throws on anything it cannot place,
 * which is the point: bad indentation or a stray tab fails this test.
 */
function parseYaml(text) {
  if (/\t/.test(text)) throw new Error('tab character in YAML');
  const lines = text.split('\n').map((raw, i) => ({ raw, n: i + 1 }));
  let pos = 0;

  const indentOf = s => s.match(/^ */)[0].length;
  const isSkippable = s => /^\s*(#.*)?$/.test(s);
  const scalar = v => {
    v = v.replace(/\s+#.*$/, '').trim();
    if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
    if (/^".*"$/.test(v)) return JSON.parse(v);
    if (/^['"]/.test(v)) throw new Error(`unterminated quote: ${v}`);
    return v;
  };
  const skip = () => { while (pos < lines.length && isSkippable(lines[pos].raw)) pos++; };

  function blockScalar(parentIndent) {
    const out = [];
    let ind = null;
    while (pos < lines.length) {
      const { raw } = lines[pos];
      if (raw.trim() === '') { out.push(''); pos++; continue; }
      const i = indentOf(raw);
      if (i <= parentIndent) break;
      ind ??= i;
      out.push(raw.slice(ind));
      pos++;
    }
    return out.join('\n').replace(/\n+$/, '\n');
  }

  function value(rest, indent) {
    if (rest === '|' || rest === '|-' || rest === '>') return blockScalar(indent);
    if (rest === '') { skip(); return pos < lines.length && indentOf(lines[pos].raw) > indent ? node(indentOf(lines[pos].raw)) : null; }
    return scalar(rest);
  }

  function node(indent) {
    skip();
    const first = lines[pos].raw.slice(indent);
    if (first.startsWith('- ') || first === '-') {
      const list = [];
      while (true) {
        skip();
        if (pos >= lines.length || indentOf(lines[pos].raw) < indent) break;
        const { raw, n } = lines[pos];
        if (indentOf(raw) !== indent || !raw.slice(indent).startsWith('-')) throw new Error(`line ${n}: bad list indentation`);
        const rest = raw.slice(indent + 1).trimStart();
        if (/^[\w.-]+:( |$)/.test(rest)) {
          // "- key: value" opens a map whose keys sit at indent + 2.
          lines[pos] = { raw: ' '.repeat(indent + 2) + rest, n };
          list.push(node(indent + 2));
        } else {
          pos++;
          list.push(value(rest, indent));
        }
      }
      return list;
    }
    const map = {};
    while (true) {
      skip();
      if (pos >= lines.length || indentOf(lines[pos].raw) < indent) break;
      const { raw, n } = lines[pos];
      if (indentOf(raw) !== indent) throw new Error(`line ${n}: bad map indentation`);
      const m = raw.slice(indent).match(/^([\w.\-${}' ]+?):(?: (.*))?$/);
      if (!m) throw new Error(`line ${n}: cannot parse "${raw.trim()}"`);
      if (m[1] in map) throw new Error(`line ${n}: duplicate key ${m[1]}`);
      pos++;
      map[m[1]] = value((m[2] ?? '').trim(), indent);
    }
    return map;
  }

  const doc = node(0);
  skip();
  if (pos < lines.length) throw new Error(`line ${lines[pos].n}: unexpected content`);
  return doc;
}

function expressionsBalanced(text) {
  const opens = (text.match(/\$\{\{/g) || []).length;
  const closes = (text.match(/\}\}/g) || []).length;
  return opens === closes;
}

test('action.yml parses and is a composite action', () => {
  const text = readFileSync(ACTION, 'utf8');
  assert.ok(expressionsBalanced(text));
  const a = parseYaml(text);
  assert.equal(a.name, 'CRISP design review');
  assert.equal(a.runs.using, 'composite');
  assert.ok(Array.isArray(a.runs.steps) && a.runs.steps.length === 3);
  for (const step of a.runs.steps) {
    assert.equal(step.shell, 'bash', `${step.name} needs a shell (composite actions require it)`);
    assert.match(step.run, /review\.mjs/);
  }
  assert.equal(a.inputs['fail-on'].default, 'none');
  // Only the built-in token: no secrets referenced by the deterministic action.
  assert.doesNotMatch(text, /secrets\./);
});

test('example workflow parses, never runs on this repo, and keeps the AI job off by default', () => {
  const text = readFileSync(EXAMPLE, 'utf8');
  assert.ok(expressionsBalanced(text));
  const w = parseYaml(text);
  assert.ok(w.on.pull_request);
  assert.equal(w.on.pull_request_target, undefined, 'pull_request_target would run untrusted code with write access');
  assert.equal(w.permissions['pull-requests'], 'write');
  for (const [name, job] of Object.entries(w.jobs)) {
    assert.match(job.if, /github\.repository != 'laith-wallace\/crisp'/, `${name} must not run on the CRISP repo`);
  }
  assert.match(w.jobs['ai-review'].if, /vars\.CRISP_AI_REVIEW == 'true'/);
  const uses = w.jobs['design-detector'].steps.map(s => s.uses).find(u => u?.includes('crisp-design-review'));
  assert.ok(uses);
  assert.ok(existsSync(join(ROOT, uses.replace(/^laith-wallace\/crisp\//, '').replace(/@.*$/, ''), 'action.yml')));
});

test('the mini YAML reader rejects broken indentation', () => {
  assert.throws(() => parseYaml('a:\n  b: 1\n   c: 2\n'));
  assert.throws(() => parseYaml('a:\n\tb: 1\n'));
  assert.deepEqual(parseYaml('a:\n  - x: 1\n    y: "two"\n  - z\n'), { a: [{ x: '1', y: 'two' }, 'z'] });
});

test('comment body: sticky marker, table rows, links, truncation', () => {
  const result = {
    filesScanned: 2,
    findings: [
      { id: 'transition-all', severity: 'P2', file: 'src/a.css', line: 4, message: 'transition: all | animates everything' },
      { id: 'missing-alt-text', severity: 'P0', file: 'src/b.tsx', line: 12, message: 'Image has no alt' },
    ],
  };
  const body = buildComment(result, { repo: 'o/r', sha: 'abc', maxRows: 1 });
  assert.ok(body.startsWith(MARKER));
  assert.match(body, /2 finding\(s\) in 2 changed UI file\(s\): 1 P0, 1 P2\./);
  assert.match(body, /\| Rule \| Location \| Severity \| Note \|/);
  assert.match(body, /\| `missing-alt-text` \| \[src\/b\.tsx:12\]/);
  assert.match(body, /\[src\/b\.tsx:12\]\(https:\/\/github\.com\/o\/r\/blob\/abc\/src\/b\.tsx#L12\) \| P0 \|/);
  assert.doesNotMatch(body, /src\/a\.css:4/, 'P2 row is past max-rows');
  assert.match(body, /Showing the first 1/);

  const clean = buildComment({ filesScanned: 3, findings: [] });
  assert.match(clean, /No detector findings in 3 changed UI file\(s\)\./);

  const piped = buildComment(result, { maxRows: 5 });
  assert.match(piped, /transition: all \\\| animates everything/, 'pipes in messages are escaped');
});

test('UI file filter and command selection', () => {
  assert.ok(isUiFile('a/b.TSX'));
  assert.ok(isUiFile('x.svelte'));
  assert.ok(!isUiFile('x.ts'));
  assert.ok(!isUiFile('README.md'));

  assert.deepEqual(crispCommand({ override: 'npx --no-install crisp' }), ['npx', '--no-install', 'crisp']);
  assert.deepEqual(crispCommand({ cwd: ROOT }), ['node', 'bin/crisp.mjs']);

  const dir = mkdtempSync(join(tmpdir(), 'crisp-action-'));
  try {
    const actionPath = join(ROOT, '.github', 'actions', 'crisp-design-review');
    assert.deepEqual(crispCommand({ cwd: dir, actionPath }), ['node', join(actionPath, '..', '..', '..', 'bin', 'crisp.mjs')]);
    mkdirSync(join(dir, 'node_modules', '.bin'), { recursive: true });
    writeFileSync(join(dir, 'node_modules', '.bin', 'crisp'), '');
    assert.deepEqual(crispCommand({ cwd: dir, actionPath }), ['npx', '--no-install', 'crisp']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
