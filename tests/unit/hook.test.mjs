import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { beforeText, runPostToolUse, runStop } from '../../scripts/hook.mjs';
import { newFindings } from '../../scripts/detector/engine.mjs';

const OLD_IMG = '<img src="old.png">\n';
const NEW_IMG = '<img src="new.png">\n';

function repo() {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'crisp-hook-')));
  const run = args => execFileSync('git', args, { cwd: dir, stdio: 'ignore' });
  run(['init', '-q']);
  run(['config', 'user.email', 't@t']);
  run(['config', 'user.name', 't']);
  writeFileSync(join(dir, 'page.html'), `<main>\n${OLD_IMG}</main>\n`);
  run(['add', '.']);
  run(['commit', '-qm', 'init']);
  return dir;
}

function inRepo(dir, fn) {
  const prev = process.cwd();
  process.chdir(dir);
  return Promise.resolve(fn()).finally(() => process.chdir(prev));
}

test('beforeText undoes an Edit', () => {
  const payload = { tool_name: 'Edit', tool_input: { file_path: 'x.html', old_string: 'a', new_string: 'b' } };
  assert.equal(beforeText(payload, 'xbx'), 'xax');
});

test('beforeText undoes MultiEdit in reverse order', () => {
  const payload = { tool_name: 'MultiEdit', tool_input: { file_path: 'x.html', edits: [
    { old_string: 'a', new_string: 'b' },
    { old_string: 'b', new_string: 'c' },
  ] } };
  assert.equal(beforeText(payload, 'c'), 'a');
});

test('beforeText undoes replace_all edits', () => {
  const payload = { tool_name: 'Edit', tool_input: { file_path: 'x.html', old_string: 'a', new_string: 'b', replace_all: true } };
  assert.equal(beforeText(payload, 'bxb'), 'axa');
});

test('newFindings counts duplicates', () => {
  const f = { id: 'r', snippet: 's' };
  assert.equal(newFindings([f], [f, f]).length, 1);
  assert.equal(newFindings([f, f], [f]).length, 0);
});

test('PostToolUse stays silent when an edit leaves only old findings', async () => {
  const dir = repo();
  try {
    await inRepo(dir, async () => {
      writeFileSync('page.html', `<main>\n${OLD_IMG}<p>hi</p>\n</main>\n`);
      const out = await runPostToolUse({ tool_name: 'Edit', tool_input: { file_path: join(dir, 'page.html'), old_string: '</main>', new_string: '<p>hi</p>\n</main>' } });
      assert.equal(out, null);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('PostToolUse reports only the finding the edit added', async () => {
  const dir = repo();
  try {
    await inRepo(dir, async () => {
      writeFileSync('page.html', `<main>\n${OLD_IMG}${NEW_IMG}</main>\n`);
      const out = await runPostToolUse({ tool_name: 'Edit', tool_input: { file_path: join(dir, 'page.html'), old_string: '</main>', new_string: `${NEW_IMG}</main>` } });
      const ctx = out.hookSpecificOutput.additionalContext;
      assert.match(ctx, /added 1 design issue/);
      assert.match(ctx, /missing-alt-text/);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('PostToolUse on Write compares with git HEAD', async () => {
  const dir = repo();
  try {
    await inRepo(dir, async () => {
      writeFileSync('page.html', `<main>\n${OLD_IMG}</main>\n<footer></footer>\n`);
      const out = await runPostToolUse({ tool_name: 'Write', tool_input: { file_path: join(dir, 'page.html') } });
      assert.equal(out, null);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('Stop blocks once on a new P1, and passes when stop_hook_active', async () => {
  const dir = repo();
  try {
    await inRepo(dir, async () => {
      writeFileSync('new.html', NEW_IMG);
      const out = await runStop({});
      assert.equal(out.decision, 'block');
      assert.match(out.reason, /missing-alt-text/);
      assert.equal(await runStop({ stop_hook_active: true }), null);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('Stop passes when changes add nothing', async () => {
  const dir = repo();
  try {
    await inRepo(dir, async () => {
      writeFileSync('page.html', `<main>\n${OLD_IMG}<p>ok</p>\n</main>\n`);
      assert.equal(await runStop({}), null);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
