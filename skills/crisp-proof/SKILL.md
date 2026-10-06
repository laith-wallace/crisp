---
name: crisp-proof
description: Visual proof that a design change did what it claims - before/after screenshot pairs across states and breakpoints, a PR-ready markdown table, and /crisp-review grades on both sides so the improvement is a measured delta, not a sentence. Use when a PR needs screenshots, 'show me before and after', 'prove the redesign is better', or after /crisp-redesign, /crisp-improve-ui, or /crisp-loop lands changes.
user-invocable: true
version: "1.0.0"
metadata:
  author: Laith Wallace - FlowConverts
  adapted-from: vercel-labs/before-and-after skill (workflow only, no vendored code), michaelshimeles/skills evidence-driven-testing
---

# /crisp-proof - Show It, Don't Say It

A sentence in a PR body that says "improved the empty state" is a claim. Two screenshots side by side are evidence. This skill captures the pair, captures the states and breakpoints the change touched, grades both sides with `/crisp-review`, and writes the whole thing as a table another person can check in ten seconds.

Load `.crisp.md` if it exists - its breakpoints, theme modes, and register decide what the evidence matrix must contain.

## Hard rules

Six rules. Breaking any one invalidates the proof:

1. **Never switch branches, stash, reset, or check out** to manufacture a "before". The current working tree is **After**. Before comes from a URL the user names (production, a preview deployment, another local port) or an existing image.
2. **Never assume what Before is.** If only one URL is given, ask exactly one question: "What URL or image is the Before state - production, a preview deployment, or another port?" Then proceed.
3. **Never fabricate or reuse a capture.** Every image is captured in this run, from the URL and commit stated in the report. A screenshot from a different commit is not evidence.
4. **Never capture secrets.** If the surface shows tokens, customer data, or payment details, mark that pair `untested` with the reason.
5. **Never use full-page capture** unless the user asks for it. Default is the viewport, or the selector the user names.
6. **Never present a regression as a win.** If After grades lower than Before, or the P0 count went up, the report's first line is `REGRESSED`.

## Step 1 - Establish the two sides

Record before capturing anything:

```bash
git rev-parse --short HEAD          # After commit
git branch --show-current
```

| Side | Source | Default |
|---|---|---|
| Before | URL, image path, or preview deployment named by the user | Ask (rule 2) |
| After | Current tree - local dev server or the deployment of HEAD | `http://localhost:<port>` |

Confirm the After port serves **your** process before trusting it, especially on a shared machine:

```bash
lsof -i :<port> | head -3          # or: ss -ltnp "sport = :<port>"
```

If a URL ends in `.vercel.app`, check deployment protection first:

```bash
curl -s -o /dev/null -w "%{http_code}" "<url>"     # 401 or 403 = protected
```

Protected → try `vercel inspect <url>` for a bypass token; otherwise ask the user for a token or an unprotected URL. Never guess past a 401.

## Step 2 - Decide the evidence matrix

Minimum: one pair, desktop, default state. Expand by what the change touched. Every row is binary - present or `untested` with a reason.

| Dimension | Capture when | Values |
|---|---|---|
| Viewport | Always desktop; add mobile if the change touched layout, spacing, or type | 1280x800, 375x812, 768x1024 |
| State | The change touched a component with states | default, empty, loading, error, dense |
| Theme | `.crisp.md` or the code declares dark mode | light, dark |
| Focus | The change touched an interactive control | one capture with `:focus-visible` on the primary control |
| Selector | The user names a component, or the change is scoped to one | CSS selector, same on both sides unless the DOM changed |

A change that touched empty-state copy ships with the empty pair, not only the default pair. A change to a form ships with its error pair. Missing rows become reviewer questions; answer them before they are asked.

## Step 3 - Capture

Use the first available path. State which one you used in the report.

**Path A - `@vercel/before-and-after` CLI** (if `which before-and-after` succeeds, or `npx @vercel/before-and-after` works - always the full package name):

```bash
before-and-after "<before-url>" "<after-url>" -o .artifacts/proof/<slug>            # desktop
before-and-after "<before-url>" "<after-url>" --mobile -o .artifacts/proof/<slug>   # 375x812
before-and-after "<before-url>" "<after-url>" ".hero" -o .artifacts/proof/<slug>    # selector
```

**Path B - Playwright one-off, no project dependency:**

```bash
npx --yes --package=playwright node .artifacts/proof/<slug>/capture.mjs
```

Minimal `capture.mjs` - keep it next to the captures so the run is repeatable:

```js
import { chromium } from "playwright";
const pairs = [
  { name: "01-default-1280", url: process.env.BEFORE, side: "before", w: 1280, h: 800 },
  { name: "01-default-1280", url: process.env.AFTER,  side: "after",  w: 1280, h: 800 },
];
const browser = await chromium.launch();
for (const p of pairs) {
  const page = await browser.newPage({ viewport: { width: p.w, height: p.h } });
  await page.goto(p.url, { waitUntil: "networkidle" });
  await page.screenshot({ path: `.artifacts/proof/<slug>/${p.name}-${p.side}.png` });
  await page.close();
}
await browser.close();
```

In containers where Chromium fails with "No usable sandbox", launch with `args: ["--no-sandbox"]`.

**Path C - the harness's own browser tools** (Claude in Chrome, computer use): navigate, set the viewport, screenshot, save with the same naming scheme.

**Path D - no browser at all:** stop and ask the user for the captures. Do not describe what the screenshots would show.

Naming, always: `.artifacts/proof/<slug>/<nn>-<state>-<viewport>[-<theme>]-<before|after>.png`. Add `.artifacts/` to `.gitignore` if it is not there - evidence gets uploaded, never committed.

## Step 4 - Grade both sides

Run `/crisp-review` on Before, then on After. Same register, same scope, same evidence type (both screenshots, or both code + screenshots). Record grade, P0 count, P1 count, and the top issue for each.

Then run the **Mechanical Pre-Flight Checks** from `/crisp-design-eng` on After when the change touched markup or styles - the detector output is part of the proof:

```bash
npx @laith-wallace/crisp detect --json <changed-files>
```

Delta rules:
- Grade up and P0 down or equal → **IMPROVED**
- Grade equal, P0 and P1 down → **IMPROVED**
- Grade equal, counts equal → **NO CHANGE** - say so; the PR body should not claim improvement
- Grade down, or P0 up → **REGRESSED** (rule 6)

## Step 5 - Write the proof

Write `.artifacts/proof/<slug>/proof.md` and print it. Template:

```
## Proof: [change in under ten words]

**Verdict: IMPROVED** - Grade C → B, P0 1 → 0, P1 3 → 1
**After:** `<short-sha>` on `<branch>` at <after-url>
**Before:** <before-url or image path>
**Captured with:** Path A / B / C

| State | Viewport | Before | After |
|---|---|---|---|
| default | 1280 | ![](01-default-1280-before.png) | ![](01-default-1280-after.png) |
| empty | 1280 | ![](02-empty-1280-before.png) | ![](02-empty-1280-after.png) |
| default | 375 | ![](03-default-375-before.png) | ![](03-default-375-after.png) |
| error | 1280 | untested - requires a live payment token | untested |

**/crisp-review**
- Before: C - [R] no loading state on filter (P1), [C] empty state says "No data" (P1), ...
- After: B - [C] heading hierarchy skips h2 (P1)

**Detector on After:** 0 findings  (or: 1 finding - `gradient-text` in hero.css:14, suppressed with reason "brand lockup")

**Assertions**
- Precondition: signed in, seed data loaded - passed
- It should show a named empty state with one CTA - passed
- It should keep the sticky CTA visible at 375 - passed
- It should show an inline error on a declined card - untested (no test token)
```

Every assertion is `passed`, `failed`, or `untested` with a reason. Never skip silently. Keep each under 80 characters.

## Step 6 - Attach to the PR

If `gh` is available and a PR exists for the branch:

```bash
gh pr view --json number,body -q .number
```

Image files cannot be attached through `gh pr edit`. Two options, state which you used:
- Path A's `--markdown` flag uploads the pair and prints a table with hosted URLs - paste that table under a `## Before and after` heading with `gh pr edit <n> --body "..."`.
- Otherwise print the proof and tell the user to drag the PNGs from `.artifacts/proof/<slug>/` into the PR description; GitHub hosts them on drop.

Run the PR title and body through `/crisp-unslop` before posting.

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-proof | [IMPROVED/NO CHANGE/REGRESSED] | [surface] | [before grade] → [after grade] | [N] pairs, [N] untested
```
