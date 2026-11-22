---
name: crisp-study
description: Study a reference - a live URL, a screenshot, or the current codebase - and extract its design DNA into a DESIGN.md file in Google's DESIGN.md format (YAML tokens plus prose rationale), with provenance for every token and a lint pass at the end. Use when "study this site", "extract the design system from this URL", "what makes this look good", "turn this screenshot into tokens", "write a DESIGN.md", or before a redesign that should borrow a reference's direction. Interviewing the team for product context belongs to /crisp-teach; competitive pattern research belongs to /crisp-research; applying the tokens to a live surface belongs to /crisp-redesign.
metadata:
  version: "1.1.0"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
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
| `--bank` | off | Bank mode: save the study into the taste bank instead of the project's DESIGN.md. See **Bank mode** under Steps |

## Steps

1. **Classify the source.** URL, screenshot, or code. State it in one line. Mixed sources (a URL plus a screenshot) run both paths and the URL wins on any conflict, because computed values beat estimates.
2. **Capture, in this order of trust.** Use the first method that works for the source and name it in the report. Full recipes are in `references/capture.md`.
   - **URL:** harness browser or Playwright -> `getComputedStyle` on body, h1-h3, p, a, button, input, card-like containers, and `:root` custom properties. Capture at 1280px and 375px. If no browser is available, fetch the HTML and its stylesheets and read declared values; mark every token `source: declared-css`.
   - **Screenshot:** vision. Sample colours from flat regions only, estimate sizes against a known anchor (body text ~16px unless shown otherwise). Every value is `source: vision-estimate` with confidence `low` or `medium`, never `high`.
   - **Codebase:** grep CSS custom properties, `tailwind.config.*` / `@theme` blocks, theme files, and design-token JSON. Count usage of each value so orphans are visible.
3. **Normalise.** Cluster near-duplicate values (colours within deltaE 2, sizes within 1px) into one token and record the cluster size. Convert colours to OKLCH, matching `/crisp-design-eng`'s OKLCH-only rule so a DESIGN.md token drops into code unchanged. Round spacing to the observed base unit (4 or 8) only when 80% or more of samples already sit on it; otherwise keep raw values and note "no base unit".
4. **Name by role, not by look.** `primary`, `surface`, `on-surface`, `muted`, `danger` - never `blue-500` or the brand's colour name. Typography tokens are `display`, `headline`, `title`, `body`, `label`, `mono` as observed.
5. **Write provenance.** Every token gets one row in the Provenance table at the end of the file: token, value, source method, where (selector, CSS var, file:line, or image region), sample count, confidence. A token without a row is deleted.
6. **Strip the brand.** Zero logos, wordmarks, product names, trademarked phrases, illustration assets, or proprietary font files copied. A licensed or proprietary typeface is recorded as `fontFamily` with a named open alternative in the prose (e.g. "Reference uses a proprietary grotesk; adapt with Inter Tight or Geist"), never with a file URL.
7. **Write the prose.** Fill the sections in the required order (see Output). Each section states the decision and why it works, in 2-6 sentences, then what to adapt and what not to carry over.
8. **Lint and fix.**
   ```bash
   npx @laith-wallace/crisp design-md lint <the --out path, DESIGN.md by default>
   ```
   Fix every `error` and every `warning`. An `info` finding may stay with a one-line reason in the report. Re-run until zero errors and zero warnings, maximum 3 runs; anything still failing goes under **Not fixed**.
9. **Point to it.** If `.crisp.md` exists, add exactly one line under `## Design System`: `Tokens: <the --out path> (studied from <source>, <date>)`. Date from `date +%Y-%m-%d`. Touch nothing else in `.crisp.md`.

### Bank mode (`--bank`)

Steps 1 to 7 run unchanged. Then:

- **Path.** Write to `.crisp/taste-bank/<slug>.md`, never to `--out`. The slug is the URL's host without `www.` (or the image file name), lowercase, hyphens only. An existing file with that slug is overwritten only after the user says so.
- **Shape.** The same DESIGN.md format and Provenance table. The Overview keeps its "study, not clone" first sentence; its second line is `Best at: <one check another page can pass or fail>`, for example `Best at: every empty state names what is missing and gives 1 action`.
- **Step 8.** Lint the bank file: `npx @laith-wallace/crisp design-md lint .crisp/taste-bank/<slug>.md`.
- **Step 9.** Skip the `.crisp.md` pointer. Instead add 1 line to `.crisp/taste-bank/README.md` (create it with a `# Taste bank` heading if needed): `- <slug> | <source> | <the Best at line> | for: <the design skill it was saved for, or none>`. A slug already listed gets its line replaced, not repeated.
- **No `.crisp.md` writes.** Bank mode skips Longitudinal tracking too: zero lines added to `.crisp.md`, History included.
- **Report.** The report names the bank file in place of DESIGN.md, and `**.crisp.md:**` reads `not touched (bank mode)`.

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
10. Exactly one line added to `.crisp.md`, and only when the file already exists. In bank mode: zero lines.

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
Next: <command> - <why>
```

## Self-check before delivery

- [ ] Token count equals Provenance row count
- [ ] "study, not clone" is in the Overview's first sentence
- [ ] `grep -niE "logo|wordmark|\.woff2?|\.otf|\.ttf" <the file written>` finds nothing but the word "logo" in a Don't line
- [ ] No vision-estimate token marked high
- [ ] Lint run and its counts quoted from the actual output, not predicted
- [ ] `.crisp.md` changed by at most one line
- [ ] Zero em dashes in the file written (DESIGN.md, or the bank file in bank mode)

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists (never in bank mode). Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-study | [source] | [N] tokens, lint [errors]/[warnings] | [stop reason]
```

## Taste rules

<!-- crisp:shared taste -->
**Taste rules.** Each rule is a count, so a check can say pass or fail. Rules 1 to 7 apply when this skill makes or judges a rendered UI (a screen, a page, a component). The copy tells apply to all copy, prose included. Where this skill states a stricter limit for the same pattern, the stricter limit wins. Em dashes follow this skill's own rule where it has one.

1. **One detail only this client has.** Each screen shows at least 1 detail taken from the brief or the product: its units, its terms, its real prices, hours or numbers. A screen that would fit any business in the category fails.
2. **Real material first.** The client's own product, UI, photos and words lead. A stand-in (stock photo, mock data, coined name) is listed in the report as a stand-in. Zero stand-ins are presented as the client's own.
3. **One system.** 1 primary and 1 secondary button style, 1 card style, 1 radius scale, 1 heading scale, 1 link style per surface.
4. **One bold move per screen.** At most 1 element per screen breaks the system (an oversized heading, a full-bleed photo, a colour block). Everything around it stays quiet.
5. **Structure says something true.** Numbers (01, 02) only on steps a user follows in order. A label over a heading only when it adds information the heading does not.
6. **Motion answers the user.** Every button, link and linked card answers hover and press. Zero sections fade in on scroll by default. Anything that moves for more than 5 seconds has a pause control.
7. **Read the taste bank.** When `.crisp/taste-bank/` exists, read it before designing and name the 1 or 2 references this work borrows from, and what it borrows. Never copy a reference's code, copy, images or signature effect.

**Copy tells that current models still write.** These look like good copy, so they pass review. Count them on the whole surface.

| Tell | Limit | Fix |
|---|---|---|
| Invented specifics: room numbers, batch numbers, times, percentages the brief does not give | 0 | Use a fact from the brief, or write a plainer line |
| A strip of 3 or 4 figures over one-word labels | 0, unless every figure is a brief fact (price, hours, count) | Put each figure in the sentence it proves |
| Two-fragment heading, "X. Y." ("Twelve rooms. Three ways to stay.") | 1 | A name with a claim under it, a verb and the thing, or one plain sentence |
| Number-pair heading ("Four projects, four problems") | 0 | Say what the section holds |
| Contrast frames: "not X but Y", "isn't X", "rather than", "instead of", "without the" | 2, all forms counted together | State the positive fact alone |
| Negation runs ("No forms, no waiting") | 1 | Keep it only when each item is a refusal the buyer can check |
| Virtue words about the client: honest, calm, quiet, quietly, genuinely, truly, simply, thoughtful, carefully, intentional | 0 | Show it with a fact or an admission |
| A dry closing quip at the end of a paragraph | 1 | End on information |
| Default cast names: Priya, Okafor, Marcus, Dana, Aisha, Theo, Kestrel, Halcyon, Acme, Northwind, Lumen, Nimbus, Zenith | 0 | Names only from the brief; mock names that fit the place and age |
| The same section shape (label, heading, short lede, 3 cards) used back to back | 2 in a row | Shape each section from the question the reader has there |
| Testimonials or quotes the brief does not give word for word | 0 | Leave them out |
| Unsourced proof figures ("3x faster", "10,000+ teams", "98% happy") | 0 | Only figures from the brief, with their unit, in a sentence |
| The page talks about itself ("Below you'll find", "This section shows") | 0 | Say the thing |

**Over-correction.** Every ban breeds a substitute. Check for the substitute too.

| Rule applied | Habit it breeds | Counter |
|---|---|---|
| No em dashes | Comma splices and nothing but full stops | Rewrite the sentence: split it in two, or join the parts with a plain word ("and", "so", "because") |
| No "not X but Y" | "rather than", "instead of", "without the" | Count them together; state the positive |
| No hype words | Calm words: quietly, steady, honest, practical | A fact in place of the adjective |
| Avoid lists of three | Everything in pairs | List as many items as there are |
| Be specific | Invented numbers and stories | Brief facts, or a plainer line |
| Short sentences | A drumbeat of fragments | Let 1 sentence per section run long |
| End strong | A moral or quip on every paragraph | End on information |
| Vary section length | One huge and one tiny section on every page | Length follows the material |
<!-- /crisp:shared taste -->

## Lessons

<!-- crisp:shared lessons -->
**Lessons log.** The pack learns the user's taste from their corrections.

- **Before you start:** when `.crisp/lessons.md` exists, read it. Apply every line tagged with this skill or with `all`.
- **This file is always writable.** Appending to `.crisp/lessons.md` is allowed in every skill, read-only ones and ones limited to their target's files included. It never counts against a skill's scope, clean-tree or zero-writes rules.
- **When the user corrects or rejects your output:** append 1 line to `.crisp/lessons.md` (create it if needed) in this shape:
  `- YYYY-MM-DD | <skill or all> | <what was wrong> | <the rule that would have prevented it>`
  Write the rule as a count or a yes/no check, so a later run can test it. One correction, one line. Never log praise, and never log a line the user did not cause.
- **Promote:** when the same rule appears 3 times, tell the user it is ready to move into the pack's shared taste rules (`skills/_shared/taste.md` in the CRISP repo).
<!-- /crisp:shared lessons -->

## Next step

End the report with one line, `Next: <command> - <why>`, picked from these by what this run found. It is the report's only next-step line: where the report template above has a **Next:** field or a `Ready for /<command>` line, write this line there instead (a status line such as `Status: Ready for development` stays as it is). Where the report ends with Handover lines, put it directly above them.

- BLOCKED: source not readable: `/crisp-study <screenshot>` with a screenshot of the page
- INSUFFICIENT SIGNAL: `/crisp-study` again on another page or a sharper screenshot
- LINT NOT CLEAN: `/crisp-study` again after the listed findings are fixed
- WAITING: overwrite: `/crisp-study` again once the user approves, or with `--out DESIGN.study.md`
- No direction chosen yet: `/crisp-worlds` (the new DESIGN.md is one input)
- Turn the tokens into a brand page or design system: `/crisp-brand`
- A feature to design: `/feature-design`
- A landing or sales page: `/crisp-funnel`
- An existing UI to restyle: `/crisp-redesign`, or `/crisp-tune` when only the tone changes
- Saved with `--bank`: the skill in the bank line's `for:` field, or `/crisp` when it says none
