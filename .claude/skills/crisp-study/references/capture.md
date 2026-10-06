# Capture recipes for /crisp-study

Use the first method that works for the source. Name it in the report. Every captured value carries its method into the Provenance table.

| Method id | Source | Trust |
|---|---|---|
| `computed-style` | Live URL through a browser | high |
| `declared-css` | Fetched HTML + stylesheets, no browser | medium |
| `code` | CSS vars, Tailwind config, theme files in this repo | high |
| `vision-estimate` | Screenshot or image | low / medium only |

## URL - harness browser or Playwright

Prefer the browser tool the harness already provides (Claude in Chrome, Cursor browser, Playwright MCP). Otherwise use Playwright directly:

```bash
npx playwright --version || npx -y playwright install chromium
```

Run this in the page (browser tool `javascript` action, or `page.evaluate`) at 1280px, then again at 375px:

```js
(() => {
  const pick = ['color','backgroundColor','fontFamily','fontSize','fontWeight','lineHeight',
    'letterSpacing','borderRadius','boxShadow','paddingTop','paddingLeft','gap'];
  const sel = ['body','h1','h2','h3','p','a','button','input','nav','header','footer',
    '[class*="card"]','[class*="btn"]','section'];
  const out = { root: {}, elements: [] };
  const rs = getComputedStyle(document.documentElement);
  for (const name of rs) if (name.startsWith('--')) out.root[name] = rs.getPropertyValue(name).trim();
  for (const s of sel) {
    document.querySelectorAll(s).forEach((el, i) => {
      if (i > 4) return;                        // 5 samples per selector is enough
      const cs = getComputedStyle(el);
      const row = { selector: s, index: i };
      for (const p of pick) row[p] = cs[p];
      out.elements.push(row);
    });
  }
  return JSON.stringify(out);
})()
```

Rules:
- Dismiss cookie banners before sampling; never sample the banner.
- Skip elements with `display: none` or zero size.
- Never log in, solve a CAPTCHA, or send credentials. A wall is `BLOCKED`.
- Save raw output to `.artifacts/study/<slug>-<width>.json` so provenance is checkable. Do not commit it unless asked.

## URL - no browser

```bash
curl -sL "<url>" -o page.html
grep -oE 'href="[^"]+\.css[^"]*"' page.html      # then fetch each stylesheet
grep -oE -- '--[a-zA-Z0-9-]+:\s*[^;]+' *.css | sort | uniq -c | sort -rn | head -60
grep -oE '#[0-9a-fA-F]{3,8}\b|oklch\([^)]+\)|rgb[a]?\([^)]+\)' *.css | sort | uniq -c | sort -rn | head -40
grep -oE 'font-family:[^;]+' *.css | sort | uniq -c | sort -rn | head
```

Every value from this path is `declared-css`, confidence `medium` at most: declared does not mean used.

## Screenshot - vision

- Sample colours only from flat regions at least 20x20px. Never from gradients, photos, or anti-aliased edges.
- Anchor sizes: body text is ~16px unless the image shows a known element (a 44px tap target, a browser chrome bar). State the anchor in the report.
- Font family: name the classification ("geometric sans, single-storey a") and two candidates. Confidence `low`.
- Every token: `vision-estimate`, confidence `low` or `medium`.

## Codebase

```bash
grep -rhoE -- '--[a-zA-Z0-9-]+:\s*[^;]+' --include='*.css' --include='*.scss' . | grep -v node_modules | sort | uniq -c | sort -rn
ls tailwind.config.* 2>/dev/null; grep -rn '@theme' --include='*.css' . | grep -v node_modules
grep -rhoE '#[0-9a-fA-F]{3,8}\b' --include='*.{css,scss,tsx,jsx,vue,svelte}' src app components 2>/dev/null | sort | uniq -c | sort -rn | head -40
```

Usage counts matter: a declared token used zero times is reported as an orphan, not promoted to the DESIGN.md. A hard-coded value used 10+ times that matches no token is a candidate token; record it with `Where: hard-coded, N files`.

## Clustering

- Colours: merge values within deltaE 2 (OKLCH lightness within 0.02 and chroma within 0.01 is a fine proxy). Keep the most frequent as the token value.
- Sizes: merge within 1px. Line-heights: within 0.05.
- Record cluster size in `Samples`.
