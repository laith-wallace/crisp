---
name: crisp-redesign
description: Redesign an existing UI or website without breaking what works - detects preserve vs overhaul mode, audits the current state first, applies modernisation levers in priority order, and protects SEO, analytics, and accessibility wins from regression. Use when the request is to redesign, modernise, refresh, or upgrade an existing surface.
metadata:
  version: "1.2.0"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
---

# /crisp-redesign - Redesign Without Regression

Misclassifying the redesign mode is the single biggest source of bad redesign output. An agent that treats "refresh our marketing site" as a greenfield build destroys brand equity, SEO, and analytics in one commit. This skill forces mode detection and an audit BEFORE any pixel changes.

Load `.crisp.md` if it exists. Product context, register, and known issues constrain every decision below.

---

## Step 1 - Detect the Mode (first action, always)

| Mode | Signal | Treatment |
|---|---|---|
| **Preserve** | "modernise", "refresh", "clean up", brand is established | Audit first, extract brand tokens, evolve gradually |
| **Overhaul** | "new look", "rebrand", "start fresh visually", brand is changing | New visual language; preserve content, IA, and URLs |
| **Greenfield** | No existing surface, or full rebuild explicitly approved | Hand off to `/feature-design` - this skill does not apply |

If ambiguous, ask exactly ONE question: **"Should this redesign preserve the existing brand, or are we starting visually from scratch?"** Never a question dump. If the mode is inferable from context, declare it and proceed.

---

## Step 2 - Audit Before Touching

Document the current state before proposing a single change. If `.crisp.md` `## Benchmarks` has a `ref:` line for this surface type, capture the reference and the current surface at the same width first, and name the one biggest difference: that is the bar the redesign has to clear, not a mood. Output this audit before any design work:

```
## Redesign Audit: [Surface name]

Mode: [Preserve / Overhaul]

**Brand tokens** - primary/accent colours, type stack, logo treatment, radii
**Information architecture** - page tree, primary nav, key conversion paths
**Content blocks** - what exists, what's doing work, what's filler
**Patterns to preserve** - signature interactions, recognisable hero, copy voice
**Patterns to retire** - AI-slop tells, broken layouts, dead links, generic stock imagery, perf traps
**Current dials** - inferred VARIANCE / MOTION / DENSITY of the existing surface (this is the starting point, not a default)
**SEO baseline** - ranking pages, meta titles, structured data, OG cards. SEO migration is the #1 redesign risk.
**Accessibility wins** - existing focus states, alt text, keyboard nav, contrast that must not regress
**Analytics surface** - tracked button labels, form field names, section IDs that downstream events depend on
```

The three dials (rate each 1-10 on the `/crisp-tune` scale, so both skills share one number: 1-3 low, 4-6 medium, 7-10 high):

- **VARIANCE** - how far the surface departs from category convention: layout topology, type voice, colour ambition
- **MOTION** - how much animation the surface carries: from none/hover-only through to scroll-triggered and decorative
- **DENSITY** - information per viewport: from airy marketing spacing through to data-dense product UI

Run `/crisp-review` on the existing surface as part of the audit - the grade and top issues become the redesign's priority list.

---

## Step 3 - Preservation Rules (Preserve mode)

- **Do not change information architecture** unless asked. Page slugs, anchor IDs, and primary nav labels stay stable for SEO and muscle memory.
- **Extract brand colours before recalibrating.** A brand that is already purple stays purple - execute it better, don't replace it.
- **Preserve copy voice** unless a rewrite is requested. Visual modernisation is not a content rewrite.
- **Honor existing accessibility wins.** Never regress focus states, alt text, keyboard nav, or contrast.
- **Respect existing analytics events.** Do not rename buttons, form fields, or section IDs that tracking depends on.

---

## Step 4 - Modernisation Levers (apply in order, stop when the brief is satisfied)

1. **Typography refresh** - the biggest visual lift per unit of risk. Type scale, weights, tracking, line-height.
2. **Spacing and rhythm** - section padding, vertical rhythm, max-width containment.
3. **Colour recalibration** - desaturate, unify the neutral family, keep the brand accent.
4. **Motion layer** - add craft-level micro-interactions to existing components (route through `/crisp-design-eng`).
5. **Hero and key-section recomposition** - restructure top-of-funnel sections.
6. **Full block replacement** - only when the existing block is unsalvageable.

Each lever is cheaper and safer than the next. Reaching for lever 6 when lever 1 would satisfy the brief is over-delivery risk, not thoroughness.

**Decision tree:**
- IA, content, and SEO are sound → **targeted evolution** (levers 1-4). Roughly 70% of the value at 40% of the risk.
- Visual debt is structural (broken IA, no design system, broken mobile) → **full redesign** with strict content preservation.
- The brand itself is changing → **Overhaul** mode (Step 1): new visual language, with content, IA, and URLs preserved. Only a surface with nothing worth keeping is Greenfield and goes to `/feature-design`.

---

## Step 5 - What Never Changes Silently

Never modify these without explicit user approval, in any mode:

- URL structure / route slugs
- Primary nav labels
- Form field names or field order (breaks analytics and browser autofill)
- Brand logo or wordmark
- Legal, consent, or cookie copy

If the redesign would benefit from changing one of these, surface it as a question with the trade-off stated - do not fold it into the diff.

---

## Step 6 - Quality Gates

Before declaring the redesign done:

1. Run the **Slop Check** below on the redesigned surface. Every tell must be gone, or recorded in `.crisp.md` `## Decisions`.
2. Run the **Mechanical Pre-Flight Checks** from `/crisp-design-eng` (em-dash count, eyebrow count, zigzag cap, CTA contrast and wrap, palette and radius locks, body text size, rendered layout).
3. Run the **Copy Self-Audit** from `/crisp-copy` on every string you touched.
4. Re-run `/crisp-review` in **Blind Mode** - a fresh sub-agent gets the captures of the redesigned surface and the reference, never your lever list - and compare the grade against the audit baseline. The redesign is done when the grade does not drop and the brief's goals are met, because a surface already at A cannot improve its grade.
5. Confirm every item in the SEO baseline and analytics surface from Step 2 is intact.

### Slop Check

<!-- crisp:shared slop-tells -->
**Would someone look at this and immediately say "AI made that"?**

| Tell | What it looks like |
|------|--------------------|
| Hero metric template | Big number, small label, supporting stats below, gradient accent, with no context that explains the product |
| Identical card grid | Same-sized cards repeating icon + heading + text with equal visual weight |
| Side-stripe borders | Coloured left or right border (>1px) on cards or alerts as the primary decorative element, not a real alert or status |
| Gradient text | `background-clip: text` treatment on headings or CTAs |
| Off-brand purple-blue gradient | Purple or indigo to blue gradient on a background, button, or accent when the brand colour is not purple |
| Glassmorphism default | Blur + transparency used as the primary surface treatment, not as a specific elevated element |
| Glow halo | Radial glow, blurred colour blob, or soft spotlight behind a hero or section to show importance |
| Hero pill badge | Pill or eyebrow label above the hero headline ("New", "Introducing", "Now with AI") |
| Icon tile stack | An icon in a rounded-square tile above every card or section heading |
| Nested cards | A bordered or shadowed card inside another bordered or shadowed card |
| Fake sequence labels | Numbered labels (01, 02, 03) on items that are not steps a user follows in order |
| Decorative motion | Pulsing dots, bounce or elastic easing, hover zoom on cards, or an auto-scrolling logo strip where no state changes |
| Template copy | "Supercharge", "world-class", "seamless", or "Not a feature. A platform." in a headline or hero |
| SaaS cream + generic sans | Off-white background with no tint, Inter, Geist, Roboto or DM Sans on every level, zero distinctive colour decision |
| Saturated aesthetic lane | Editorial-typographic (italic display serif + mono labels + ruled separators) used as a default not a deliberate choice |

**Binary rule: one or more tells present = Fail. Zero tells = Pass.** It is a disqualifier, not a dimension. A tell recorded in `.crisp.md` `## Decisions` as accepted for this surface does not count. A purple gradient on a brand that is purple is not a tell. A pattern documented in the project's DESIGN.md or .crisp.md tokens is a decision, not a tell.

**Model overlay: Cursor.** Seed list, unverified: confirm with scripts/slop-harvest.mjs before trusting. Cursor runs several model families, so these are tells commonly attributed to its default component stack, not to one model. Until a harvest run confirms a row, a match is a note in the report, not a Fail.

| Tell | What it looks like | Nearest detector rule |
|------|--------------------|-----------------------|
| Untouched component-kit defaults | Zinc or slate neutrals, default radius, every surface wrapped in a bordered card | `nested-card-selector` (partial) |
| Card inside card | A `Card` component holding further bordered or shadowed panels | `nested-card-selector` |
| Icon-only buttons with no label | Icon buttons from the kit with no `aria-label` or visible text | `icon-button-no-label` |
| Blanket transitions | `transition-all` or `transition: all` on most interactive elements | `transition-all` |
<!-- /crisp:shared slop-tells -->

---

## Output Format

```
## Redesign: [Surface name]

Mode: [Preserve / Overhaul]
Baseline grade: [from audit] → Post-redesign grade: [from re-review]

### Levers applied
1. [Lever] - [what changed, one line]
2. ...

### Preserved deliberately
- [Brand tokens / IA / copy voice items kept and why]

### Retired
- [Patterns removed, each named]

### Untouched protected surface
- [URLs, nav labels, form fields, analytics IDs confirmed intact]

### Needs user approval
- [Any Step 5 item the redesign wants to change, with trade-off]

Captured: [widths, themes, states]
Not checked: [what you did not see, and why]
Assumptions: [what you took as true without checking]
Unresolved: [open findings with file:line]
```

The last four lines follow the shared Handover Lines rule (`/crisp-proof`, `/crisp-loop`): `none` is a valid value, a missing line is not.

## Longitudinal Tracking

Append to the `## History` section of `.crisp.md` (if it exists). Get today's date from the `date` command (`date +%Y-%m-%d`) - never from memory:

```
- [YYYY-MM-DD] | /crisp-redesign | Mode: [Preserve/Overhaul] | [Baseline grade] → [New grade] | Levers: [1-6 applied]
```

---

## Relationship to Other CRISP Skills

```
/crisp-review     →  grades the existing surface (audit baseline) and the result
/crisp-design-eng →  motion and micro-interaction craft for lever 4, mechanical pre-flight
/crisp-copy       →  copy self-audit for any strings touched
/feature-design   →  takes over when the mode is genuinely greenfield
/handoff          →  developer-ready spec once the redesign passes quality gates
```

*Redesign protocol adapted from taste-skill (MIT, github.com/Leonxlnx/taste-skill) for the CRISP framework.*

## Finish check

<!-- crisp:shared finish-check -->
**Finish check.** Before you say a built or changed page is done, measure it as the browser draws it. Screenshots go to `.crisp/render/`: tool output, git-ignored, and never counted as an edit outside this skill's scope.

```bash
mkdir -p .crisp/render && { grep -qx '\*' .crisp/render/.gitignore 2>/dev/null || printf '*\n' >> .crisp/render/.gitignore; } && rm -f .crisp/render/*.png
npx @laith-wallace/crisp render-check "<local url>" --width 1280,375 --shots .crisp/render
```

- Exit 0: clean. Say so in the report.
- Exit 2: findings. `page-overflow-x`, `overlapping-text`, `text-cut` and `text-spills` are bugs, never style choices. Fix them and run it again, at most 3 rounds.
- Exit 3 (inconclusive), exit 1 (no URL, no Playwright, or the page did not load), or no local URL to give it: report `render-check: untested` with the reason. Never report the page as checked, and open no screenshots: an untested or inconclusive run proves nothing about the layout.

Only after exit 0 or 2, open `.crisp/render/render-1280.png` and `.crisp/render/render-375.png` (the folder was emptied first, so both are from this run) and look at them once against the taste rules. A clean exit code proves the layout holds, not that the page has taste.
<!-- /crisp:shared finish-check -->

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

- Then: `/crisp-loop` to a grade of B
- Then: `/crisp-proof` for before and after
