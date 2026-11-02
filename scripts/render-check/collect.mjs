/**
 * scripts/render-check/collect.mjs
 *
 * The in-page half of `crisp render-check`. collectSnapshot runs inside a
 * real browser page and measures what the page actually drew: text line boxes,
 * the boxes around them, controls and clipping ancestors. It returns plain
 * JSON. analyze.mjs turns that JSON into findings, so the rules can be unit
 * tested without a browser.
 *
 * collectSnapshot must stay self-contained: no imports, no references to
 * anything outside its own body. It is serialised with Function#toString and
 * evaluated in the page (Playwright page.evaluate, or pasted by an agent's
 * own browser tool via `crisp render-check --print-script`).
 *
 * Adapted from the rendered-frame checks in benjitaylor/skills stageshow
 * (MIT, Copyright (c) 2026 Benji Taylor): measure the frame, not the code.
 */

export function collectSnapshot(opts) {
  const options = opts || {};
  const MAX_TEXTS = 1500;
  const root = options.select ? document.querySelector(options.select) : document.body;
  if (!root) return { error: 'selector-not-found', select: options.select };

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const de = document.documentElement;
  const styleCache = new Map();
  const cs = el => {
    let s = styleCache.get(el);
    if (!s) { s = getComputedStyle(el); styleCache.set(el, s); }
    return s;
  };
  const r4 = r => ({ x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 });
  const alpha = color => {
    if (!color || color === 'transparent') return 0;
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (!m) return 1;
    const parts = m[1].split(/[ ,/]+/).filter(Boolean);
    return parts.length >= 4 ? parseFloat(parts[3]) : 1;
  };

  const pathOf = el => {
    const segs = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && segs.length < 4 && cur !== document.body) {
      let seg = cur.tagName.toLowerCase();
      if (cur.id) { segs.unshift(seg + '#' + cur.id); break; }
      const cls = (typeof cur.className === 'string' ? cur.className : '').trim().split(/\s+/).filter(Boolean)[0];
      if (cls) seg += '.' + cls;
      const parent = cur.parentElement;
      if (parent) {
        const same = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
        if (same.length > 1) seg += ':nth-of-type(' + (same.indexOf(cur) + 1) + ')';
      }
      segs.unshift(seg);
      cur = cur.parentElement;
    }
    return segs.join(' > ');
  };

  const hiddenCache = new Map();
  const isHidden = el => {
    if (hiddenCache.has(el)) return hiddenCache.get(el);
    let hidden = false;
    const s = cs(el);
    // Closed <details> keep their content in the DOM but draw none of it (summary excepted).
    const closed = el.closest && el.closest('details:not([open])');
    if (closed && !el.closest('summary')) hidden = true;
    else if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) hidden = true;
    else if (s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse' || parseFloat(s.opacity) === 0) hidden = true;
    else if (s.position === 'absolute' && (s.clip === 'rect(0px, 0px, 0px, 0px)' || s.clipPath === 'inset(50%)' || (parseFloat(s.width) <= 1 && parseFloat(s.height) <= 1))) hidden = true;
    else if (el.parentElement && el !== root) hidden = isHidden(el.parentElement);
    hiddenCache.set(el, hidden);
    return hidden;
  };

  const CONTROL_SEL = 'button, a[href], input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="switch"], [role="radio"]';

  const boxIndex = new Map();
  const boxes = [];
  const isBox = el => {
    if (el === document.body || el === de) return false;
    const s = cs(el);
    const fullBorder = ['Top', 'Right', 'Bottom', 'Left'].every(side => parseFloat(s['border' + side + 'Width']) > 0 && alpha(s['border' + side + 'Color']) > 0.05);
    return fullBorder || alpha(s.backgroundColor) > 0.05 || (s.boxShadow && s.boxShadow !== 'none') || s.backgroundImage !== 'none';
  };
  const boxOf = el => {
    if (boxIndex.has(el)) return boxIndex.get(el);
    const s = cs(el);
    const rect = el.getBoundingClientRect();
    const rec = {
      path: pathOf(el),
      tag: el.tagName.toLowerCase(),
      rect: r4(rect),
      control: el.matches(CONTROL_SEL),
      inline: s.display === 'inline',
      clipX: /hidden|clip|auto|scroll/.test(s.overflowX),
      clipY: /hidden|clip|auto|scroll/.test(s.overflowY),
      ellipsis: s.textOverflow === 'ellipsis',
    };
    boxes.push(rec);
    const idx = boxes.length - 1;
    boxIndex.set(el, idx);
    return idx;
  };

  // Nearest ancestor that draws a visible box, and nearest clipping ancestor.
  const nearest = (el, test) => {
    let cur = el;
    while (cur && cur !== document.body && cur !== de) {
      if (test(cur)) return cur;
      cur = cur.parentElement;
    }
    return null;
  };
  const clips = el => {
    const s = cs(el);
    return /hidden|clip|auto|scroll/.test(s.overflowX) || /hidden|clip|auto|scroll/.test(s.overflowY);
  };

  const texts = [];
  let truncated = false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const range = document.createRange();
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|TITLE)$/i.test(parent.tagName) || isHidden(parent)) continue;
    if (texts.length >= MAX_TEXTS) { truncated = true; break; }
    range.selectNodeContents(node);
    const rects = Array.from(range.getClientRects()).filter(r => r.width > 0.5 && r.height > 0.5);
    if (rects.length === 0) continue;
    const tops = [];
    for (const r of rects) if (!tops.some(t => Math.abs(t - r.top) < 3)) tops.push(r.top);
    const box = nearest(parent, isBox);
    const clip = nearest(parent, clips);
    const ctrl = parent.closest(CONTROL_SEL);
    const s = cs(parent);
    texts.push({
      path: pathOf(parent),
      text: node.nodeValue.trim().replace(/\s+/g, ' ').slice(0, 80),
      rect: r4(range.getBoundingClientRect()),
      lines: rects.map(r4),
      lineCount: tops.length,
      fontSize: parseFloat(s.fontSize),
      inline: s.display === 'inline',
      box: box ? boxOf(box) : null,
      clip: clip ? boxOf(clip) : null,
      control: ctrl ? boxOf(ctrl) : null,
      ellipsis: s.textOverflow === 'ellipsis' || (clip ? cs(clip).textOverflow === 'ellipsis' : false),
    });
  }

  // Controls: size, and the union of what they draw (text, icons, images).
  const controls = [];
  for (const el of root.querySelectorAll(CONTROL_SEL)) {
    if (isHidden(el)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 0.5 || rect.height < 0.5) continue;
    const s = cs(el);
    const parent = el.parentElement;
    const inlineInText = el.tagName === 'A' && s.display === 'inline' && parent &&
      Array.from(parent.childNodes).some(c => c.nodeType === 3 && c.nodeValue.trim());
    let content = null;
    const grow = r => {
      if (r.width < 0.5 || r.height < 0.5) return;
      if (!content) content = { l: r.left, t: r.top, r: r.right, b: r.bottom };
      else { content.l = Math.min(content.l, r.left); content.t = Math.min(content.t, r.top); content.r = Math.max(content.r, r.right); content.b = Math.max(content.b, r.bottom); }
    };
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = tw.nextNode())) {
      if (!t.nodeValue.trim() || !t.parentElement || isHidden(t.parentElement)) continue;
      range.selectNodeContents(t);
      grow(range.getBoundingClientRect());
    }
    for (const g of el.querySelectorAll('svg, img, i, [class*="icon"]')) if (!isHidden(g)) grow(g.getBoundingClientRect());
    controls.push({
      path: pathOf(el),
      tag: el.tagName.toLowerCase(),
      rect: r4(rect),
      inlineInText: Boolean(inlineInText),
      drawsBox: isBox(el),
      justify: s.justifyContent,
      textAlign: s.textAlign,
      content: content ? r4({ left: content.l, top: content.t, width: content.r - content.l, height: content.b - content.t }) : null,
    });
  }

  // Elements that push the page wider than the viewport.
  const overflowers = [];
  if (de.scrollWidth > vw + 1) {
    for (const el of root.querySelectorAll('*')) {
      if (overflowers.length >= 5) break;
      if (isHidden(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && !(el.parentElement && el.parentElement.getBoundingClientRect().right > vw + 1)) {
        overflowers.push({ path: pathOf(el), rect: r4(r) });
      }
    }
  }

  return {
    url: location.href,
    viewport: { w: vw, h: vh },
    scrollWidth: de.scrollWidth,
    select: options.select || null,
    truncated,
    texts,
    boxes,
    controls,
    overflowers,
  };
}
