/*
 * CRISP Live overlay. Served by scripts/live/server.mjs at /overlay.js with the
 * port and session token filled in. Dev only: add the script tag behind a
 * development guard and remove it when the session ends.
 *
 * Everything renders inside a closed Shadow DOM, so the host app's CSS cannot
 * restyle the toolbar and the toolbar's CSS cannot leak into the app. The
 * overlay only reads the page and posts JSON to the local bridge; it never
 * runs code it receives.
 */
(() => {
  'use strict';
  if (window.__crispLiveLoaded) return;
  Object.defineProperty(window, '__crispLiveLoaded', { value: true });

  const PORT = '__CRISP_PORT__';
  const TOKEN = '__CRISP_TOKEN__';
  const BASE = 'http://127.0.0.1:' + PORT;
  const POLL_MS = 1500;
  const MAX_HTML = 4000;
  const MAX_TEXT = 400;

  const COMMANDS = [
    ['bolder', 'Bolder'],
    ['quieter', 'Quieter'],
    ['simpler', 'Simpler'],
    ['fix-layout', 'Fix layout'],
    ['animate', 'Animate'],
    ['adapt-mobile', 'Adapt for mobile'],
    ['rewrite-copy', 'Rewrite copy'],
    ['check-a11y', 'Check accessibility'],
  ];
  const COMMAND_LABEL = Object.fromEntries(COMMANDS);

  const STYLE_KEYS = [
    'display', 'position', 'width', 'height', 'margin', 'padding', 'gap',
    'flex-direction', 'justify-content', 'align-items', 'grid-template-columns',
    'color', 'background-color', 'background-image', 'border', 'border-radius', 'box-shadow',
    'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-align', 'text-transform',
    'opacity', 'transition', 'animation-name',
  ];

  // ─── API ───

  function api(method, path, body) {
    const headers = { 'X-Crisp-Token': TOKEN };
    if (body) headers['Content-Type'] = 'application/json';
    return fetch(BASE + path, {
      method, headers, mode: 'cors', credentials: 'omit', cache: 'no-store',
      body: body ? JSON.stringify(body) : undefined,
    }).then(r => {
      if (!r.ok) throw new Error('CRISP Live bridge answered ' + r.status);
      return r.status === 204 ? null : r.json();
    });
  }

  // ─── Page reading ───

  const host = document.createElement('crisp-live');
  const isOurs = node => node === host;

  function unique(sel) {
    try { return document.querySelectorAll(sel).length === 1; } catch (e) { return false; }
  }

  // Generated ids and hashed class names change between builds; never anchor on them.
  const looksGenerated = s => /^(css|sc|jsx|svelte|emotion|chakra|mui)-/i.test(s) || /^[:_]|^[0-9]|:r\w+:/.test(s) || (s.length >= 6 && /[a-z][0-9]|[0-9][a-z]/i.test(s) && /[0-9]/.test(s) && !/^[a-z]+-[0-9]+$/.test(s));

  function cssSelector(el) {
    if (el.id && !looksGenerated(el.id) && unique('#' + CSS.escape(el.id))) return '#' + CSS.escape(el.id);
    for (const attr of ['data-testid', 'data-test', 'data-cy', 'data-crisp-id']) {
      const v = el.getAttribute(attr);
      if (v) {
        const sel = '[' + attr + '="' + v.replace(/["\\]/g, '\\$&') + '"]';
        if (unique(sel)) return sel;
      }
    }
    const parts = [];
    for (let node = el; node && node.nodeType === 1 && node !== document.documentElement; node = node.parentElement) {
      const tag = node.localName;
      if (node !== el && node.id && !looksGenerated(node.id)) {
        parts.unshift('#' + CSS.escape(node.id));
        const sel = parts.join(' > ');
        if (unique(sel)) return sel;
        continue;
      }
      let part = tag;
      const classes = Array.from(node.classList).filter(c => /^[a-zA-Z][\w-]*$/.test(c) && c.length <= 32 && !looksGenerated(c)).slice(0, 2);
      part += classes.map(c => '.' + CSS.escape(c)).join('');
      const parent = node.parentElement;
      if (parent) {
        const same = Array.from(parent.children).filter(c => c.localName === tag);
        if (same.length > 1) part += ':nth-of-type(' + (same.indexOf(node) + 1) + ')';
      }
      parts.unshift(part);
      const sel = parts.join(' > ');
      if (unique(sel)) return sel;
    }
    return parts.join(' > ');
  }

  function parseLoc(value, via, depth) {
    const m = String(value).match(/^(.*?)(?::(\d+))?(?::(\d+))?$/);
    return { file: m[1], line: m[2] ? Number(m[2]) : null, column: m[3] ? Number(m[3]) : null, via, depth };
  }

  // Source location, nearest first. depth 0 means the element itself; higher
  // means the location belongs to an ancestor, so treat it as approximate.
  function sourceOf(el) {
    let depth = 0;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement, depth++) {
      for (const attr of ['data-crisp-src', 'data-source', 'data-v-inspector', 'data-locator']) {
        const v = n.getAttribute(attr);
        if (v) return parseLoc(v, attr, depth);
      }
      const ip = n.getAttribute('data-inspector-relative-path');
      if (ip) return { file: ip, line: Number(n.getAttribute('data-inspector-line')) || null, column: Number(n.getAttribute('data-inspector-column')) || null, via: 'data-inspector', depth };
      const fiberKey = Object.keys(n).find(k => k.startsWith('__reactFiber$'));
      if (fiberKey) {
        for (let f = n[fiberKey]; f; f = f.return) {
          const s = f._debugSource;
          if (s && s.fileName) {
            const owner = f._debugOwner && f._debugOwner.type;
            return { file: s.fileName, line: s.lineNumber || null, column: s.columnNumber || null, via: 'react-fiber', component: owner && (owner.displayName || owner.name) || null, depth };
          }
        }
      }
      const vue = n.__vueParentComponent;
      if (vue && vue.type && vue.type.__file) return { file: vue.type.__file, line: null, column: null, via: 'vue', depth };
      const svelte = n.__svelte_meta;
      if (svelte && svelte.loc) return { file: svelte.loc.file, line: svelte.loc.line + 1, column: svelte.loc.column + 1, via: 'svelte', depth };
    }
    return null;
  }

  function truncate(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n) + '…[truncated ' + (s.length - n) + ' chars]' : s;
  }

  function describe(el) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const styles = {};
    for (const k of STYLE_KEYS) styles[k] = cs.getPropertyValue(k);
    return {
      selector: cssSelector(el),
      tag: el.localName,
      id: el.id || null,
      classes: Array.from(el.classList),
      role: el.getAttribute('role'),
      ariaLabel: el.getAttribute('aria-label'),
      text: truncate((el.innerText || el.textContent || '').trim(), MAX_TEXT),
      outerHTML: truncate(el.outerHTML, MAX_HTML),
      styles,
      box: { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height), pageX: Math.round(r.left + scrollX), pageY: Math.round(r.top + scrollY) },
      source: sourceOf(el),
    };
  }

  function currentVariant() {
    return new URLSearchParams(location.search).get('variant') || 'a';
  }

  function pageInfo() {
    return {
      url: location.href,
      title: document.title,
      variant: currentVariant(),
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio, scrollX: Math.round(scrollX), scrollY: Math.round(scrollY) },
      colorScheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    };
  }

  function label(el) {
    let s = el.localName;
    if (el.id) s += '#' + el.id;
    else if (el.classList.length) s += '.' + Array.from(el.classList).slice(0, 2).join('.');
    return s.length > 48 ? s.slice(0, 47) + '…' : s;
  }

  // ─── Shadow DOM ───

  const root = host.attachShadow({ mode: 'closed' });
  host.style.setProperty('all', 'initial', 'important');
  host.style.setProperty('position', 'fixed', 'important');
  host.style.setProperty('inset', '0 auto auto 0', 'important');
  host.style.setProperty('width', '0', 'important');
  host.style.setProperty('height', '0', 'important');
  host.style.setProperty('z-index', '2147483647', 'important');
  host.setAttribute('data-crisp-live', '');

  root.innerHTML = `
<style>
  :host { all: initial; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  .root {
    --bg: #ffffff; --fg: #1b1c1f; --muted: #5c5f67; --line: #d8dade; --soft: #f1f2f4;
    --on: #1b1c1f; --on-fg: #ffffff; --focus: #1f56d6; --hl: #2f6bff;
    --ok: #237a48; --wait: #9a6700; --off: #80838b;
    font: 13px/1.4 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    color: var(--fg); -webkit-font-smoothing: antialiased;
  }
  @media (prefers-color-scheme: dark) {
    .root {
      --bg: #1c1d20; --fg: #ececee; --muted: #a3a6ae; --line: #34363c; --soft: #2a2c31;
      --on: #ececee; --on-fg: #141517; --focus: #8fb0ff; --hl: #6f9bff;
      --ok: #5cc28a; --wait: #e2b04a; --off: #8b8e96;
    }
  }
  .surface {
    background: var(--bg); color: var(--fg); border: 1px solid var(--line); border-radius: 10px;
    box-shadow: 0 1px 2px rgba(0,0,0,.08), 0 8px 28px rgba(0,0,0,.16); pointer-events: auto;
  }
  button, textarea { font: inherit; color: inherit; }
  button {
    min-height: 32px; padding: 0 12px; border: 0; border-radius: 6px; background: transparent; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
  }
  button:hover { background: var(--soft); }
  button:disabled { opacity: .45; cursor: not-allowed; }
  button[aria-pressed="true"], button[aria-current="true"] { background: var(--on); color: var(--on-fg); }
  :focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  .primary { background: var(--on); color: var(--on-fg); font-weight: 600; }
  .primary:hover { background: var(--on); opacity: .9; }
  .outline { border: 1px solid var(--line); }
  kbd { font: 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--muted); }
  code { font: 12px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; }

  .bar {
    position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%);
    display: flex; align-items: center; gap: 2px; padding: 4px;
  }
  .brand { padding: 0 10px 0 8px; font-weight: 600; letter-spacing: .01em; }
  .sep { width: 1px; align-self: stretch; margin: 4px 4px; background: var(--line); }
  .status { display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; color: var(--muted); white-space: nowrap; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--off); flex: none; }
  .dot[data-state="idle"] { background: var(--ok); }
  .dot[data-state="busy"] { background: var(--wait); }

  .panel {
    position: fixed; left: 50%; bottom: 64px; transform: translateX(-50%);
    width: min(440px, calc(100vw - 32px)); max-height: calc(100vh - 96px); overflow: auto; padding: 14px;
  }
  .head { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
  .head .what { flex: 1; min-width: 0; }
  .head code { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .src { color: var(--muted); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .chips button { border: 1px solid var(--line); min-height: 30px; padding: 0 10px; border-radius: 999px; }
  .field { display: block; margin-bottom: 12px; }
  .field span, .legend { display: block; margin-bottom: 4px; color: var(--muted); font-size: 12px; }
  textarea {
    width: 100%; min-height: 64px; resize: vertical; padding: 8px 10px;
    background: var(--bg); border: 1px solid var(--line); border-radius: 6px;
  }
  .row { display: flex; align-items: center; gap: 8px; }
  .row .grow { flex: 1; }
  .seg { display: inline-flex; border: 1px solid var(--line); border-radius: 6px; padding: 2px; gap: 2px; }
  .seg button { min-height: 28px; min-width: 32px; padding: 0 8px; justify-content: center; }
  .hint { color: var(--muted); font-size: 12px; }

  .strip {
    position: fixed; left: 50%; bottom: 64px; transform: translateX(-50%);
    display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding: 6px 6px 6px 12px;
    max-width: calc(100vw - 32px);
  }
  .strip .title { color: var(--muted); margin-right: 6px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .toast {
    position: fixed; left: 50%; bottom: 64px; transform: translateX(-50%);
    padding: 8px 12px; max-width: min(440px, calc(100vw - 32px));
  }
  .strip:not([hidden]) ~ .toast { bottom: 116px; }

  .hover, .selected, .draw {
    position: fixed; pointer-events: none; border-radius: 3px;
  }
  .hover { outline: 2px solid var(--hl); outline-offset: 1px; background: rgba(47,107,255,.08); box-shadow: 0 0 0 4px rgba(255,255,255,.5); }
  .selected { outline: 2px solid var(--hl); outline-offset: 1px; box-shadow: 0 0 0 4px rgba(0,0,0,.18); }
  .tag {
    position: fixed; pointer-events: none; padding: 2px 6px; border-radius: 4px;
    background: var(--hl); color: #fff; font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap;
  }
  .layer { position: fixed; inset: 0; cursor: crosshair; pointer-events: auto; background: rgba(0,0,0,.04); }
  .draw { border: 2px dashed var(--hl); background: rgba(47,107,255,.10); }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  @media (max-width: 520px) {
    .brand, .sep.optional, kbd { display: none; }
    .bar { bottom: 8px; }
    .status .text { max-width: 96px; overflow: hidden; text-overflow: ellipsis; }
  }
  @media (prefers-reduced-motion: no-preference) {
    .panel, .strip, .toast { animation: crisp-in .14s ease-out; }
    @keyframes crisp-in { from { opacity: 0; } to { opacity: 1; } }
  }
</style>
<div class="root">
  <div class="layer" hidden></div>
  <div class="hover" hidden></div>
  <div class="selected" hidden></div>
  <div class="draw" hidden></div>
  <div class="tag" hidden></div>

  <section class="panel surface" role="dialog" aria-modal="false" aria-labelledby="crisp-panel-title" hidden>
    <div class="head">
      <div class="what">
        <div id="crisp-panel-title" class="hint" data-ref="kind">Selected element</div>
        <code data-ref="name"></code>
        <div class="src" data-ref="src"></div>
      </div>
      <button type="button" class="outline" data-ref="parent" title="Select the parent element">Parent</button>
      <button type="button" data-ref="close" aria-label="Close panel">Close</button>
    </div>
    <div class="chips" role="group" aria-label="Commands" data-ref="chips"></div>
    <label class="field">
      <span data-ref="commentLabel">Comment (optional)</span>
      <textarea data-ref="comment" rows="3" placeholder="What should change, and why?"></textarea>
    </label>
    <div class="row">
      <div class="grow">
        <span class="legend" id="crisp-variants-legend">Variants</span>
        <div class="seg" role="radiogroup" aria-labelledby="crisp-variants-legend" data-ref="count"></div>
      </div>
      <button type="button" class="primary" data-ref="send" disabled>Send <kbd>Ctrl Enter</kbd></button>
    </div>
  </section>

  <div class="strip surface" role="region" aria-label="Variants from your agent" hidden>
    <span class="title" data-ref="stripTitle"></span>
    <span data-ref="stripButtons" class="row"></span>
    <span class="sep"></span>
    <button type="button" class="primary" data-ref="accept">Accept</button>
    <button type="button" data-ref="reject">Reject</button>
  </div>

  <div class="toast surface" role="status" hidden></div>

  <div class="bar surface" role="toolbar" aria-label="CRISP Live">
    <span class="brand">CRISP Live</span>
    <span class="sep optional"></span>
    <button type="button" data-ref="pick" aria-pressed="false" title="Pick an element (double-click text to edit it)">Pick</button>
    <button type="button" data-ref="insert" aria-pressed="false" title="Draw a box where a new section should go">Insert</button>
    <span class="sep"></span>
    <span class="status" data-ref="status"><span class="dot" data-ref="dot"></span><span class="text" data-ref="statusText">Connecting</span></span>
  </div>
</div>`;

  const $ = sel => root.querySelector(sel);
  const ref = name => root.querySelector('[data-ref="' + name + '"]');
  const ui = {
    layer: $('.layer'), hover: $('.hover'), selected: $('.selected'), draw: $('.draw'), tag: $('.tag'),
    panel: $('.panel'), strip: $('.strip'), toast: $('.toast'), bar: $('.bar'),
  };
  [
    'kind', 'name', 'src', 'parent', 'close', 'chips', 'comment', 'commentLabel', 'count', 'send',
    'stripTitle', 'stripButtons', 'accept', 'reject', 'pick', 'insert', 'dot', 'statusText',
  ].forEach(n => { ui[n] = ref(n); });

  const state = {
    mode: 'idle',        // idle | pick | insert
    hovered: null,
    selected: null,      // Element
    insertBox: null,     // {pageX, pageY, width, height}
    commands: new Set(),
    count: 2,
    editing: null,       // {el, oldText, snapshot}
    lastSeq: 0,
    loaded: false,
    responses: new Map(),  // eventId -> latest response
    resolved: new Set(),   // eventIds answered by accept/reject
    labels: new Map(),     // eventId -> short label
    strip: null,           // {eventId, variants, note}
    failures: 0,
  };

  // Chips and variant count.
  for (const [id, text] of COMMANDS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.dataset.command = id;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      if (state.commands.has(id)) state.commands.delete(id); else state.commands.add(id);
      b.setAttribute('aria-pressed', String(state.commands.has(id)));
      syncSend();
    });
    ui.chips.appendChild(b);
  }
  for (const n of [1, 2, 3]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(n);
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', n === 1 ? '1 variant, applied directly' : n + ' variants to compare');
    b.addEventListener('click', () => setCount(n));
    b.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setCount(Math.min(3, state.count + 1), true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setCount(Math.max(1, state.count - 1), true); }
    });
    ui.count.appendChild(b);
  }
  function setCount(n, focus) {
    state.count = n;
    Array.from(ui.count.children).forEach((b, i) => {
      const on = i + 1 === n;
      b.setAttribute('aria-checked', String(on));
      b.setAttribute('aria-pressed', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
  }
  setCount(2);

  function syncSend() {
    const hasText = ui.comment.value.trim().length > 0;
    ui.send.disabled = state.mode === 'insert' || state.insertBox ? !hasText : !(hasText || state.commands.size);
  }
  ui.comment.addEventListener('input', syncSend);
  ui.comment.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (!ui.send.disabled) send(); }
  });

  // ─── Toast and status ───

  let toastTimer = 0;
  function toast(text) {
    ui.toast.textContent = text;
    ui.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { ui.toast.hidden = true; }, 4000);
  }

  function setStatus(kind, text) {
    ui.dot.dataset.state = kind;
    ui.statusText.textContent = text;
  }

  // ─── Positioning ───

  function place(box, rect) {
    box.style.left = rect.left + 'px';
    box.style.top = rect.top + 'px';
    box.style.width = rect.width + 'px';
    box.style.height = rect.height + 'px';
    box.hidden = false;
  }

  function redraw() {
    if (state.mode === 'pick' && state.hovered && state.hovered !== state.selected && state.hovered.isConnected) {
      const r = state.hovered.getBoundingClientRect();
      place(ui.hover, r);
      ui.tag.textContent = label(state.hovered);
      ui.tag.style.left = Math.max(4, r.left) + 'px';
      ui.tag.style.top = Math.max(4, r.top - 22) + 'px';
      ui.tag.hidden = false;
    } else {
      ui.hover.hidden = true;
      ui.tag.hidden = true;
    }
    if (state.selected && state.selected.isConnected) place(ui.selected, state.selected.getBoundingClientRect());
    else ui.selected.hidden = true;
    if (state.insertBox) {
      const b = state.insertBox;
      place(ui.draw, { left: b.pageX - scrollX, top: b.pageY - scrollY, width: b.width, height: b.height });
    } else if (!state.drawing) {
      ui.draw.hidden = true;
    }
  }
  let raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; redraw(); }); };
  addEventListener('scroll', schedule, true);
  addEventListener('resize', schedule);

  // ─── Modes ───

  function setMode(mode) {
    if (state.editing) finishEdit(false);
    state.mode = mode;
    ui.pick.setAttribute('aria-pressed', String(mode === 'pick'));
    ui.insert.setAttribute('aria-pressed', String(mode === 'insert'));
    ui.layer.hidden = mode !== 'insert';
    if (mode !== 'pick') state.hovered = null;
    document.documentElement.style.cursor = mode === 'pick' ? 'crosshair' : '';
    schedule();
  }

  function exitAll() {
    closePanel();
    setMode('idle');
  }

  ui.pick.addEventListener('click', () => {
    if (state.mode === 'pick') exitAll();
    else { closePanel(); setMode('pick'); toast('Pick: click an element, or Tab to it and press Enter. Double-click text to edit it. Esc exits.'); }
  });
  ui.insert.addEventListener('click', () => {
    if (state.mode === 'insert') exitAll();
    else { closePanel(); setMode('insert'); toast('Insert: drag a box where the new section should go. Esc exits.'); }
  });

  // ─── Panel ───

  function openPanel() {
    const insert = !!state.insertBox;
    ui.kind.textContent = insert ? 'New section' : 'Selected element';
    ui.chips.hidden = insert;
    ui.parent.hidden = insert;
    ui.commentLabel.textContent = insert ? 'Describe the section' : 'Comment (optional)';
    ui.comment.placeholder = insert ? 'For example: a case study section with one quote and three numbers' : 'What should change, and why?';
    if (insert) {
      const b = state.insertBox;
      ui.name.textContent = b.width + ' x ' + b.height + ' at ' + b.pageX + ', ' + b.pageY;
      ui.src.textContent = 'After ' + (b.anchor ? b.anchor.selector : 'the page body');
    } else {
      ui.name.textContent = label(state.selected);
      const s = sourceOf(state.selected);
      ui.src.textContent = s
        ? s.file + (s.line ? ':' + s.line : '') + (s.depth ? '  (from an ancestor)' : '')
        : 'No source location: your agent will search by text and selector';
    }
    ui.panel.hidden = false;
    ui.strip.hidden = true;
    syncSend();
    schedule();
  }

  function closePanel() {
    ui.panel.hidden = true;
    state.selected = null;
    state.insertBox = null;
    state.commands.clear();
    ui.chips.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    ui.comment.value = '';
    renderStrip();
    schedule();
  }

  function select(el) {
    if (!el || isOurs(el) || el === document.documentElement) return;
    state.selected = el;
    state.insertBox = null;
    openPanel();
    const first = ui.chips.querySelector('button');
    if (first) first.focus({ preventScroll: true });
  }

  ui.parent.addEventListener('click', () => {
    const p = state.selected && state.selected.parentElement;
    if (p && p !== document.documentElement) { state.selected = p; openPanel(); }
  });
  ui.close.addEventListener('click', () => { closePanel(); if (state.mode === 'pick') ui.pick.focus(); });
  ui.send.addEventListener('click', send);

  function send() {
    if (ui.send.disabled) return;
    const comment = ui.comment.value.trim();
    let event;
    if (state.insertBox) {
      const b = state.insertBox;
      event = { type: 'insert', description: comment, variants: state.count, box: { pageX: b.pageX, pageY: b.pageY, width: b.width, height: b.height }, anchor: b.anchor, page: pageInfo() };
    } else if (state.selected) {
      const commands = Array.from(state.commands);
      event = { type: commands.length ? 'command' : 'comment', commands, comment, variants: state.count, element: describe(state.selected), page: pageInfo() };
    } else return;
    ui.send.disabled = true;
    api('POST', '/events', event)
      .then(saved => {
        const what = event.type === 'insert' ? 'New section' : (event.commands.map(c => COMMAND_LABEL[c]).join(', ') || 'Comment');
        state.labels.set(saved.id, what);
        toast('Sent to your agent: ' + what + '. Waiting for a response.');
        exitAll();
        ui.pick.focus();
        poll(true);
      })
      .catch(() => { toast('Could not reach the CRISP Live bridge. Is crisp live start running?'); syncSend(); });
  }

  // ─── Inline text edit ───

  function editableTarget(el) {
    if (!el || isOurs(el) || el === document.body || el === document.documentElement) return null;
    const hasText = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
    return hasText ? el : null;
  }

  function startEdit(el) {
    const snapshot = describe(el);
    state.editing = { el, oldText: el.textContent, snapshot };
    try { el.contentEditable = 'plaintext-only'; } catch (e) { el.contentEditable = 'true'; }
    if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    el.addEventListener('blur', onEditBlur, { once: true });
    toast('Editing text. Enter saves, Esc cancels.');
  }

  function onEditBlur() { finishEdit(true); }

  function finishEdit(commit) {
    const ed = state.editing;
    if (!ed) return;
    state.editing = null;
    ed.el.removeEventListener('blur', onEditBlur);
    ed.el.removeAttribute('contenteditable');
    const newText = ed.el.textContent;
    if (!commit) { ed.el.textContent = ed.oldText; return; }
    if (newText === ed.oldText) return;
    api('POST', '/events', { type: 'edit-text', oldText: ed.oldText.trim(), newText: newText.trim(), element: ed.snapshot, page: pageInfo() })
      .then(saved => { state.labels.set(saved.id, 'Text edit'); toast('Text edit sent. Your agent will write it to source.'); poll(true); })
      .catch(() => toast('Could not reach the CRISP Live bridge; the edit is only on this page.'));
  }

  // ─── Page event capture (pick mode) ───

  const inEdit = t => state.editing && (t === state.editing.el || state.editing.el.contains(t));
  const block = e => { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };

  function onPointerMove(e) {
    if (state.mode !== 'pick' || isOurs(e.target) || inEdit(e.target)) return;
    if (state.hovered !== e.target) { state.hovered = e.target; schedule(); }
  }
  function onSwallow(e) {
    if (state.mode !== 'pick' || isOurs(e.target) || inEdit(e.target)) return;
    block(e);
  }
  function onClick(e) {
    if (state.mode !== 'pick' || isOurs(e.target) || inEdit(e.target)) return;
    block(e);
    if (state.editing) finishEdit(true);
    select(e.target);
  }
  function onDblClick(e) {
    if (state.mode !== 'pick' || isOurs(e.target) || inEdit(e.target)) return;
    block(e);
    const el = editableTarget(e.target);
    if (el) startEdit(el);
  }
  function onFocusIn(e) {
    if (state.mode === 'pick' && !isOurs(e.target) && !inEdit(e.target)) { state.hovered = e.target; schedule(); }
  }
  function onKeyDown(e) {
    if (state.editing && inEdit(e.target)) {
      if (e.key === 'Escape') { block(e); finishEdit(false); }
      else if (e.key === 'Enter' && !e.shiftKey) { block(e); state.editing.el.blur(); }
      return;
    }
    if (e.key === 'Escape' && (state.mode !== 'idle' || !ui.panel.hidden)) {
      block(e);
      exitAll();
      ui.pick.focus();
      return;
    }
    if (state.mode === 'pick' && e.key === 'Enter' && !isOurs(e.target) && e.target !== document.body) {
      block(e);
      select(e.target);
    }
  }

  addEventListener('pointermove', onPointerMove, true);
  for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'submit']) {
    addEventListener(type, onSwallow, true);
  }
  addEventListener('click', onClick, true);
  addEventListener('dblclick', onDblClick, true);
  addEventListener('focusin', onFocusIn, true);
  addEventListener('keydown', onKeyDown, true);

  // ─── Insert mode drawing ───

  let start = null;
  ui.layer.addEventListener('pointerdown', e => {
    start = { x: e.clientX, y: e.clientY };
    state.drawing = true;
    state.insertBox = null;
    ui.layer.setPointerCapture(e.pointerId);
    place(ui.draw, { left: start.x, top: start.y, width: 0, height: 0 });
  });
  ui.layer.addEventListener('pointermove', e => {
    if (!start) return;
    place(ui.draw, { left: Math.min(start.x, e.clientX), top: Math.min(start.y, e.clientY), width: Math.abs(e.clientX - start.x), height: Math.abs(e.clientY - start.y) });
  });
  ui.layer.addEventListener('pointerup', e => {
    if (!start) return;
    const left = Math.min(start.x, e.clientX), top = Math.min(start.y, e.clientY);
    const width = Math.abs(e.clientX - start.x), height = Math.abs(e.clientY - start.y);
    start = null;
    state.drawing = false;
    if (width < 12 || height < 12) { ui.draw.hidden = true; return; }
    const under = document.elementsFromPoint(left + width / 2, top + height / 2).find(el => !isOurs(el) && el !== document.documentElement);
    state.insertBox = {
      pageX: Math.round(left + scrollX), pageY: Math.round(top + scrollY), width: Math.round(width), height: Math.round(height),
      anchor: under && under !== document.body ? { selector: cssSelector(under), tag: under.localName, source: sourceOf(under) } : null,
    };
    ui.layer.hidden = true;
    openPanel();
    ui.comment.focus();
  });

  // ─── Variant strip ───

  function renderStrip() {
    const s = state.strip;
    if (!s) { ui.strip.hidden = true; return; }
    const current = currentVariant();
    ui.stripTitle.textContent = (state.labels.get(s.eventId) || 'Variants') + (s.note ? ': ' + s.note : '');
    ui.stripTitle.title = ui.stripTitle.textContent;
    ui.stripButtons.textContent = '';
    for (const v of s.variants) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'Variant ' + v.toUpperCase();
      if (v === current) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', () => {
        const url = new URL(location.href);
        url.searchParams.set('variant', v);
        location.assign(url.toString());
      });
      ui.stripButtons.appendChild(b);
    }
    ui.accept.textContent = 'Accept ' + current.toUpperCase();
    ui.strip.hidden = false;
  }

  function answer(type) {
    const s = state.strip;
    if (!s) return;
    const body = type === 'accept' ? { type, eventId: s.eventId, variant: currentVariant(), page: pageInfo() } : { type, eventId: s.eventId, page: pageInfo() };
    ui.accept.disabled = ui.reject.disabled = true;
    api('POST', '/events', body)
      .then(() => {
        state.resolved.add(s.eventId);
        state.strip = null;
        renderStrip();
        toast(type === 'accept' ? 'Accepted variant ' + body.variant.toUpperCase() + '. Your agent will delete the others.' : 'Rejected. Your agent will remove the variants.');
        poll(true);
      })
      .catch(() => toast('Could not reach the CRISP Live bridge.'))
      .finally(() => { ui.accept.disabled = ui.reject.disabled = false; });
  }
  ui.accept.addEventListener('click', () => answer('accept'));
  ui.reject.addEventListener('click', () => answer('reject'));

  // ─── Polling ───

  let pollTimer = 0;
  let inFlight = false;
  function poll(now) {
    clearTimeout(pollTimer);
    if (inFlight) { pollTimer = setTimeout(poll, 200); return; }
    if (!now && document.hidden) { pollTimer = setTimeout(poll, POLL_MS); return; }
    inFlight = true;
    api('GET', '/events?since=' + state.lastSeq)
      .then(data => {
        state.failures = 0;
        for (const ev of data.events) {
          if (ev.type === 'accept' || ev.type === 'reject') state.resolved.add(ev.eventId);
          else if (!state.labels.has(ev.id)) {
            const what = ev.type === 'insert' ? 'New section' : ev.type === 'edit-text' ? 'Text edit' : ((ev.commands || []).map(c => COMMAND_LABEL[c] || c).join(', ') || 'Comment');
            state.labels.set(ev.id, what);
          }
        }
        for (const r of data.responses) {
          state.responses.set(r.eventId, r);
          if (state.loaded && r.kind !== 'variants') {
            toast((r.kind === 'error' ? 'Your agent could not finish: ' : 'Done: ') + (r.note || state.labels.get(r.eventId) || r.eventId));
          }
        }
        state.lastSeq = Math.max(state.lastSeq, data.lastSeq || 0);
        state.loaded = true;
        // The newest unanswered variants response owns the strip.
        let open = null;
        for (const r of state.responses.values()) {
          if (r.kind === 'variants' && !state.resolved.has(r.eventId) && (!open || r.seq > open.seq)) open = r;
        }
        const changed = (open && open.id) !== (state.strip && state.strip.id);
        state.strip = open ? { id: open.id, eventId: open.eventId, variants: open.variants, note: open.note } : null;
        if (changed && ui.panel.hidden) renderStrip();
        setStatus(data.pending ? 'busy' : 'idle', data.pending ? data.pending + ' with agent' : 'Agent idle');
      })
      .catch(() => {
        state.failures++;
        setStatus('off', 'Offline');
      })
      .finally(() => {
        inFlight = false;
        pollTimer = setTimeout(poll, Math.min(10000, POLL_MS * Math.pow(2, Math.min(state.failures, 3))));
      });
  }

  (document.body || document.documentElement).appendChild(host);
  poll(true);
})();
