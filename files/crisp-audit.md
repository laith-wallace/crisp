---
name: crisp-audit
description: Full CRISP framework evaluation of a UI design. Scores all five dimensions — Contextual, Responsive, Intelligent, Seamless, Powerful — with P0–P3 severity ratings, benchmarks against Stripe, Linear, Notion, Asana, and Slack, and delivers a prioritised action plan. Use when doing a thorough design review. If .crisp.md exists, load it first for project context.
user-invocable: true
---

# /crisp-audit — Full CRISP Evaluation

Analyse the provided design (screenshot, Figma link, or description) with the critical eye of a senior product designer. If `.crisp.md` exists in the project root, load it before beginning — your analysis should be grounded in the specific product context, users, and benchmarks documented there.

## Step 1: 30-Second Scan

Before structured analysis, capture first impressions:
- **Strengths**: What works immediately
- **Red Flags**: The most critical issues visible at a glance
- **Overall Grade**: A–F with one-line justification

## Step 2: CRISP Dimension Scoring

Rate each dimension 1–10 and identify specific violations. Use the failure indicators below as your diagnostic criteria.

### C — Contextual
**Test:** Can the user tell where they are and what this page does within 5 seconds?

Fail indicators:
- Generic empty states ("No data available" vs. "You haven't added any deals yet. Add your first one to start tracking.")
- Missing breadcrumbs or location signals on deep pages
- Page title or heading doesn't reflect what the user is doing
- No orientation after a user action ("What just happened?")

Violation examples:
- Generic "Success" message → Fails C. Tell the user exactly what changed.
- Empty dashboard with no call-to-action → Fails C. Show what they're missing and how to get it.

### R — Responsive
**Test:** Does the UI update immediately on every interaction?

Fail indicators:
- Spinner appears on filter changes, tab switches, or any action the user can predict the result of
- Click-wait-update patterns where the user has to wait to see their action reflected
- No hover feedback on interactive elements
- No loading skeleton — blank space appears while content loads

Violation examples:
- Spinner on search → Fails R. Use debounced optimistic filtering.
- Page refresh on form submit → Fails R. Update inline, background sync.

### I — Intelligent
**Test:** Are we showing insight, not raw data?

Fail indicators:
- Numbers displayed without context, comparison, or suggested action
- Blank/empty forms when we already know the user's data
- No next-best-action when the user reaches a dead end
- We know the user's history but present them a generic experience

Violation examples:
- "1,247" with no label, no comparison, no action → Fails I.
- Empty form when user has done this before → Fails I. Pre-populate from their last session.

### S — Seamless
**Test:** Are we fitting into their day — not forcing them into ours?

Fail indicators:
- Redirect to a portal or separate app for a task the user considers routine
- Forced login to complete an action that could be handled inline or via email
- Custom UI components that break familiar mental models (e.g. a custom dropdown that doesn't behave like a dropdown)
- Unnecessary page reloads for contextual tasks

Violation examples:
- "Open in portal to approve" → Fails S. Inline approval card, one click.
- Custom date picker with non-standard interactions → Fails S. Use the native or library standard.

### P — Powerful
**Test:** Is complexity hidden appropriately for each user type?

Fail indicators:
- All settings visible to all users regardless of role or experience level
- No keyboard shortcuts for power users
- No undo — destructive actions are permanent without confirmation
- Advanced options surfaced to novices who don't need them

Violation examples:
- 23 settings on the main view → Fails P. Surface 3–5, collapse the rest.
- Delete with no undo or confirm → Fails P. Soft delete with 5-second undo.

## Step 3: Severity Rating

Rate each violation using this scale:

| Priority | Definition | Example |
|----------|-----------|---------|
| P0 | Blocks the user entirely | Empty state with no recovery path |
| P1 | Major friction — user can work around it but shouldn't have to | Spinner on every filter change |
| P2 | Noticeable degradation in experience | Generic empty state copy |
| P3 | Minor polish issue | Missing hover state on secondary action |

## Step 4: Benchmark Comparison

Compare against one or more of these exemplars (or the benchmarks from `.crisp.md`):
- **Stripe**: Clean, trustworthy, progressive disclosure, excellent error handling
- **Linear**: Minimal, fast, keyboard-native, excellent micro-interactions
- **Notion**: Flexible, intuitive, powerful yet approachable, great onboarding
- **Asana**: Task-focused, clear status indicators, seamless collaboration
- **Slack**: Clear hierarchy, efficient workflows, contextual design

## Output Format

Structure the audit as:

```
## CRISP Audit: [Screen/Feature Name]

**Grade: [A–F]** — [One-line verdict]

### 30-Second Impression
Strengths: [2–3 bullet points]
Red Flags: [2–3 bullet points]

### CRISP Scorecard
| Dimension   | Score | Key Violation                        |
|-------------|-------|--------------------------------------|
| Contextual  | /10   | [Most critical C failure]            |
| Responsive  | /10   | [Most critical R failure]            |
| Intelligent | /10   | [Most critical I failure]            |
| Seamless    | /10   | [Most critical S failure]            |
| Powerful    | /10   | [Most critical P failure]            |
| **Total**   | **/50** |                                    |

### Violations by Priority
**P0 — Fix immediately**
- [Dimension tag] [Specific violation] → [Specific fix]

**P1 — Fix this sprint**
- [Dimension tag] [Specific violation] → [Specific fix]

**P2–P3 — Backlog**
- [List]

### Quick Wins (high-impact, low-effort)
- [List]

### Benchmark Comparison
Compared against [Stripe / Linear / Notion / project benchmark]:
[2–3 sentences on where this design falls vs. the benchmark]

### Strategic Recommendations
- [How to elevate to world-class — 2–3 points]
- [User research questions to validate]
- [Success metrics to track]
```

## Analysis Style

- Be direct and specific. "This fails I" is useful. "The UX could be improved" is not.
- Every violation should have a specific fix, not a direction.
- Prioritise by user impact, not by what's easiest to say.
- Reference the user context from `.crisp.md` if available — a violation matters more or less depending on who the user is.
- If `.crisp.md` lists `Extensions: CRISP + AI`, note AI-specific dimension violations using the `/crisp-ai` lens.

## Longitudinal Tracking

After delivering the audit output, append a one-line summary to the `## History` section in `.crisp.md`:

```
- [YYYY-MM-DD] | /crisp-audit | C:[score] R:[score] I:[score] S:[score] P:[score] | Grade: [A–F] | Top issue: [P0/P1 summary in <10 words]
```

Example:
```
- 2026-03-31 | /crisp-audit | C:7 R:8 I:5 S:9 P:6 | Grade: B | Top issue: [I] Numbers without context on dashboard
```

If `.crisp.md` has prior History entries, call out any dimension regressions: "Your I score has dropped from 7 to 5 since the last audit — the Intelligent dimension has regressed."
