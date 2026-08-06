---
name: crisp-review
description: 30-second CRISP design scan - a grade A-F and the top 3 issues by user impact with specific fixes. Use during rapid iteration when a full audit would slow you down: 'quick look at this', 'sanity check this screen', 'grade this'.
user-invocable: true
version: "1.2.0"
---

# /crisp-review - Quick CRISP Scan

A fast, high-signal design pass. Not a full audit - a diagnostic. Use this during iteration when you need clear direction, not a comprehensive report.

If `.crisp.md` exists in the project root, load it. Your review should be grounded in the specific product, users, and priorities documented there - including the **register**: a Brand surface is judged on distinctiveness, a Product surface on how completely it disappears into the task.

**Surface register**: `.crisp.md`'s register is the project default, not a verdict on this specific target. If the target's path or content clearly signals the other register (project registered Product but this target is `/marketing/`, `/pricing/`, `/(landing)/`, or a campaign page, or vice versa), judge this scan against the surface's actual register and note it in one line. Don't ask - infer and move on; asking would defeat a 30-second scan.

If the design is a live codebase rather than a screenshot: read the component before grading, verify each issue against the code, and cite file and line in the output. Even a 30-second scan cites its evidence.

## Pre-Scan: Slop Check

Before evaluating CRISP dimensions, run one fast check:

**Would someone look at this and immediately say "AI made that"?**

If the target is a live codebase (markup/style files, not a screenshot or Figma link), run `npx @laith-wallace/crisp detect --json <target>` first - it's faster than reasoning about it and it's exact. Fold any findings straight into the Fail verdict below instead of re-deriving them by eye. Skip it for screenshot-only or Figma-link targets and judge by eye instead.

One or more tells present (from the detector, or from your own read) = Fail. Zero tells = Pass. If Fail - flag it at the top of your output before the grade, naming the detector's rule id when it came from the scan. It is a disqualifier, not a dimension. Specific tells: hero metric template (big number + gradient accent), identical card grid, side-stripe borders, gradient text, glassmorphism as default surface, generic sans-serif + off-white with no design decision evident.

This takes 5 seconds. Do it before anything else.

---

## What to Evaluate

Scan the design against all five CRISP dimensions, but don't score each one individually. Instead:

1. Identify the **single most critical issue per dimension** (if one exists)
2. From those, surface the **top 3 issues by user impact**
3. Assign a **grade** that reflects the overall quality

## Grading Scale

Grades are countable, not vibes - rate each issue P0–P3 first, then the grade follows. These boundaries match `/crisp-audit`'s grade mapping, so History entries from both commands are comparable.

| Grade | Rule | Meaning |
|-------|------|---------|
| A | Zero P0, zero P1 | World-class. Ship it. Minor polish only. |
| B | Zero P0, one or two P1s | Good. One or two fixable issues. |
| C | Zero P0, three or more P1s | Functional but frustrating. |
| D | One P0 | Users will struggle. Core experience broken. |
| F | Two or more P0s | Blocks users entirely. Don't ship. |

## CRISP Quick-Check

Use these as your diagnostic lens during the scan:

- **C** - Does the user know where they are within 5 seconds?
- **R** - Does every interaction feel instant?
- **I** - Is data presented as insight, not just numbers?
- **S** - Does the user stay in their flow, or get pushed out of it?
- **P** - Is complexity hidden from those who don't need it?

Additional craft checks - flag any as issues or Quick Wins:

- **No dead zones** - if any part of a control looks interactive, it must be interactive; no decoy hit areas
- **All states present** - every component has empty, sparse, dense, and error states; missing states become developer inventions
- **Stable skeletons** - loading skeletons must match the final layout exactly; a skeleton that shifts on load is worse than no skeleton
- **Don't pre-disable submit** - forms allow submission before all fields are filled so validation errors can surface; a pre-disabled button hides which fields are required

## Output Format

Keep it tight. No lengthy explanations.

```
## CRISP Review: [Screen/Feature Name]

**Slop Check: [Pass / Fail]** - [If Fail, one line naming the specific tell]

**Grade: [A–F]** - [One punchy verdict sentence]

**Strengths**
- [What's working - 1–2 points max]

**Top 3 Issues**

1. [C/R/I/S/P] **[Issue title]**
   What's wrong: [One sentence, specific]
   Fix: [One sentence, specific - not a direction, an action]

2. [C/R/I/S/P] **[Issue title]**
   What's wrong: [One sentence]
   Fix: [One sentence]

3. [C/R/I/S/P] **[Issue title]**
   What's wrong: [One sentence]
   Fix: [One sentence]

**Quick Wins**
- [High-impact, low-effort items that didn't make the top 3]
```

## Examples of Good vs. Weak Feedback

**Weak:** "The empty state could be improved."
**Good:** "[C] Empty state says 'No data' with no CTA. Replace with: 'You haven't added any suppliers yet. [Add your first supplier]'"

**Weak:** "Loading feels slow."
**Good:** "[R] Filter results wait for API response before updating. Switch to optimistic filtering - show results immediately, reconcile in background."

**Weak:** "The dashboard shows too much."
**Good:** "[P] 11 metrics visible at once, all with equal visual weight. Promote 3 most-used to hero cards. Collapse the rest into a secondary grid."

## Tone

Direct. Specific. Actionable. No softening. If the design fails, say it fails and say exactly why. The goal is to make the next iteration better, not to protect feelings.

## Longitudinal Tracking

After delivering the review output, append a one-line summary to the `## History` section in `.crisp.md` (if it exists). Get today's date from the `date` command (`date +%Y-%m-%d`) - never from memory:

```
- [YYYY-MM-DD] | /crisp-review | Grade: [A–F] | Top issue: [top issue in <10 words]
```

Example:
```
- 2026-03-31 | /crisp-review | Grade: C | Top issue: [R] No loading states on filter interactions
```

If `.crisp.md` has prior History entries, note whether the grade has improved or regressed since the last entry.

If the target resolves to a real slug (skip for vague/root-level targets), also persist a structured per-surface snapshot so a later scan can read this target's own trend without parsing `.crisp.md` prose. Fire-and-forget - don't block or show raw output:

```bash
CRISP_CRITIQUE_META='{"command":"/crisp-review","date":"<today, from date +%Y-%m-%d>","grade":"<A-F>","p0_count":<n>,"p1_count":<n>}' \
  npx @laith-wallace/crisp critique write "<resolved target>" <body-file>
```
