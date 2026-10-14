import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { harvest } from '../../scripts/slop-harvest.mjs';
import { classifyArm, extractCode } from '../../scripts/eval-results.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'slop-harvest.mjs');

const SLOP = '<!doctype html><html><body><h1 style="background-clip: text; -webkit-background-clip: text">Hi</h1><img src="a.png"></body></html>';
const CLEAN = '<!doctype html><html><body><main><h1>Hi</h1></main></body></html>';

function makeResults() {
  const dir = mkdtempSync(join(tmpdir(), 'crisp-harvest-'));
  // Shape 1: one JSON file, model at the top, runs with an arm and a transcript holding a Write tool call.
  writeFileSync(join(dir, 'results.json'), JSON.stringify({
    model: 'claude-sonnet-5',
    cases: [{
      case: 'restaurant-home',
      prompt: '```html\n<div style="background-clip:text">not model output</div>\n```',
      runs: [
        { arm: 'baseline', transcript: [{ role: 'assistant', content: [{ type: 'tool_use', name: 'Write', input: { file_path: 'index.html', content: SLOP } }] }] },
        { arm: 'baseline', transcript: [{ role: 'assistant', content: [{ type: 'tool_use', name: 'Write', input: { file_path: 'index.html', content: SLOP } }] }] },
        { arm: 'with-plugin', output: CLEAN },
      ],
      graders: [{ rationale: SLOP }],
    }],
  }));
  // Shape 2: JSONL, model per line, fenced code in a final message.
  mkdirSync(join(dir, 'gemini'));
  writeFileSync(join(dir, 'gemini', 'runs.jsonl'), [
    JSON.stringify({ model: 'gemini-3-pro', ablation: 'none', case_name: 'dashboard', result: 'Here you go:\n```css\n.x { transition: all 1s; }\n```' }),
    'not json',
    JSON.stringify({ model: 'gemini-3-pro', ablation: 'none', case_name: 'dashboard', result: 'No code here at all, just prose.' }),
  ].join('\n'));
  // Shape 3: raw files on disk, arm from the path.
  mkdirSync(join(dir, 'case-x', 'without'), { recursive: true });
  writeFileSync(join(dir, 'case-x', 'without', 'page.html'), SLOP.replace('Hi', 'Hello'));
  return dir;
}

test('arm classification and code extraction', () => {
  assert.equal(classifyArm('none'), 'baseline');
  assert.equal(classifyArm('without'), 'baseline');
  assert.equal(classifyArm('with-plugin'), 'plugin');
  assert.equal(classifyArm('default'), null);
  assert.deepEqual(extractCode('```tsx\n<div className="a" />\n```').map(c => c.ext), ['.tsx']);
  assert.deepEqual(extractCode('body { color: red; } a long enough string', 'styles.css').map(c => c.ext), ['.css']);
  assert.deepEqual(extractCode('Just a sentence that mentions <div> once.'), []);
});

test('harvest counts baseline outputs per model, dedupes, and skips grader and prompt text', () => {
  const dir = makeResults();
  try {
    const r = harvest(dir);
    const claude = r.models['claude-sonnet-5'];
    assert.equal(claude.outputs, 1, 'identical baseline outputs count once');
    assert.equal(claude.rules['gradient-text'].outputs, 1);
    assert.equal(claude.rules['missing-alt-text'].hits, 1);

    const gemini = r.models['gemini-3-pro'];
    assert.equal(gemini.outputs, 1);
    assert.equal(gemini.rules['transition-all'].hits, 1);

    assert.equal(r.models['unknown-model'].outputs, 1, 'on-disk file under without/ is baseline');
    assert.ok(r.armsSeen.includes('plugin'));

    const plugin = harvest(dir, { arm: 'plugin' });
    assert.deepEqual(Object.keys(plugin.models), ['claude-sonnet-5']);
    assert.deepEqual(plugin.models['claude-sonnet-5'].rules, {});
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI prints a table and valid --json', () => {
  const dir = makeResults();
  try {
    const table = execFileSync('node', [SCRIPT, dir], { encoding: 'utf8' });
    assert.match(table, /gradient-text/);
    assert.match(table, /claude-sonnet-5/);
    const json = JSON.parse(execFileSync('node', [SCRIPT, '--json', dir], { encoding: 'utf8' }));
    assert.equal(json.arm, 'baseline');
    assert.ok(json.models['gemini-3-pro']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
