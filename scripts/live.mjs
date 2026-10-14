/**
 * scripts/live.mjs
 *
 * `crisp live` - the agent's side of CRISP Live.
 *
 *   crisp live start [--port 4477] [--allow-origin <origin>]   run the bridge (foreground)
 *   crisp live next [--json]                                    claim the oldest pending event (exit 3 if none)
 *   crisp live respond <eventId> --variants a,b,c [--note text]
 *   crisp live respond <eventId> --done [--note text]
 *   crisp live respond <eventId> --error --note text
 *   crisp live status [--json]
 *   crisp live stop
 *
 * `next` and `respond` talk to the running server (port and token from
 * .crisp/live/session.json). If the server is down they read and write the
 * files directly, so no event is lost; the overlay sees file-written
 * responses once the server is back.
 *
 * Exit codes: 0 ok, 1 error, 2 bad arguments, 3 nothing pending (`next`).
 */

import { readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { startServer, createStore, liveDir, validateResponse, DEFAULT_PORT } from './live/server.mjs';

const USAGE = `crisp live start [--port ${DEFAULT_PORT}] [--allow-origin <origin>]
crisp live next [--json]
crisp live respond <eventId> --variants a,b,c [--note <text>]
crisp live respond <eventId> --done [--note <text>]
crisp live respond <eventId> --error --note <text>
crisp live status [--json]
crisp live stop`;

function parseArgs(args) {
  const out = { _: [], flags: {}, multi: {} };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const [key, inline] = a.slice(2).split(/=(.*)/s);
    const takesValue = ['port', 'variants', 'note', 'allow-origin', 'cwd'].includes(key);
    const value = inline ?? (takesValue ? args[++i] : true);
    if (takesValue && (value === undefined || value === true)) throw new Error(`--${key} needs a value`);
    out.flags[key] = value;
    (out.multi[key] ??= []).push(value);
  }
  return out;
}

export function readSession(cwd) {
  const file = join(liveDir(cwd), 'session.json');
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
}

// Returns { ok, status, body } from the running server, or null when it is unreachable.
async function callServer(session, method, path, body) {
  if (!session) return null;
  try {
    const res = await fetch(`http://127.0.0.1:${session.port}${path}`, {
      method,
      headers: { 'X-Crisp-Token': session.token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(3000),
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: text ? JSON.parse(text) : null };
  } catch {
    return null;
  }
}

/** Claim the oldest pending event. Returns { event, via } or { event: null }. */
export async function claimNext({ cwd = process.cwd() } = {}) {
  const res = await callServer(readSession(cwd), 'POST', '/claim');
  if (res) {
    if (res.status === 204) return { event: null, via: 'server' };
    if (res.ok) return { event: res.body, via: 'server' };
    throw new Error(res.body?.error ?? `server answered ${res.status}`);
  }
  return { event: createStore(cwd).claimNext(), via: 'files' };
}

/** Post a response for an event. Returns { response, via }. */
export async function respond({ cwd = process.cwd(), eventId, kind, variants, note }) {
  const body = { eventId, kind, ...(variants ? { variants } : {}), ...(note ? { note } : {}) };
  const problem = validateResponse(body);
  if (problem) throw Object.assign(new Error(problem), { usage: true });
  const res = await callServer(readSession(cwd), 'POST', '/responses', body);
  if (res) {
    if (res.ok) return { response: res.body, via: 'server' };
    throw new Error(res.body?.error ?? `server answered ${res.status}`);
  }
  const store = createStore(cwd);
  if (!store.readEvents().some(e => e.id === eventId)) throw new Error(`no event ${eventId} in ${store.eventsFile}`);
  return { response: store.appendResponse(body), via: 'files' };
}

function printEvent(e) {
  const lines = [`${e.id}  ${e.type}  (${e.ts})`];
  if (e.commands?.length) lines.push(`commands: ${e.commands.join(', ')}`);
  if (e.comment) lines.push(`comment:  ${e.comment}`);
  if (e.description) lines.push(`describe: ${e.description}`);
  if (e.variants) lines.push(`variants: ${e.variants}`);
  if (e.type === 'accept') lines.push(`accept:   variant ${e.variant} of ${e.eventId}`);
  if (e.type === 'reject') lines.push(`reject:   ${e.eventId}`);
  if (e.type === 'edit-text') lines.push(`old text: ${JSON.stringify(e.oldText)}`, `new text: ${JSON.stringify(e.newText)}`);
  const el = e.element ?? e.anchor;
  if (el?.selector) lines.push(`selector: ${el.selector}`);
  const src = el?.source;
  lines.push(`source:   ${src ? `${src.file}${src.line ? `:${src.line}` : ''} (via ${src.via}${src.depth ? `, ancestor depth ${src.depth}` : ''})` : 'none - search by text and selector'}`);
  if (e.page?.url) lines.push(`page:     ${e.page.url}`);
  lines.push('Use --json for the full event (outerHTML, computed styles, box).');
  console.log(lines.join('\n'));
}

async function start(opts) {
  const cwd = opts.flags.cwd ?? process.cwd();
  const port = opts.flags.port !== undefined ? Number(opts.flags.port) : DEFAULT_PORT;
  if (!Number.isInteger(port) || port < 0 || port > 65535) { console.error(`Invalid --port: ${opts.flags.port}`); return 2; }

  const existing = readSession(cwd);
  if (existing && (await callServer(existing, 'GET', '/health'))?.ok) {
    console.log(`CRISP Live is already running on port ${existing.port} (pid ${existing.pid}).`);
    console.log(`<script src="http://127.0.0.1:${existing.port}/overlay.js" defer></script>`);
    return 0;
  }

  let live;
  try {
    live = await startServer({ cwd, port, allowOrigins: opts.multi['allow-origin'] ?? [] });
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use by another program. Try: crisp live start --port ${port + 1}`);
      return 1;
    }
    throw err;
  }

  const tag = `<script src="http://127.0.0.1:${live.port}/overlay.js" defer></script>`;
  console.log(`CRISP Live bridge on http://127.0.0.1:${live.port} (local only). State: ${liveDir(cwd)}`);
  console.log('');
  console.log('Add this to your dev page, behind a development-only guard:');
  console.log(`  ${tag}`);
  console.log('');
  console.log("  Vite:     a tiny plugin with apply: 'serve' and transformIndexHtml, so builds never include it");
  console.log("  Next.js:  app/layout.tsx: {process.env.NODE_ENV === 'development' && <script src=\"...\" defer />}");
  console.log('  Plain:    paste the tag before </body> and delete it when you stop');
  console.log('');
  console.log('Then pick elements in the browser. Your agent reads them with: crisp live next --json');
  console.log('Stop with Ctrl+C or: crisp live stop');

  const shutdown = () => { live.close(); };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  await live.closed;
  return 0;
}

async function next(opts) {
  const cwd = opts.flags.cwd ?? process.cwd();
  const { event, via } = await claimNext({ cwd });
  if (!event) {
    if (opts.flags.json) console.log('null');
    else console.error('No pending CRISP Live events.');
    return 3;
  }
  if (opts.flags.json) console.log(JSON.stringify(event, null, 2));
  else printEvent(event);
  if (via === 'files' && !opts.flags.json) console.error('(server not running: claimed from .crisp/live/events.jsonl directly)');
  return 0;
}

async function respondCmd(opts) {
  const cwd = opts.flags.cwd ?? process.cwd();
  const eventId = opts._[1];
  if (!eventId) { console.error(`Usage:\n${USAGE}`); return 2; }
  const modes = ['variants', 'done', 'error'].filter(k => opts.flags[k] !== undefined);
  if (modes.length !== 1) { console.error('Give exactly one of --variants a,b,c, --done, or --error'); return 2; }
  const kind = modes[0];
  const variants = kind === 'variants' ? String(opts.flags.variants).split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : undefined;
  const note = typeof opts.flags.note === 'string' ? opts.flags.note : undefined;
  try {
    const { response, via } = await respond({ cwd, eventId, kind, variants, note });
    console.log(`${response.id}: ${kind}${variants ? ` ${variants.join(',')}` : ''} for ${eventId}${via === 'files' ? ' (written to file; the server is not running)' : ''}`);
    return 0;
  } catch (err) {
    console.error(err.message);
    return err.usage ? 2 : 1;
  }
}

async function status(opts) {
  const cwd = opts.flags.cwd ?? process.cwd();
  const session = readSession(cwd);
  const health = await callServer(session, 'GET', '/health');
  const store = createStore(cwd);
  const counts = {};
  for (const e of store.readEvents()) counts[e.status] = (counts[e.status] ?? 0) + 1;
  const info = {
    running: !!health?.ok,
    port: session?.port ?? null,
    pid: session?.pid ?? null,
    startedAt: session?.startedAt ?? null,
    events: counts,
    responses: store.readResponses().length,
    dir: store.dir,
  };
  if (opts.flags.json) { console.log(JSON.stringify(info, null, 2)); return 0; }
  console.log(info.running ? `Running on 127.0.0.1:${info.port} (pid ${info.pid}, since ${info.startedAt})` : `Not running${session ? ' (stale session.json)' : ''}`);
  console.log(`Events: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ') || 'none'}; responses: ${info.responses}`);
  return 0;
}

async function stop(opts) {
  const cwd = opts.flags.cwd ?? process.cwd();
  const session = readSession(cwd);
  if (!session) { console.log('CRISP Live is not running.'); return 0; }
  const res = await callServer(session, 'POST', '/shutdown');
  if (!res) {
    try { process.kill(session.pid, 'SIGTERM'); } catch { /* already gone */ }
  }
  rmSync(join(liveDir(cwd), 'session.json'), { force: true });
  console.log('CRISP Live stopped. Remove the overlay script tag from your page now.');
  return 0;
}

export async function runLive(args = []) {
  let opts;
  try { opts = parseArgs(args); } catch (err) { console.error(err.message); return 2; }
  const cmd = opts._[0];
  try {
    if (cmd === 'start') return await start(opts);
    if (cmd === 'next') return await next(opts);
    if (cmd === 'respond') return await respondCmd(opts);
    if (cmd === 'status') return await status(opts);
    if (cmd === 'stop') return await stop(opts);
  } catch (err) {
    console.error(`crisp live ${cmd}: ${err.message}`);
    return 1;
  }
  console.error(`Usage:\n${USAGE}`);
  return cmd === undefined || cmd === 'help' ? 0 : 2;
}
