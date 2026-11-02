---
name: crisp-proof
description: Visual proof that a design change did what it claims - before/after screenshot pairs across states and breakpoints, a PR-ready markdown table, and /crisp-review grades on both sides so the improvement is a measured delta, not a sentence. Use when a PR needs screenshots, 'show me before and after', 'prove the redesign is better', or after /crisp-redesign, /crisp-improve-ui, or /crisp-loop lands changes.
metadata:
  version: "1.1.0"
  author: Laith Wallace - FlowConverts
  adapted-from: vercel-labs/before-and-after skill (workflow only, no vendored code), michaelshimeles/skills evidence-driven-testing, benjitaylor/skills stageshow (MIT - blind review, rendered-frame checks, handover lines)
---

# /crisp-proof - Show It, Don't Say It

A sentence in a PR body that says "improved the empty state" is a claim. Two screenshots side by side are evidence. This skill captures the pair, captures the states and breakpoints the change touched, grades both sides with `/crisp-review`, and writes the whole thing as a table another person can check in ten seconds.

Load `.crisp.md` if it exists - its breakpoints, theme modes, and register decide what the evidence matrix must contain.

## Hard rules

Seven rules. Breaking any one invalidates the proof:

1. **Never switch branches, stash, reset, or check out** to manufacture a "before". The current working tree is **After**. Before comes from a URL the user names (production, a preview deployment, another local port) or an existing image. When Before is a commit (for example the start commit `/crisp-loop` hands off), serve it from a separate checkout: `git worktree add .artifacts/proof/before-tree <commit>`, start its dev server on a second port, capture, then `git worktree remove .artifacts/proof/before-tree`. This leaves the current tree untouched, which is why it is allowed.
2. **Never assume what Before is.** If neither a Before URL nor a commit is given, ask exactly one question: "What URL, image, or commit is the Before state - production, a preview deployment, another port, or a commit to serve from a temporary worktree?" Then proceed.
3. **Never fabricate or reuse a capture.** Every image is captured in this run, from the URL and commit stated in the report. A screenshot from a different commit is not evidence.
4. **Never capture secrets.** If the surface shows tokens, customer data, or payment details, mark that pair `untested` with the reason.
5. **Never use full-page capture** unless the user asks for it. Default is the viewport, or the selector the user names.
6. **Never present a regression as a win.** If After grades lower than Before, or the P0 count went up, the report's first line is `REGRESSED`.
7. **Never clear a rendered finding by hiding it.** See Never Intentional below.

## Step 1 - Establish the two sides

Record before capturing anything:

```bash
git rev-parse --short HEAD          # After commit
git branch --show-current
```

| Side | Source | Default |
|---|---|---|
| Before | URL, image path, or preview deployment named by the user, or a commit served from a temporary worktree (rule 1) | Ask (rule 2) |
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

Then measure both rendered sides at the matrix widths. The detector reads code; this reads what the browser drew:

```bash
npx @laith-wallace/crisp render-check "<before-url>" --width 1280,375 --json > .artifacts/proof/<slug>/render-before.json
npx @laith-wallace/crisp render-check "<after-url>"  --width 1280,375 --json > .artifacts/proof/<slug>/render-after.json
```

It needs Playwright in the project (`npm i -D playwright`). With Path C, run `npx @laith-wallace/crisp render-check --print-script`, evaluate the output in the harness browser at each width, save the returned JSON, and analyze it with `render-check --from <file>`. Exit 3 (`inconclusive`) means nothing was measured: list it under `Not checked`, never as clean.

<!-- crisp:shared never-intentional -->
## Never Intentional

These `crisp render-check` findings are bugs, never style choices: `page-overflow-x`, `overlapping-text`, `text-cut`, `text-spills`. Each one is drawn on a real screen at a real width.

- **Fix the cause, then re-capture.** A finding that is still there after a fix is still open.
- **Clearing a finding by hiding it is a new bug.** `display: none`, `overflow: hidden` added to mask a spill, removing the text, shrinking the type under 12px, or a narrower `--select` all count as hiding.
- **The only other exit is the user.** A finding the user rules on in words goes to `.crisp.md` `## Decisions`. Never write that line on your own initiative.
- **Clean is not good.** `clean` means the layout measured clean. It says nothing about hierarchy, copy, or whether the design works.
<!-- /crisp:shared never-intentional -->

Delta rules:
- Any P1 render-check finding on After that Before did not have → **REGRESSED**, whatever the grade
- Grade up and P0 down or equal → **IMPROVED**
- Grade equal, P0 and P1 down → **IMPROVED**
- Grade equal, counts equal → **NO CHANGE** - say so; the PR body should not claim improvement
- Grade down, or P0 up → **REGRESSED** (rule 6)

## Step 4b - Blind review of After

The `/crisp-review` of After in Step 4 runs blind: a fresh sub-agent gets the captures, not the change list.

<!-- crisp:shared blind-review -->
## Blind Review

The person who built a change is the worst judge of it, because they know what it was meant to look like. A blind reviewer judges the picture.

1. **Give the reviewer five things only:** the captures, the live URL when one exists, the one-line brief, the closest reference capture (`.crisp.md` `## Benchmarks` `ref:` line, or the Before), and the `/crisp-review` checklist. Never the builder's plan, reasons, fix list, or report.
2. **Use a fresh sub-agent** via the Agent tool when one exists. Without one, say `Blind review: degraded (same context)` in the report. A silent degraded run is not a blind review.
3. **The bar for a finding is a capture.** Every finding names the capture file that shows it. A predicted failure is not a finding, and a predicted pass is not a pass: when a needed capture does not exist (a state, a width, a hover, a mid-transition frame), the reviewer captures it or lists it under `Not checked`.
4. **The reviewer's first question:** put the target beside the reference and say the one biggest difference.
5. **Re-judge what the builder called intentional.** A finding the builder waved off is open until the reviewer looks at the capture and agrees.
6. **The reviewer does not fix.** It returns a ranked list, or `nothing` plus the list of captures it looked at.
<!-- /crisp:shared blind-review -->

Fold its ranked list into the After grade. A finding it raises that you disagree with stays in the report with your one-line reason; it is not dropped.

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
**Render-check:** Before 3 (2 P1) → After 0 at 1280, 375  (or: inconclusive at 375 - page needed sign-in)
**Blind review:** fresh sub-agent, 1 finding - [P] CTA loses to the illustration at 375 (03-default-375-after.png)

**Assertions**
- Precondition: signed in, seed data loaded - passed
- It should show a named empty state with one CTA - passed
- It should keep the sticky CTA visible at 375 - passed
- It should show an inline error on a declined card - untested (no test token)
```

Every assertion is `passed`, `failed`, or `untested` with a reason. Never skip silently. Keep each under 80 characters.

<!-- crisp:shared handover -->
## Handover Lines

End every report with these four lines. Each is a list or `none`; never omit a line.

```
Captured: [widths, themes, states and interactions you actually saw]
Not checked: [what you did not see, and why - "none" only when the Captured line covers every row of the evidence matrix]
Assumptions: [what you took as true without checking]
Unresolved: [findings still open, each with file:line or capture file]
```

An empty, failed, or `inconclusive` capture goes under `Not checked`, never under `Captured`. Ten green checks on a capture you did not look at are still not checked.
<!-- /crisp:shared handover -->

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

<!-- crisp:shared history -->
**Top-level runs only.** Write `## History` lines and `crisp critique write` snapshots only when the user invoked this skill directly. When another skill calls it (`/crisp-loop`, `/crisp-proof`, `/crisp-variants`, or a CRISP Live session), skip both writes and hand the result back to the caller, because the caller writes one line for the whole run and nested writes would multiply entries (a five-iteration loop would otherwise log six lines). `## Decisions` lines are not affected: they record what the user said, whoever ran the skill.
<!-- /crisp:shared history -->

The two `/crisp-review` runs in Step 4 are nested calls, so they write no History lines of their own; this one line records both grades.

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-proof | [IMPROVED/NO CHANGE/REGRESSED] | [surface] | [before grade] → [after grade] | [N] pairs, [N] untested
```
