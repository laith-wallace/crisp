# Injection and measurement recipes for /crisp-stress

Prefer the least invasive seam: an existing story or fixture, then a query param the app already reads, then a temporary local mock, then DevTools overrides. Remove anything temporary after the run.

## Sample data

```js
export const STRESS = {
  empty: [],
  one: (make) => [make(0)],
  many: (make) => Array.from({ length: 1000 }, (_, i) => make(i)),
  long: 'Maximilian Alexander Featherstonehaugh-Cholmondeley '.repeat(4).slice(0, 200),
  unbroken: 'x'.repeat(120),
  url: 'https://example.com/' + 'a1b2c3d4/'.repeat(20),
  rtl: 'مرحبا بك في لوحة التحكم الخاصة بك',
  rtlHebrew: 'ברוכים הבאים ללוח הבקרה שלך',
  emoji: 'Zoë 👩🏽‍💻 🏳️‍🌈 🇯🇵 é ä',
  digits: [1234567890, -1234567890, 1234567890.99],
  nulls: (obj) => Object.fromEntries(Object.keys(obj).map(k => [k, null])),
};

// +40% pseudo-locale: pad every string, keep it readable
export const pseudo = (s) => `[${s}${' ~'.repeat(Math.ceil(s.length * 0.2))}]`;
```

## Seams by stack

**React / Next.js** - wrap the data source:
```tsx
const stress = process.env.NODE_ENV !== 'production'
  ? new URLSearchParams(globalThis.location?.search).get('stress') : null;
const items = stress === 'empty' ? [] : stress === 'many' ? STRESS.many(makeItem) : data;
```
Server components: read `searchParams` in the page and pass down. Guard with `NODE_ENV`.

**Vue / Nuxt** - same pattern via `useRoute().query.stress`.

**Svelte / SvelteKit** - in `+page.ts` load, read `url.searchParams.get('stress')`, guarded by `dev` from `$app/environment`.

**Storybook** - add one story per case (`Empty`, `Many`, `LongNames`...). If stories already exist, this is the preferred seam and may be kept.

**Plain HTML / unknown** - DevTools Local Overrides on the API response, or `page.route()` in Playwright:
```js
await page.route('**/api/items*', r => r.fulfill({ json: [] }));            // S1
await page.route('**/api/items*', r => r.fulfill({ status: 500 }));         // S10
await page.route('**/*.{png,jpg,webp,avif}', r => r.fulfill({ status: 404 })); // S8
await context.setOffline(true);                                              // S11
```

**Network (S9)** - Playwright CDP:
```js
const cdp = await context.newCDPSession(page);
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 400 * 1024 / 8, uploadThroughput: 400 * 1024 / 8 });
```

**Zoom (S12)** - `document.body.style.zoom = '2'` is not equivalent; set the viewport to 640px wide at deviceScaleFactor 2, or use browser zoom in a real browser tool.

**RTL (S6)** - `document.documentElement.dir = 'rtl'` plus the RTL sample in text fields.

## Measurements

```js
// Horizontal scroll (S3, S5, S12, S13)
document.documentElement.scrollWidth > window.innerWidth

// Truncation without tooltip (S4, S14)
[...document.querySelectorAll('*')].filter(el =>
  el.scrollWidth > el.clientWidth + 1 &&
  getComputedStyle(el).overflow !== 'visible' &&
  !el.title && !el.getAttribute('aria-describedby')
).map(el => el.outerHTML.slice(0, 120))

// Overlap between siblings (S4, S6, S14)
const r = (el) => el.getBoundingClientRect();
const overlaps = (a, b) => !(r(a).right <= r(b).left || r(b).right <= r(a).left || r(a).bottom <= r(b).top || r(b).bottom <= r(a).top);

// Leaked nulls (S16)
/\b(undefined|null|NaN|Invalid Date)\b/.test(document.body.innerText)

// CLS (S9) - install before the data lands
let cls = 0; new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) cls += e.value; }))
  .observe({ type: 'layout-shift', buffered: true });

// Input latency (S3) - time a keystroke into the filter/search to next paint
```

Save screenshots to `.artifacts/stress/<case-id>.png`. Do not commit them unless asked.
