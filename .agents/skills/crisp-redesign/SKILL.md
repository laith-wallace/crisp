---
name: crisp-redesign
description: Redesign an existing UI or website without breaking what works - detects preserve vs overhaul mode, audits the current state first, applies modernisation levers in priority order, and protects SEO, analytics, and accessibility wins from regression. Use when the request is to redesign, modernise, refresh, or upgrade an existing surface.
user-invocable: true
version: "1.1.0"
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

Document the current state before proposing a single change. Output this audit before any design work:

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

The three dials (rate each Low / Medium / High):

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
- The brand itself is changing → treat as greenfield, hand off to `/feature-design`.

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

1. Run the **Mechanical Pre-Flight Checks** from `/crisp-design-eng` (em-dash count, eyebrow count, zigzag cap, CTA contrast and wrap, palette and radius locks).
2. Run the **Copy Self-Audit** from `/crisp-copy` on every string you touched.
3. Re-run `/crisp-review` and compare the grade against the audit baseline. A redesign that does not improve the grade is not done.
4. Confirm every item in the SEO baseline and analytics surface from Step 2 is intact.

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
```

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
