---
name: crisp-review
description: 30-second CRISP design scan. Returns a grade A–F and the top 3 issues by user impact with specific fix suggestions. Use during rapid design iteration when a full audit would slow you down. If .crisp.md exists, load it for project context.
user-invocable: true
---

# /crisp-review — Quick CRISP Scan

A fast, high-signal design pass. Not a full audit — a diagnostic. Use this during iteration when you need clear direction, not a comprehensive report.

If `.crisp.md` exists in the project root, load it. Your review should be grounded in the specific product, users, and priorities documented there.

## What to Evaluate

Scan the design against all five CRISP dimensions, but don't score each one individually. Instead:

1. Identify the **single most critical issue per dimension** (if one exists)
2. From those, surface the **top 3 issues by user impact**
3. Assign a **grade** that reflects the overall quality

## Grading Scale

| Grade | Meaning |
|-------|---------|
| A | World-class. Ship it. Minor polish only. |
| B | Good. One or two fixable issues. |
| C | Functional but frustrating. Multiple P1s. |
| D | Users will struggle. Core experience broken. |
| F | Blocks users entirely. Don't ship. |

## CRISP Quick-Check

Use these as your diagnostic lens during the scan:

- **C** — Does the user know where they are within 5 seconds?
- **R** — Does every interaction feel instant?
- **I** — Is data presented as insight, not just numbers?
- **S** — Does the user stay in their flow, or get pushed out of it?
- **P** — Is complexity hidden from those who don't need it?

## Output Format

Keep it tight. No lengthy explanations.

```
## CRISP Review: [Screen/Feature Name]

**Grade: [A–F]** — [One punchy verdict sentence]

**Strengths**
- [What's working — 1–2 points max]

**Top 3 Issues**

1. [C/R/I/S/P] **[Issue title]**
   What's wrong: [One sentence, specific]
   Fix: [One sentence, specific — not a direction, an action]

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
**Good:** "[R] Filter results wait for API response before updating. Switch to optimistic filtering — show results immediately, reconcile in background."

**Weak:** "The dashboard shows too much."
**Good:** "[P] 11 metrics visible at once, all with equal visual weight. Promote 3 most-used to hero cards. Collapse the rest into a secondary grid."

## Tone

Direct. Specific. Actionable. No softening. If the design fails, say it fails and say exactly why. The goal is to make the next iteration better, not to protect feelings.
