---
name: crisp-study
description: Study a reference - a live URL, a screenshot, or the current codebase - and extract its design DNA into a DESIGN.md file in Google's DESIGN.md format (YAML tokens plus prose rationale), with provenance for every token and a lint pass at the end. Use when "study this site", "extract the design system from this URL", "what makes this look good", "turn this screenshot into tokens", "write a DESIGN.md", or before a redesign that should borrow a reference's direction. Interviewing the team for product context belongs to /crisp-teach; competitive pattern research belongs to /crisp-research; applying the tokens to a live surface belongs to /crisp-redesign.
metadata:
  version: "1.0.0"
  author: Laith Wallace - FlowConverts
  adapted-from: workflow inspired by nutlope/hallmark study and superdesign extract-website (no vendored code)
---

# /crisp-study - Study, Not Clone

A reference is useful for the decisions behind it: the type scale, the colour ratios, the spacing rhythm, the one radius it commits to. It is useless, and a legal risk, as something to copy. This skill reads a reference, measures what it can, records where every value came from, and writes the result as a DESIGN.md another agent can build from.

The output is **direction to adapt**, never a clone. Every DESIGN.md this skill writes says so in its Overview.

Load `.crisp.md` if it exists. Its register and Named Rules decide which extracted values are relevant: a Product-register app studying a Brand-register marketing site takes the type and colour discipline, not the hero layout. Read its `## Decisions` section; a decision that rejects a pattern ("no gradients", "no serif display") means that pattern is recorded under Do's and Don'ts as a Don't, not as a token.

## When to use / not use

| Use this | Use the neighbour instead |
|---|---|
| A URL, screenshot, or codebase should become a token file | No reference yet, only a vague request -> `/crisp-brief` |
| "Make ours feel like X" before a redesign | Competitive patterns across many products -> `/crisp-research` |
| The repo has scattered CSS vars and no single source of tokens | Product, users, register -> `/crisp-teach` (writes `.crisp.md`) |
| A DESIGN.md exists but drifted from the code | Applying tokens to a surface -> `/crisp-redesign` or `/crisp-tune` |

## Inputs

| Input | Default | Notes |
|---|---|---|
| Source | required | One of: a URL, an image path, or `.` / a directory for the current codebase |
| `--out` | `DESIGN.md` at repo root | Refuse to overwrite an existing file without saying so first; offer `DESIGN.study.md` |
| `--pages` | the given URL only | Up to 3 extra URLs on the same site; more pages adds noise, not signal |
| `--name` | inferred | The `name:` field; never the reference brand's trademark (see rule 4) |

## Steps

1. **Classify the source.** URL, screenshot, or code. State it in one line. Mixed sources (a URL plus a screenshot) run both paths and the URL wins on any conflict, because computed values beat estimates.
2. **Capture, in this order of trust.** Use the first method that works for the source and name it in the report. Full recipes are in `references/capture.md`.
   - **URL:** harness browser or Playwright -> `getComputedStyle` on body, h1-h3, p, a, button, input, card-like containers, and `:root` custom properties. Capture at 1280px and 375px. If no browser is available, fetch the HTML and its stylesheets and read declared values; mark every token `source: declared-css`.
   - **Screenshot:** vision. Sample colours from flat regions only, estimate sizes against a known anchor (body text ~16px unless shown otherwise). Every value is `source: vision-estimate` with confidence `low` or `medium`, never `high`.
   - **Codebase:** grep CSS custom properties, `tailwind.config.*` / `@theme` blocks, theme files, and design-token JSON. Count usage of each value so orphans are visible.
3. **Normalise.** Cluster near-duplicate values (colours within deltaE 2, sizes within 1px) into one token and record the cluster size. Convert colours to hex or OKLCH. Round spacing to the observed base unit (4 or 8) only when 80% or more of samples already sit on it; otherwise keep raw values and note "no base unit".
4. **Name by role, not by look.** `primary`, `surface`, `on-surface`, `muted`, `danger` - never `blue-500` or the brand's colour name. Typography tokens are `display`, `headline`, `title`, `body`, `label`, `mono` as observed.
5. **Write provenance.** Every token gets one row in the Provenance table at the end of the file: token, value, source method, where (selector, CSS var, file:line, or image region), sample count, confidence. A token without a row is deleted.
6. **Strip the brand.** Zero logos, wordmarks, product names, trademarked phrases, illustration assets, or proprietary font files copied. A licensed or proprietary typeface is recorded as `fontFamily` with a named open alternative in the prose (e.g. "Reference uses a proprietary grotesk; adapt with Inter Tight or Geist"), never with a file URL.
7. **Write the prose.** Fill the sections in the required order (see Output). Each section states the decision and why it works, in 2-6 sentences, then what to adapt and what not to carry over.
8. **Lint and fix.**
   ```bash
   npx @laith-wallace/crisp design-md lint DESIGN.md
   ```
   Fix every `error` and every `warning`. An `info` finding may stay with a one-line reason in the report. Re-run until zero errors and zero warnings, maximum 3 runs; anything still failing goes under **Not fixed**.
9. **Point to it.** If `.crisp.md` exists, add exactly one line under `## Design System`: `Tokens: DESIGN.md (studied from <source>, <date>)`. Date from `date +%Y-%m-%d`. Touch nothing else in `.crisp.md`.

## Binary rules

1. Every token in the YAML has exactly one Provenance row. Count of tokens = count of rows.
2. Zero values invented to fill a section. A section with no evidence is listed in `omitted:` instead.
3. Zero `vision-estimate` tokens marked confidence `high`.
4. Zero brand assets: no logo, wordmark, trademark, brand name in `name:`, image URL, or font file URL in the output.
5. The Overview's first sentence contains the words "study, not clone" and names the source.
6. Every `{colors.x}` style reference resolves (lint `broken-ref` = 0).
7. At most 12 colour tokens and at most 8 typography tokens. More means clustering failed; re-run step 3.
8. Text/background colour pairs used by components pass 4.5:1, or the failure is listed under Do's and Don'ts as a Don't with the measured ratio.
9. Lint ends with 0 errors and 0 warnings, or each remaining one is under **Not fixed**.
10. Exactly one line added to `.crisp.md`, and only when the file already exists.

## Stop conditions

Stop and report when any one is true, and say which:

| Condition | Stop reason |
|---|---|
| Lint clean and all rules pass | `DONE` |
| URL returns 401/403, a login wall, or a bot challenge | `BLOCKED: source not readable` - ask for a screenshot instead; never bypass auth |
| Fewer than 3 colour samples and fewer than 2 type samples captured | `INSUFFICIENT SIGNAL` - say what was captured and ask for another page or a sharper screenshot |
| Lint still fails after 3 runs | `LINT NOT CLEAN` - list the findings |
| `--out` exists and the user has not approved overwrite | `WAITING: overwrite` |

## Output format

The file (shape only; see `references/design-md-format.md` for every key and the lint rules):

```markdown
---
version: alpha
name: <role-based name, never the reference brand>
description: Design direction studied from <source>. Study, not clone.
colors:
  primary: "#1F5EFF"
  surface: "#FAFAF7"
  on-surface: "#16181D"
typography:
  body:
    fontFamily: Inter Tight
    fontSize: 16px
    lineHeight: 1.55
spacing:
  sm: 8px
  md: 16px
rounded:
  md: 8px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 12px 20px
---

## Overview
Study, not clone: direction extracted from <source> on <date>. <2-4 sentences on the design's thesis.>

## Colors
## Typography
## Layout
## Elevation & Depth
## Shapes
## Components
## Do's and Don'ts

## Provenance
| Token | Value | Method | Where | Samples | Confidence |
|---|---|---|---|---|---|
| colors.primary | #1F5EFF | computed-style | `button.cta` background, 1280px | 14 | high |
```

The report back to the user:

```
## crisp-study: <source>

**Stop reason:** DONE
**Method:** computed-style (Playwright, 1280 + 375)   **Pages:** 2
**Tokens:** 9 colors, 6 typography, 5 spacing, 3 rounded, 4 components
**Confidence:** 21 high, 4 medium, 2 low
**Lint:** 0 errors, 0 warnings, 1 info (missing-sections: Elevation & Depth omitted - flat design, no shadows sampled)
**Stripped:** logo, wordmark, 1 proprietary font (alternative named)
**.crisp.md:** pointer added   (or: not present)

**Adapt first:** <the 2-3 decisions most worth taking, one line each>
**Not fixed:** <omit if empty>
**Next:** /crisp-redesign or /crisp-tune with DESIGN.md as the token source
```

## Self-check before delivery

- [ ] Token count equals Provenance row count
- [ ] "study, not clone" is in the Overview's first sentence
- [ ] `grep -niE "logo|wordmark|\.woff2?|\.otf|\.ttf" DESIGN.md` finds nothing but the word "logo" in a Don't line
- [ ] No vision-estimate token marked high
- [ ] Lint run and its counts quoted from the actual output, not predicted
- [ ] `.crisp.md` changed by at most one line
- [ ] Zero em dashes in DESIGN.md

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-study | [source] | [N] tokens, lint [errors]/[warnings] | [stop reason]
```
