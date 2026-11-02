/**
 * scripts/render-check/analyze.mjs
 *
 * The pure half of `crisp render-check`: snapshot JSON in (from collect.mjs),
 * findings out. No DOM, no browser, so every rule has a unit test.
 *
 * Every rule here measures a rendered frame. A rule that fires is never
 * cleared by hiding, removing or marking the thing it points at; fix the
 * cause, or record the finding as accepted in .crisp.md ## Decisions.
 *
 * Adapted from benjitaylor/skills stageshow film lines (MIT, Copyright (c)
 * 2026 Benji Taylor), rescoped from product-demo stages to ordinary pages.
 */

export const RULES = {
  'page-overflow-x':  { severity: 'P1', title: 'Page wider than the viewport' },
  'overlapping-text': { severity: 'P1', title: 'Text drawn over other text' },
  'text-cut':         { severity: 'P1', title: 'Text cut by a container or the viewport' },
  'text-spills':      { severity: 'P1', title: 'Text spills out of its box' },
  'tight-inset':      { severity: 'P2', title: 'Text too close to its box edge' },
  'wrapped-label':    { severity: 'P2', title: 'Short label or stat wraps onto two lines' },
  'small-target':     { severity: 'P2', title: 'Control smaller than 24 x 24 px' },
  'uneven-inset':     { severity: 'P3', title: 'Control content sits off-centre' },
  'small-text':       { severity: 'P3', title: 'Text under 12px' },
};

// Thresholds, in CSS px. Stageshow's numbers: words 8px or more from a card's
// edge (12px is right), 6px for a chip's sides, nothing under 10 to 12px.
export const T = {
  insetLarge: 8,      // boxes 40px tall or more: every side
  insetSmall: 6,      // chips, buttons, badges: left and right only
  smallBoxHeight: 40,
  smallBoxWidth: 320,
  overlapShare: 0.25, // intersection / smaller line box
  spill: 1.5,
  minTarget: 24,      // WCAG 2.2 SC 2.5.8 Target Size (Minimum)
  minFont: 12,
  unevenPx: 4,
  unevenRatio: 1.5,
};

const right = r => r.x + r.w;
const bottom = r => r.y + r.h;

function intersectArea(a, b) {
  const w = Math.min(right(a), right(b)) - Math.max(a.x, b.x);
  const h = Math.min(bottom(a), bottom(b)) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

const isShortLabel = s => s.length <= 32 && s.split(/\s+/).length <= 4;
const isStat = s => /^[-+~≈$£€]?\s?\d[\d.,]*\s?[%a-zA-Z$£€/]{0,6}$/.test(s) && /\d/.test(s);

/**
 * @param {object} snap  one collectSnapshot() result
 * @returns {{ findings: object[], coverage: object }}
 */
export function analyzeSnapshot(snap) {
  const findings = [];
  const width = snap.viewport?.w ?? null;
  const add = (id, path, message, extra = {}) =>
    findings.push({ id, severity: RULES[id].severity, width, path, message, ...extra });

  if (snap.error) {
    return { findings, coverage: { status: 'inconclusive', reason: snap.error } };
  }
  const texts = snap.texts || [];
  const boxes = snap.boxes || [];
  const controls = snap.controls || [];

  // page-overflow-x
  if (snap.viewport && snap.scrollWidth > snap.viewport.w + 1) {
    const culprit = (snap.overflowers || [])[0];
    add('page-overflow-x', culprit?.path ?? 'html',
      `Page is ${snap.scrollWidth}px wide in a ${snap.viewport.w}px viewport${culprit ? `; widest offender ends at ${Math.round(right(culprit.rect))}px` : ''}`);
  }

  for (const t of texts) {
    const box = t.box != null ? boxes[t.box] : null;
    const clip = t.clip != null ? boxes[t.clip] : null;

    // text-cut: partly outside its clipping ancestor, or partly off the viewport sideways.
    if (!t.ellipsis) {
      let cutBy = null;
      if (clip) {
        const c = clip.rect;
        // Partly outside, not wholly outside: a slide parked off-screen is hidden, not cut.
        const partX = clip.clipX && ((t.rect.x < c.x - T.spill && right(t.rect) > c.x) || (right(t.rect) > right(c) + T.spill && t.rect.x < right(c)));
        const partY = clip.clipY && ((t.rect.y < c.y - T.spill && bottom(t.rect) > c.y) || (bottom(t.rect) > bottom(c) + T.spill && t.rect.y < bottom(c)));
        if (partX || partY) cutBy = clip.path;
      }
      if (!cutBy && snap.viewport &&
          ((t.rect.x < -T.spill && right(t.rect) > 0) || (right(t.rect) > snap.viewport.w + T.spill && t.rect.x < snap.viewport.w))) {
        cutBy = 'the viewport';
      }
      if (cutBy) add('text-cut', t.path, `"${t.text}" is cut by ${cutBy}`, { text: t.text });
    }

    // Inline boxes (code, mark, a highlighted span) wrap with their sentence; their padding is decoration.
    if (box && !box.inline) {
      const b = box.rect;
      const d = { left: t.rect.x - b.x, right: right(b) - right(t.rect), top: t.rect.y - b.y, bottom: bottom(b) - bottom(t.rect) };
      const spills = Object.entries(d).filter(([, v]) => v < -T.spill).map(([k]) => k);
      if (spills.length && !(box.clipX || box.clipY)) {
        add('text-spills', t.path, `"${t.text}" runs past the ${spills.join(' and ')} edge of ${box.path}`, { text: t.text });
      } else if (!spills.length) {
        // Chips, buttons and badges: short and narrow, or a control. Their top and bottom are line-height's job.
        const small = b.h < T.smallBoxHeight && (box.control || b.w < T.smallBoxWidth);
        const sides = small ? ['left', 'right'] : ['left', 'right', 'top', 'bottom'];
        const limit = small ? T.insetSmall : T.insetLarge;
        const tight = sides.filter(s => d[s] < limit);
        // Full-bleed boxes (edge to edge of the viewport) are page bands; their sides are the page gutter's job.
        const fullBleed = snap.viewport && b.x <= 1 && right(b) >= snap.viewport.w - 1;
        const real = tight.filter(s => !(fullBleed && (s === 'left' || s === 'right')));
        if (real.length) {
          const worst = real.reduce((a, s) => (d[s] < d[a] ? s : a), real[0]);
          add('tight-inset', t.path, `"${t.text}" sits ${Math.max(0, Math.round(d[worst] * 10) / 10)}px from the ${worst} edge of ${box.path} (want ${limit}px or more)`, { text: t.text });
        }
      }
    }

    // wrapped-label: a short control label or a stat that breaks onto two lines.
    const ctrl = t.control != null ? boxes[t.control] : null;
    if (t.lineCount > 1 && ((ctrl && !ctrl.inline && isShortLabel(t.text)) || (isStat(t.text) && !t.inline))) {
      add('wrapped-label', t.path, `"${t.text}" wraps onto ${t.lineCount} lines`, { text: t.text });
    }

    if (t.fontSize && t.fontSize < T.minFont) {
      add('small-text', t.path, `"${t.text}" renders at ${t.fontSize}px`, { text: t.text });
    }
  }

  // overlapping-text: line boxes of different text nodes drawn on top of each other.
  // Compare the middle 60% of each line box: a font's content area runs past its ink (a display
  // letter at line-height 0.86 reaches into the line below without any glyph touching it).
  const core = r => ({ x: r.x, y: r.y + r.h * 0.2, w: r.w, h: r.h * 0.6 });
  const lines = [];
  texts.forEach((t, i) => (t.lines || []).forEach(r => lines.push({ i, r: core(r) })));
  lines.sort((a, b) => a.r.x - b.r.x);
  const reported = new Set();
  for (let a = 0; a < lines.length; a++) {
    for (let b = a + 1; b < lines.length && lines[b].r.x < right(lines[a].r); b++) {
      const A = lines[a], B = lines[b];
      if (A.i === B.i) continue;
      const key = A.i < B.i ? `${A.i}:${B.i}` : `${B.i}:${A.i}`;
      if (reported.has(key)) continue;
      const area = intersectArea(A.r, B.r);
      const smaller = Math.min(A.r.w * A.r.h, B.r.w * B.r.h);
      if (smaller > 0 && area / smaller > T.overlapShare) {
        reported.add(key);
        const ta = texts[A.i], tb = texts[B.i];
        add('overlapping-text', ta.path, `"${ta.text}" overlaps "${tb.text}" (${tb.path})`, { text: ta.text });
      }
    }
  }

  // WCAG 2.5.8 spacing exception: an undersized target passes when a 24px circle on its centre
  // touches no other target and no other undersized target's circle.
  const centre = r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  const distToRect = (p, r) => Math.hypot(Math.max(r.x - p.x, 0, p.x - right(r)), Math.max(r.y - p.y, 0, p.y - bottom(r)));
  const undersized = c => !c.inlineInText && (c.rect.w < T.minTarget || c.rect.h < T.minTarget);
  const spaced = c => {
    const p = centre(c.rect);
    return controls.every(o => o === c || (distToRect(p, o.rect) >= T.minTarget / 2 &&
      (!undersized(o) || Math.hypot(p.x - centre(o.rect).x, p.y - centre(o.rect).y) >= T.minTarget)));
  };
  for (const c of controls) {
    if (undersized(c) && !spaced(c)) {
      add('small-target', c.path, `${c.tag} is ${c.rect.w} x ${c.rect.h}px and another target sits inside its 24px circle (want ${T.minTarget} x ${T.minTarget}, or 24px clear spacing)`);
    }
    if (c.drawsBox && c.content && !/start|left|space-between|flex-start/.test(c.justify || '') && !/^(left|start)$/.test(c.textAlign || '')) {
      const l = c.content.x - c.rect.x;
      const r = right(c.rect) - right(c.content);
      const lo = Math.min(l, r), hi = Math.max(l, r);
      const wideBox = c.rect.w - c.content.w > c.rect.w * 0.5;
      if (lo >= 0 && !wideBox && hi - lo > T.unevenPx && (lo === 0 || hi / lo > T.unevenRatio)) {
        add('uneven-inset', c.path, `content sits ${Math.round(l)}px from the left and ${Math.round(r)}px from the right`);
      }
    }
  }

  // One finding per rule per element.
  const seen = new Set();
  const unique = findings.filter(f => {
    const k = `${f.id}|${f.path}|${f.text ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  let status = 'measured';
  let reason = null;
  if (texts.length === 0) { status = 'inconclusive'; reason = 'no visible text - the page may not have rendered'; }
  else if (snap.truncated) { status = 'partial'; reason = 'text limit reached; later text was not measured'; }
  return { findings: unique, coverage: { status, reason, texts: texts.length, controls: controls.length } };
}

const ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

/** Analyze several snapshots (one per width) into one report. */
export function analyzeAll(snaps) {
  const runs = snaps.map(s => ({ width: s.viewport?.w ?? null, url: s.url ?? null, ...analyzeSnapshot(s) }));
  const findings = runs.flatMap(r => r.findings).sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || (a.width ?? 0) - (b.width ?? 0));
  const inconclusive = runs.some(r => r.coverage.status === 'inconclusive');
  return {
    status: inconclusive ? 'inconclusive' : findings.length ? 'findings' : 'clean',
    findingCount: findings.length,
    runs: runs.map(r => ({ width: r.width, url: r.url, coverage: r.coverage, findingCount: r.findings.length })),
    findings,
  };
}
