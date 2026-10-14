import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { startServer, MAX_BODY_BYTES } from '../../scripts/live/server.mjs';

const run = promisify(execFile);
const CLI = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'bin', 'crisp.mjs');

// The CLI must run asynchronously: the server lives in this process, and a
// blocking execFileSync would stop it answering.
async function cli(args, cwd) {
  try {
    const { stdout, stderr } = await run('node', [CLI, 'live', ...args], { cwd, encoding: 'utf8' });
    return { code: 0, stdout, stderr };
  } catch (err) {
    return { code: err.code, stdout: err.stdout, stderr: err.stderr };
  }
}

async function withServer(fn) {
  const cwd = mkdtempSync(join(tmpdir(), 'crisp-live-'));
  const live = await startServer({ cwd, port: 0 });
  try {
    await fn({ cwd, live, base: `http://127.0.0.1:${live.port}` });
  } finally {
    await live.close();
    rmSync(cwd, { recursive: true, force: true });
  }
}

function post(live, path, body, headers = {}) {
  return fetch(`http://127.0.0.1:${live.port}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Crisp-Token': live.token, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const commandEvent = (comment) => ({
  type: 'command', commands: ['quieter'], comment, variants: 2,
  element: { selector: '.hero h1', tag: 'h1', text: 'Supercharge', source: null },
});

test('binds to 127.0.0.1 only and writes session.json', async () => {
  await withServer(async ({ cwd, live }) => {
    assert.equal(live.server.address().address, '127.0.0.1');
    const session = JSON.parse(readFileSync(join(cwd, '.crisp', 'live', 'session.json'), 'utf8'));
    assert.equal(session.port, live.port);
    assert.equal(session.token, live.token);
    assert.equal(session.pid, process.pid);
    assert.ok(session.startedAt);
    assert.ok(existsSync(join(cwd, '.crisp', 'live', '.gitignore')));
  });
});

test('overlay is served without a token, with port and token baked in', async () => {
  await withServer(async ({ live, base }) => {
    const res = await fetch(`${base}/overlay.js`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /javascript/);
    const js = await res.text();
    assert.ok(js.includes(`'${live.token}'`));
    assert.ok(js.includes(`'${live.port}'`));
    assert.ok(!js.includes('__CRISP_TOKEN__'));
  });
});

test('every other endpoint needs the token (401 without, or with a wrong one)', async () => {
  await withServer(async ({ live, base }) => {
    assert.equal((await fetch(`${base}/events`)).status, 401);
    assert.equal((await fetch(`${base}/health`)).status, 401);
    assert.equal((await post(live, '/events', commandEvent('x'), { 'X-Crisp-Token': 'nope' })).status, 401);
    assert.equal((await post(live, '/responses', { eventId: 'evt_1', kind: 'done' }, { 'X-Crisp-Token': '' })).status, 401);
    assert.equal((await fetch(`${base}/events`, { headers: { 'X-Crisp-Token': live.token } })).status, 200);
  });
});

test('events append in order and next claims oldest first, then exits 3', async () => {
  await withServer(async ({ cwd, live }) => {
    for (const c of ['first', 'second']) assert.equal((await post(live, '/events', commandEvent(c))).status, 201);
    const lines = readFileSync(join(cwd, '.crisp', 'live', 'events.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l));
    assert.deepEqual(lines.map(e => [e.id, e.status, e.comment]), [['evt_1', 'pending', 'first'], ['evt_2', 'pending', 'second']]);

    const a = await cli(['next', '--json'], cwd);
    assert.equal(a.code, 0, a.stderr);
    assert.equal(JSON.parse(a.stdout).comment, 'first');
    assert.equal(JSON.parse(a.stdout).status, 'claimed');
    const b = await cli(['next', '--json'], cwd);
    assert.equal(JSON.parse(b.stdout).comment, 'second');
    const c = await cli(['next', '--json'], cwd);
    assert.equal(c.code, 3);
  });
});

test('rejects unknown event types and client-chosen ids', async () => {
  await withServer(async ({ live }) => {
    assert.equal((await post(live, '/events', { type: 'exec', cmd: 'rm -rf /' })).status, 400);
    const res = await post(live, '/events', { ...commandEvent('x'), id: 'evt_999', status: 'responded' });
    const saved = await res.json();
    assert.equal(saved.id, 'evt_1');
    assert.equal(saved.status, 'pending');
  });
});

test('respond round-trip is visible to GET /events', async () => {
  await withServer(async ({ cwd, live, base }) => {
    await post(live, '/events', commandEvent('make it calmer'));
    await cli(['next', '--json'], cwd);
    const r = await cli(['respond', 'evt_1', '--variants', 'a,b,c', '--note', 'b drops the glow, c drops the gradient'], cwd);
    assert.equal(r.code, 0, r.stderr);

    const data = await (await fetch(`${base}/events?since=0`, { headers: { 'X-Crisp-Token': live.token } })).json();
    assert.equal(data.responses.length, 1);
    assert.deepEqual(data.responses[0].variants, ['a', 'b', 'c']);
    assert.equal(data.responses[0].eventId, 'evt_1');
    assert.equal(data.events[0].status, 'responded');
    assert.equal(data.pending, 0);

    // since= filters to newer records only
    const later = await (await fetch(`${base}/events?since=${data.lastSeq}`, { headers: { 'X-Crisp-Token': live.token } })).json();
    assert.equal(later.responses.length, 0);
    assert.equal(later.events.length, 0);

    const bad = await cli(['respond', 'evt_1', '--variants', 'z'], cwd);
    assert.equal(bad.code, 2);
    const missing = await cli(['respond', 'evt_404', '--done'], cwd);
    assert.equal(missing.code, 1);
  });
});

test('next and respond fall back to the files when the server is down', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'crisp-live-'));
  try {
    const live = await startServer({ cwd, port: 0 });
    await post(live, '/events', commandEvent('offline'));
    await live.close();
    assert.equal(existsSync(join(cwd, '.crisp', 'live', 'session.json')), false);
    const n = await cli(['next', '--json'], cwd);
    assert.equal(JSON.parse(n.stdout).comment, 'offline');
    const r = await cli(['respond', 'evt_1', '--done'], cwd);
    assert.equal(r.code, 0, r.stderr);
    assert.match(readFileSync(join(cwd, '.crisp', 'live', 'responses.jsonl'), 'utf8'), /"kind":"done"/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('bodies over 2 MB are refused with 413', async () => {
  await withServer(async ({ live }) => {
    const big = JSON.stringify({ ...commandEvent('x'), screenshot: 'a'.repeat(MAX_BODY_BYTES + 10) });
    const res = await post(live, '/events', big).catch(err => ({ status: 'reset', err }));
    // Either a clean 413 or a reset after the server stopped reading; never accepted.
    assert.ok(res.status === 413 || res.status === 'reset', `got ${res.status}`);
    const ok = await post(live, '/events', { ...commandEvent('small'), screenshot: 'a'.repeat(1024 * 1024) });
    assert.equal(ok.status, 201);
  });
});

test('CORS: localhost origins allowed, other origins rejected, host header checked', async () => {
  await withServer(async ({ live, base }) => {
    const pre = await fetch(`${base}/events`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST' } });
    assert.equal(pre.status, 204);
    assert.equal(pre.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.match(pre.headers.get('access-control-allow-headers'), /X-Crisp-Token/);

    const evil = await fetch(`${base}/events`, { method: 'OPTIONS', headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST' } });
    assert.equal(evil.status, 403);
    assert.equal(evil.headers.get('access-control-allow-origin'), null);

    const evilPost = await post(live, '/events', commandEvent('x'), { Origin: 'https://evil.example' });
    assert.equal(evilPost.status, 403);
    const nullOrigin = await post(live, '/events', commandEvent('x'), { Origin: 'null' });
    assert.equal(nullOrigin.status, 403);

    const remoteReferer = await fetch(`${base}/overlay.js`, { headers: { Referer: 'https://evil.example/page' } });
    assert.equal(remoteReferer.status, 403);

    // DNS rebinding: a request that reaches the socket under a foreign Host name is refused.
    const status = await new Promise((resolve, reject) => {
      http.get({ host: '127.0.0.1', port: live.port, path: '/overlay.js', headers: { Host: `evil.example:${live.port}` } }, res => { res.resume(); resolve(res.statusCode); }).on('error', reject);
    });
    assert.equal(status, 403);
  });
});

test('status and stop', async () => {
  await withServer(async ({ cwd, live }) => {
    await post(live, '/events', commandEvent('x'));
    const s = await cli(['status', '--json'], cwd);
    const info = JSON.parse(s.stdout);
    assert.equal(info.running, true);
    assert.equal(info.events.pending, 1);
    const stop = await cli(['stop'], cwd);
    assert.equal(stop.code, 0);
    await live.closed;
    assert.equal(existsSync(join(cwd, '.crisp', 'live', 'session.json')), false);
  });
});
