/**
 * scripts/live/server.mjs
 *
 * CRISP Live event bridge: a tiny local HTTP server that carries design-edit
 * events from the in-page overlay (scripts/live/overlay.js) to the user's
 * coding agent, and carries the agent's responses back.
 *
 * Local only, by design:
 *   - binds to 127.0.0.1, never 0.0.0.0, so nothing on the network can reach it
 *   - every request except GET /overlay.js needs the session token (X-Crisp-Token)
 *   - CORS answers only localhost origins, and the Host header must be local,
 *     which blocks DNS-rebinding tricks from a remote page
 *   - bodies over 2 MB are refused
 *   - events are data. Nothing in an event is ever executed by this server.
 *
 * State lives in <cwd>/.crisp/live/:
 *   session.json      {port, token, startedAt, pid} while the server runs
 *   events.jsonl      one event per line (overlay -> agent)
 *   responses.jsonl   one response per line (agent -> overlay)
 *
 * Events and responses share one increasing `seq`, so the overlay can poll
 * GET /events?since=<seq> and receive everything newer in order.
 */

import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DEFAULT_PORT = 4477;
export const MAX_BODY_BYTES = 2 * 1024 * 1024;
export const EVENT_TYPES = ['command', 'comment', 'edit-text', 'insert', 'accept', 'reject'];
export const RESPONSE_KINDS = ['variants', 'done', 'error'];
export const VARIANT_IDS = /^[a-e]$/;

// ─── File store (shared with scripts/live.mjs for the server-down fallback) ───

export function liveDir(cwd) {
  return join(cwd, '.crisp', 'live');
}

function readJsonl(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
}

export function createStore(cwd) {
  const dir = liveDir(cwd);
  const eventsFile = join(dir, 'events.jsonl');
  const responsesFile = join(dir, 'responses.jsonl');

  function ensureDir() {
    if (existsSync(dir)) return;
    mkdirSync(dir, { recursive: true });
    // The session token and page snapshots never belong in git.
    writeFileSync(join(dir, '.gitignore'), '*\n');
  }

  const readEvents = () => readJsonl(eventsFile);
  const readResponses = () => readJsonl(responsesFile);

  function nextSeq() {
    let max = 0;
    for (const r of [...readEvents(), ...readResponses()]) if (r.seq > max) max = r.seq;
    return max + 1;
  }

  function appendEvent(payload) {
    ensureDir();
    const seq = nextSeq();
    const { id: _i, seq: _s, ts: _t, status: _st, ...rest } = payload;
    const event = { id: `evt_${seq}`, seq, ts: new Date().toISOString(), status: 'pending', ...rest };
    appendFileSync(eventsFile, JSON.stringify(event) + '\n');
    return event;
  }

  function writeEvents(events) {
    ensureDir();
    const tmp = `${eventsFile}.${process.pid}.tmp`;
    writeFileSync(tmp, events.map(e => JSON.stringify(e)).join('\n') + (events.length ? '\n' : ''));
    renameSync(tmp, eventsFile);
  }

  function setStatus(id, status) {
    const events = readEvents();
    const event = events.find(e => e.id === id);
    if (!event) return null;
    event.status = status;
    writeEvents(events);
    return event;
  }

  // Oldest pending event becomes "claimed" so a second `next` never returns it again.
  function claimNext() {
    const events = readEvents();
    const event = events.find(e => e.status === 'pending');
    if (!event) return null;
    event.status = 'claimed';
    event.claimedAt = new Date().toISOString();
    writeEvents(events);
    return event;
  }

  function appendResponse({ eventId, kind, variants, note }) {
    ensureDir();
    const seq = nextSeq();
    const response = { id: `res_${seq}`, seq, ts: new Date().toISOString(), eventId, kind };
    if (variants) response.variants = variants;
    if (note) response.note = note;
    appendFileSync(responsesFile, JSON.stringify(response) + '\n');
    setStatus(eventId, kind === 'error' ? 'failed' : 'responded');
    return response;
  }

  return { dir, eventsFile, responsesFile, ensureDir, readEvents, readResponses, nextSeq, appendEvent, setStatus, claimNext, appendResponse };
}

// ─── Validation ───

export function validateResponse(body) {
  if (!body || typeof body !== 'object') return 'body must be a JSON object';
  if (typeof body.eventId !== 'string' || !body.eventId) return 'eventId is required';
  if (!RESPONSE_KINDS.includes(body.kind)) return `kind must be one of ${RESPONSE_KINDS.join(', ')}`;
  if (body.kind === 'variants') {
    if (!Array.isArray(body.variants) || body.variants.length < 1 || body.variants.length > 5) return 'variants must list 1 to 5 ids';
    if (!body.variants.every(v => typeof v === 'string' && VARIANT_IDS.test(v))) return 'variant ids are single letters a to e (the crisp-variants convention)';
  }
  if (body.note !== undefined && typeof body.note !== 'string') return 'note must be a string';
  return null;
}

function validateEvent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'body must be a JSON object';
  if (!EVENT_TYPES.includes(body.type)) return `type must be one of ${EVENT_TYPES.join(', ')}`;
  if ((body.type === 'accept' || body.type === 'reject') && typeof body.eventId !== 'string') return `${body.type} needs the eventId it answers`;
  if (body.type === 'edit-text' && (typeof body.oldText !== 'string' || typeof body.newText !== 'string')) return 'edit-text needs oldText and newText';
  return null;
}

// What the overlay needs to draw its indicator and variant strip; the heavy
// fields (outerHTML, styles) stay on disk for the agent.
function summarise(event) {
  const { id, seq, ts, type, status, eventId, variant, commands, comment, element } = event;
  return {
    id, seq, ts, type, status,
    ...(eventId ? { eventId } : {}),
    ...(variant ? { variant } : {}),
    ...(commands ? { commands } : {}),
    ...(comment ? { comment: String(comment).slice(0, 140) } : {}),
    ...(element?.selector ? { selector: element.selector } : {}),
  };
}

// ─── Origin and host checks ───

const LOCAL_HOSTNAME = /^(localhost|127\.0\.0\.1|\[::1\]|[a-z0-9-]+\.localhost)$/i;

export function isLocalOrigin(origin, extra = []) {
  if (!origin || origin === 'null') return false;
  if (extra.includes(origin)) return true;
  try {
    const url = new URL(origin);
    return (url.protocol === 'http:' || url.protocol === 'https:') && LOCAL_HOSTNAME.test(url.hostname);
  } catch {
    return false;
  }
}

function hostIsLocal(hostHeader, port) {
  if (!hostHeader) return false;
  return [`127.0.0.1:${port}`, `localhost:${port}`].includes(hostHeader.toLowerCase());
}

function tokensMatch(given, expected) {
  if (typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ─── Server ───

/**
 * Start the bridge. Resolves once listening.
 * @param {object} opts
 * @param {string} [opts.cwd]            project root; state goes in <cwd>/.crisp/live
 * @param {number} [opts.port]           0 picks a free port (tests)
 * @param {string[]} [opts.allowOrigins] extra exact origins, e.g. http://192.168.1.20:5173
 * @param {boolean} [opts.writeSession]  default true
 */
export function startServer({ cwd = process.cwd(), port = DEFAULT_PORT, allowOrigins = [], writeSession = true } = {}) {
  const store = createStore(cwd);
  const token = randomBytes(24).toString('hex');
  const overlaySource = readFileSync(join(__dirname, 'overlay.js'), 'utf8');
  let actualPort = port;

  function send(res, status, body, headers = {}) {
    const isText = typeof body === 'string';
    res.writeHead(status, {
      'Content-Type': isText ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    });
    res.end(isText ? body : JSON.stringify(body));
  }

  function readBody(req) {
    return new Promise((resolve, reject) => {
      const declared = Number(req.headers['content-length']);
      if (declared > MAX_BODY_BYTES) return reject(Object.assign(new Error('body too large'), { status: 413 }));
      const chunks = [];
      let size = 0;
      req.on('data', chunk => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
          req.removeAllListeners('data');
          reject(Object.assign(new Error('body too large'), { status: 413 }));
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'));
        } catch {
          reject(Object.assign(new Error('body is not valid JSON'), { status: 400 }));
        }
      });
      req.on('error', reject);
    });
  }

  async function handle(req, res) {
    const url = new URL(req.url, `http://127.0.0.1:${actualPort}`);
    const origin = req.headers.origin;
    const cors = {};

    if (!hostIsLocal(req.headers.host, actualPort)) return send(res, 403, { error: 'host must be 127.0.0.1 or localhost' });
    if (origin !== undefined) {
      if (!isLocalOrigin(origin, allowOrigins)) return send(res, 403, { error: 'origin not allowed: CRISP Live answers localhost pages only' });
      cors['Access-Control-Allow-Origin'] = origin;
      cors.Vary = 'Origin';
    }

    if (req.method === 'OPTIONS') {
      return send(res, 204, '', {
        ...cors,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Crisp-Token',
        'Access-Control-Max-Age': '600',
        ...(req.headers['access-control-request-private-network'] ? { 'Access-Control-Allow-Private-Network': 'true' } : {}),
      });
    }

    if (req.method === 'GET' && url.pathname === '/overlay.js') {
      // A script tag sends no Origin, so check the Referer when there is one:
      // a remote page has no business loading the overlay.
      const referer = req.headers.referer;
      let refererOrigin = null;
      try { refererOrigin = referer ? new URL(referer).origin : null; } catch { refererOrigin = 'invalid'; }
      if (referer && !isLocalOrigin(refererOrigin, allowOrigins)) return send(res, 403, 'CRISP Live overlay is for localhost pages only');
      const js = overlaySource
        .replace('__CRISP_PORT__', String(actualPort))
        .replace('__CRISP_TOKEN__', token);
      return send(res, 200, js, { ...cors, 'Content-Type': 'application/javascript; charset=utf-8' });
    }

    if (!tokensMatch(req.headers['x-crisp-token'], token)) return send(res, 401, { error: 'missing or wrong X-Crisp-Token' }, cors);

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return send(res, 200, { ok: true, name: 'crisp-live', port: actualPort, pid: process.pid }, cors);
      }

      if (req.method === 'GET' && url.pathname === '/events') {
        const since = Number(String(url.searchParams.get('since') ?? '0').replace(/^\D+_/, '')) || 0;
        const events = store.readEvents();
        const responses = store.readResponses();
        const lastSeq = Math.max(0, ...events.map(e => e.seq), ...responses.map(r => r.seq));
        return send(res, 200, {
          events: events.filter(e => e.seq > since).map(summarise),
          responses: responses.filter(r => r.seq > since),
          pending: events.filter(e => e.status === 'pending' || e.status === 'claimed').length,
          lastSeq,
        }, cors);
      }

      if (req.method === 'POST' && url.pathname === '/events') {
        const body = await readBody(req);
        const problem = validateEvent(body);
        if (problem) return send(res, 400, { error: problem }, cors);
        return send(res, 201, summarise(store.appendEvent(body)), cors);
      }

      if (req.method === 'POST' && url.pathname === '/claim') {
        const event = store.claimNext();
        return event ? send(res, 200, event, cors) : send(res, 204, '', cors);
      }

      if (req.method === 'POST' && url.pathname === '/responses') {
        const body = await readBody(req);
        const problem = validateResponse(body);
        if (problem) return send(res, 400, { error: problem }, cors);
        if (!store.readEvents().some(e => e.id === body.eventId)) return send(res, 404, { error: `no event ${body.eventId}` }, cors);
        return send(res, 201, store.appendResponse(body), cors);
      }

      if (req.method === 'POST' && url.pathname === '/shutdown') {
        send(res, 200, { ok: true }, cors);
        setImmediate(() => close());
        return;
      }

      return send(res, 404, { error: 'not found' }, cors);
    } catch (err) {
      const status = err.status ?? 500;
      // Stop reading an oversized upload; the client gets 413 and the socket closes.
      return send(res, status, { error: err.message }, { ...cors, ...(status === 413 ? { Connection: 'close' } : {}) });
    }
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch(err => {
      if (!res.headersSent) send(res, 500, { error: err.message });
    });
  });

  let closed = false;
  function close() {
    if (closed) return Promise.resolve();
    closed = true;
    if (writeSession) {
      const sessionFile = join(store.dir, 'session.json');
      try {
        const current = JSON.parse(readFileSync(sessionFile, 'utf8'));
        if (current.token === token) rmSync(sessionFile, { force: true });
      } catch { /* already gone */ }
    }
    return new Promise(resolve => {
      server.close(() => resolve());
      server.closeAllConnections?.();
    });
  }

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      actualPort = server.address().port;
      const session = { port: actualPort, token, startedAt: new Date().toISOString(), pid: process.pid };
      if (writeSession) {
        store.ensureDir();
        writeFileSync(join(store.dir, 'session.json'), JSON.stringify(session, null, 2) + '\n', { mode: 0o600 });
      }
      resolve({ server, port: actualPort, token, store, session, close, closed: new Promise(r => server.once('close', r)) });
    });
  });
}
