---
name: crisp-review
description: "30-second CRISP design scan - a grade A-F and the top 3 issues by user impact with specific fixes. Use during rapid iteration when a full audit would slow you down: 'quick look at this', 'sanity check this screen', 'grade this'."
metadata:
  version: "1.3.1"
---

# /crisp-review - Quick CRISP Scan

A fast, high-signal design pass. Not a full audit - a diagnostic. Use this during iteration when you need clear direction, not a comprehensive report.

If `.crisp.md` exists in the project root, load it. Your review should be grounded in the specific product, users, and priorities documented there - including the **register**: a Brand surface is judged on distinctiveness, a Product surface on how completely it disappears into the task.

**Surface register**: `.crisp.md`'s register is the project default, not a verdict on this specific target. If the target's path or content clearly signals the other register (project registered Product but this target is `/marketing/`, `/pricing/`, `/(landing)/`, or a campaign page, or vice versa), judge this scan against the surface's actual register and note it in one line. Don't ask - infer and move on; asking would defeat a 30-second scan.

If the design is a live codebase rather than a screenshot: read the component before grading, verify each issue against the code, and cite file and line in the output. Even a 30-second scan cites its evidence.

## Pre-Scan: Slop Check

Before evaluating CRISP dimensions, run one fast check:

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

**Binary rule: one or more tells present = Fail. Zero tells = Pass.** It is a disqualifier, not a dimension. A tell recorded in `.crisp.md` `## Decisions` as accepted for this surface does not count. A purple gradient on a brand that is purple is not a tell.
<!-- /crisp:shared slop-tells -->

If the target is a live codebase (markup/style files, not a screenshot or Figma link), run `npx @laith-wallace/crisp detect --json <target>` first - it's faster than reasoning about it and it's exact. Fold any findings straight into the Fail verdict above instead of re-deriving them by eye. Skip it for screenshot-only or Figma-link targets and judge by eye instead.

Tells come from the detector or from your own read. If Fail - flag it at the top of your output before the grade, naming the detector's rule id when it came from the scan.

This takes 5 seconds. Do it before anything else.

---

## What to Evaluate

Scan the design against all five CRISP dimensions, but don't score each one individually. Instead:

1. Identify the **single most critical issue per dimension** (if one exists)
2. From those, surface the **top 3 issues by user impact**
3. Assign a **grade** that reflects the overall quality

## Grading Scale

<!-- crisp:shared grade-scale -->
Grades are countable, not vibes. Rate every issue P0-P3 first, then the grade follows from the counts:

| Grade | Rule | Meaning |
|-------|------|---------|
| A | Zero P0, zero P1 | World-class. Ship it. Minor polish only. |
| B | Zero P0, one or two P1s | Good. One or two fixable issues. |
| C | Zero P0, three or more P1s | Functional but frustrating. |
| D | One P0 | Users will struggle. Core experience broken. |
| F | Two or more P0s | Blocks users entirely. Don't ship. |

This rule is shared by `/crisp-review` and `/crisp-audit`, so History entries from both are comparable. A skill that also scores dimensions out of 50 takes the lower of its /50 grade and this count grade.
<!-- /crisp:shared grade-scale -->

### Severity

<!-- crisp:shared severity -->
| Priority | Definition | Example |
|----------|-----------|---------|
| P0 | Blocks the user entirely | Empty state with no recovery path |
| P1 | Major friction - user can work around it but shouldn't have to | Spinner on every filter change |
| P2 | Noticeable degradation in experience | Generic empty state copy |
| P3 | Minor polish issue | Missing hover state on secondary action |
<!-- /crisp:shared severity -->

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

<!-- crisp:shared evidence-gate -->
## Evidence Gate

Every finding passes this gate before it reaches the output. A finding you cannot evidence is a guess, and guesses erode trust in the real findings.

1. **Quote the evidence.** Live code: `file:line` plus the verbatim line. Screenshot or Figma: name the element and where it sits. Written description: quote the sentence that shows the problem.
2. **Name the broken principle.** The CRISP dimension, WCAG criterion, UX law, or `.crisp.md` Named Rule the evidence violates. "Feels off" is not a finding. Taste is debuggable: trace it to a principle or drop it.
3. **Score confidence 1-10.** No quoted evidence caps the score at 4.

| Confidence | Meaning | What happens |
|---|---|---|
| 8-10 | Evidence quoted, principle named, problem confirmed | Report normally |
| 5-7 | Evidence quoted, but impact depends on context you lack (traffic, user type, intent) | Report with `(verify: <the one thing to check>)` after the fix |
| 1-4 | No evidence, or speculation | Leave out of the main output. List under `Unverified` at the end only when it would be a P0 if true |

Severity and confidence are separate. A P0 at confidence 5 is still a P0; the `verify` note tells the reader what would confirm it. Scores stay internal unless the output format shows them. Their effect is which findings appear and how.
<!-- /crisp:shared evidence-gate -->

<!-- crisp:shared decisions -->
## Settled Decisions

Before reporting, read the `## Decisions` section of `.crisp.md` if it exists. Each line is a finding the team already ruled on:

```
- YYYY-MM-DD | <rule, tell, or issue> | <surface path, or "all"> | accepted | <reason>
```

- **Same issue, same surface:** drop the finding. Add `Suppressed by decisions: N` as the last line of the output so nothing disappears silently.
- **The reason no longer holds** (the decision cites Brand register but this surface is Product, or the accepted element now blocks a task): report the finding, cite the decision's date, and state in one line what changed.
- **Never re-raise a settled decision on judgement alone.** New evidence reopens it; a different opinion does not.

When the user rejects a finding in this session with explicit words ("that's intentional", "on-brand", "won't fix", "leave it"), append one line to `## Decisions`, creating the section at the end of `.crisp.md` if it is missing. Get the date from `date +%Y-%m-%d`. Record only what the user said. Never log a decision on your own initiative.
<!-- /crisp:shared decisions -->

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
