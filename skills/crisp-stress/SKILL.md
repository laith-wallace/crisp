---
name: crisp-stress
description: Worst-case data stress test of a UI - runs a fixed 16-case matrix (empty, one item, 1000 items, 200-character names, unbroken strings, RTL, emoji, missing images, slow network, error, offline, 200% zoom, 320px width, +40% translations, 10-digit numbers, null fields) with a binary pass condition per case, P0-P3 severity, and a pass/fail table plus fix list. Read-only by default; --fix repairs P0 and P1 only. Use when "stress test this", "break this UI", "what happens with long names", "test edge cases", "will this survive real data", or before ship. Grading the design overall belongs to /crisp-review; accessibility depth belongs to /crisp-a11y; capturing before/after proof belongs to /crisp-proof.
metadata:
  version: "1.0.0"
  author: Laith Wallace - FlowConverts
  adapted-from: workflow inspired by emilkowalski/skills break-ui (no vendored code)
---

# /crisp-stress - Break It Before Users Do

Designs are reviewed with perfect data: three items, short names, every image present, a fast network. Production has none of that. This skill feeds a surface the worst data it will plausibly meet, one case at a time, and records exactly what broke.

Load `.crisp.md` if it exists. Its product type decides which cases are mandatory (table below). Its locales, if listed, replace the default RTL and translation samples. Read `## Decisions`: a case accepted there for this surface ("we only ship en-GB") is marked `accepted` with the decision date, not run.

## When to use / not use

| Use this | Use the neighbour instead |
|---|---|
| A surface renders real or user-supplied data | A quick design grade -> `/crisp-review` |
| Before ship, after a layout change, after adding a list or table | WCAG depth (focus order, ARIA, screen readers) -> `/crisp-a11y` |
| "It looked fine in the demo" | Before/after screenshots for a PR -> `/crisp-proof` |
| | Fixing many issues to a target grade -> `/crisp-loop` |

## Inputs

| Input | Default | Notes |
|---|---|---|
| Target | required | One route, component, or URL |
| `--cases` | all applicable | Comma list of case ids to limit the run |
| `--fix` | off | Apply fixes for P0 and P1 only, then re-run those cases |
| `--cls` | `0.1` | Layout shift threshold (CLS units) for the loading cases |

## The matrix

Every case has one injection method and one binary pass condition. Injection recipes for React, Vue, Svelte, plain HTML, and Storybook are in `references/injection.md`.

| Id | Case | Inject by | Pass when (all must hold) |
|---|---|---|---|
| S1 | Empty | Fixture `[]` / `?stress=empty` | Empty state shows a message and one recovery action; no blank region > 50% of the viewport |
| S2 | One item | Fixture of 1 | No grid gaps or orphan separators; plural copy reads correctly ("1 item") |
| S3 | 1000 items | Fixture of 1000 | Page stays interactive (input responds < 200ms); list paginates or virtualises; no horizontal scroll |
| S4 | 200-char names | Fixture string of 200 chars with spaces | No overlap; text wraps or truncates; truncated text has `title` or tooltip with the full value |
| S5 | Unbroken strings / URLs | 120-char token with no spaces, a 200-char URL | No horizontal scroll; container width unchanged (`overflow-wrap: anywhere` or equivalent) |
| S6 | RTL text | `dir="rtl"` on root + Arabic or Hebrew sample | Text aligns right; icons that imply direction mirror; no overlap; numbers stay LTR |
| S7 | Emoji and combining marks | Names with ZWJ emoji, flags, skin tones, and accented combining marks | No tofu boxes; no clipped glyphs; line height unchanged |
| S8 | Missing images | Point image `src` at a 404 | Fallback (initials, placeholder, or hidden) shown; `alt` present; no broken-image icon; no layout collapse |
| S9 | Slow network / loading | DevTools throttle "Slow 4G" or delay the fixture 3s | Skeleton or spinner within 300ms; CLS <= `--cls` when data lands |
| S10 | Error | Fixture throws / API returns 500 | Error says what happened and offers retry; no raw error text, stack, or status code shown |
| S11 | Offline | DevTools offline / `navigator.onLine` false | Offline is stated; actions that need network are disabled or queued, never silently lost |
| S12 | Zoom 200% | Browser zoom 200% at 1280px | No horizontal scroll; no text clipped or overlapping (WCAG 1.4.4) |
| S13 | 320px width | Viewport 320x640 | No horizontal scroll; primary CTA label on one line; tap targets >= 24px (WCAG 2.5.8) |
| S14 | Long translations +40% | Every string padded to 140% length (pseudo-locale) | No truncation without tooltip; buttons grow rather than clip; no overlap |
| S15 | 10-digit numbers | `1234567890`, negative, and currency forms | Numbers format with separators; columns align; no overflow |
| S16 | Null fields | Each optional field `null` / `undefined` | No "null", "undefined", "NaN", or "Invalid Date" rendered; no empty label with a colon |

### Mandatory by product type

| `.crisp.md` type | Must run | May mark `n/a` with one-line reason |
|---|---|---|
| Any | S1, S4, S5, S8, S10, S12, S13, S16 | - |
| Has lists, tables, or feeds | + S2, S3, S15 | - |
| Fetches data client-side | + S9, S11 | - |
| User-entered text shown to others | + S6, S7 | S6 only if `.crisp.md` lists no RTL locale and Decisions accepts it |
| Ships more than one locale | + S14 | - |

## Severity

<!-- crisp:shared severity -->
| Priority | Definition | Example |
|----------|-----------|---------|
| P0 | Blocks the user entirely | Empty state with no recovery path |
| P1 | Major friction - user can work around it but shouldn't have to | Spinner on every filter change |
| P2 | Noticeable degradation in experience | Generic empty state copy |
| P3 | Minor polish issue | Missing hover state on secondary action |
<!-- /crisp:shared severity -->

Default mapping for this matrix, overridden only with a stated reason:

| Failure | Default |
|---|---|
| Content or primary action unreachable (overlap covers it, horizontal scroll hides it, page frozen) | P0 |
| "undefined" / "NaN" / raw error text rendered; data silently lost offline | P1 |
| Truncation without tooltip; broken-image icon; CLS above threshold | P2 |
| Alignment or spacing off but content readable | P3 |

## Steps

1. **Load context.** `.crisp.md`, Decisions, product type. State the applicable case list.
2. **Find the injection seam.** Locate where the target gets its data (prop, hook, loader, API call). Prefer, in order: an existing fixture or story, a query param the app already reads, a local mock, a DevTools override. Never write to a real database or call a production API with fake data.
3. **Run each case.** For each case: inject, render, check the pass condition, capture evidence (screenshot path or `file:line`), restore. One case at a time so failures are attributable.
4. **Measure, do not eyeball.** Horizontal scroll: `document.documentElement.scrollWidth > innerWidth`. Overlap: compare `getBoundingClientRect()` of siblings. CLS: `PerformanceObserver` on `layout-shift`. Truncation: `el.scrollWidth > el.clientWidth` with no `title`. Snippets in `references/injection.md`.
5. **Grade.** Severity per failure. A case passes only if every condition in its row holds.
6. **Fix (only with `--fix`).** Fix P0 and P1 failures, one at a time, each with `file:line`. Re-run that case after each fix. P2 and P3 go to the fix list untouched. Build must pass after the fixes.
7. **Clean up.** Remove every temporary fixture, query-param hook, or mock added in step 2 unless the user asks to keep it as a story or test. `git status` shows only intended fixes.
8. **Report.**

## Binary rules

1. Every applicable case has a row: `pass`, `fail`, `n/a` (with reason), or `accepted` (with decision date). Zero blank rows.
2. Every `fail` has evidence: a screenshot path or `file:line` plus the measurement that failed.
3. Zero writes to production data or production APIs.
4. Without `--fix`, zero source edits remain at the end (`git status` clean apart from `.artifacts/`).
5. With `--fix`, zero P2 or P3 edits; every fix re-runs its case.
6. Zero temporary injection code left behind unless the user asked to keep it.
7. A case that could not be injected is `untested` with the reason, never `pass`.
8. Build passes after any `--fix` run.

## Stop conditions

| Condition | Stop reason |
|---|---|
| All applicable cases run and reported | `DONE` |
| The target will not render at baseline | `BASELINE BROKEN` - stress tests on a broken build prove nothing |
| No injection seam found for the data source | `NO SEAM` - list the cases left untested and ask where data comes from |
| `--fix` and a P0/P1 fix needs edits outside the target's files | `SCOPE BLOCKED` - name the file, leave it in the fix list |

## Output format

```
## crisp-stress: <target>

**Stop reason:** DONE   **Mode:** read-only   (or --fix)
**Result:** 11 pass, 3 fail, 1 n/a, 1 accepted   **Worst:** P0
**Injection:** fixtures via ?stress= (removed after run)

| Id | Case | Result | Sev | Evidence |
|---|---|---|---|---|
| S1 | Empty | fail | P0 | No recovery action; blank 78% of viewport - .artifacts/stress/s1.png |
| S4 | 200-char names | fail | P2 | `.name` truncates, no title - src/components/Row.tsx:31 |
| S5 | Unbroken strings | pass | - | scrollWidth 1280 = innerWidth |
| S6 | RTL | accepted | - | decision 2026-07-11 |
| S13 | 320px | fail | P1 | CTA wraps to 2 lines - src/components/Hero.tsx:48 |

**Fix list** (impact order)
1. [P0] S1 - add empty state with "Create your first deal" action - src/routes/deals/+page.svelte:20
2. [P1] S13 - shorten CTA or allow `white-space: nowrap` with smaller padding token - src/components/Hero.tsx:48
3. [P2] S4 - add `title={name}` to truncated cell - src/components/Row.tsx:31

**Fixed this run** (only with --fix)
- [P0] S1 - re-run: pass

**Untested:** <case and reason, omit if none>
**Next:** /crisp-loop to land the remaining fixes, or /crisp-proof for the before/after
```

## Self-check before delivery

- [ ] Row count equals applicable case count
- [ ] Every fail has a measurement and a location
- [ ] No case marked pass that was not injected
- [ ] `git status` shows no leftover fixtures or mocks
- [ ] With `--fix`: only P0/P1 edits, each case re-run, build passes
- [ ] Zero em dashes in the report

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-stress | [surface] | [pass]/[applicable] pass | worst [P0-P3] | [read-only or fixed N]
```
