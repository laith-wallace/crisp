---
name: crisp-audit
description: Full CRISP evaluation of a UI design - scores all five dimensions with P0-P3 severity, benchmarks against world-class products, and delivers a prioritised action plan. Use for a thorough design review: 'audit this', 'score this design', 'how good is this UI, really'.
user-invocable: true
version: "1.1.0"
---

# /crisp-audit - Full CRISP Evaluation

Analyse the provided design (screenshot, Figma link, description, or live codebase) with the critical eye of a senior product designer. If `.crisp.md` exists in the project root, load it before beginning - your analysis should be grounded in the specific product context, users, and benchmarks documented there.

## Evidence Before Judgement

When the design is a live codebase, do not grade from impressions - gather evidence first:

1. Read the relevant components and enumerate their actual states: does an empty state exist in the code? A loading skeleton? An error branch? A disabled state? A state that exists in code passes; a state that doesn't is a finding, not a guess.
2. Search for mechanical violations: pre-disabled submit buttons, spinner-on-filter patterns, generic "Something went wrong" strings, missing hover/focus states.
3. If the project runs locally, render the surface and screenshot it before scoring.
4. Cite evidence for every violation: file and line for code, screen region for screenshots. A violation without a citation is an impression, not a finding.

## Step 0: AI Slop Check

Before evaluating CRISP dimensions, run a rapid anti-monoculture check. This is a disqualifier, not a dimension - it fires before scoring.

**Question: Would someone look at this and immediately say "AI made that"?**

Check for these specific tells:

| Tell | What it looks like |
|------|--------------------|
| Hero metric template | Big number, small label, supporting stats below, gradient accent |
| Identical card grid | Same-sized cards repeating icon + heading + text with equal visual weight |
| Side-stripe borders | Coloured left or right border (>1px) on cards or alerts as the primary decorative element |
| Gradient text | `background-clip: text` treatment on headings or CTAs |
| Glassmorphism default | Blur + transparency used as the primary surface treatment, not as a specific elevated element |
| SaaS cream + generic sans | Off-white background with no tint, Inter or DM Sans, zero distinctive colour decision |
| Saturated aesthetic lane | Editorial-typographic (italic display serif + mono labels + ruled separators) used as a default not a deliberate choice |

**Binary rule: one or more tells present = Fail. Zero tells = Pass.** No judgement call.

If any tells are present:
- Name them explicitly in the audit output
- Flag which CRISP dimension they affect (usually I - lack of insight over raw display, or C - user can't differentiate this from any other product)
- Register-aware: a "saturated aesthetic lane" failure is more serious in Brand register (distinctiveness is the goal); in Product register, over-decoration is the primary failure mode

```
## AI Slop Check
Result: [Pass / Fail]
Tells identified: [List specific tells, or "None"]
Dimension impact: [Which dimensions are affected]
```

If Fail - note it at the top of the audit output, before the grade.

---

## Step 1: 30-Second Scan

Before structured analysis, capture first impressions:
- **Strengths**: What works immediately
- **Red Flags**: The most critical issues visible at a glance
- **Overall Grade**: A–F with one-line justification

## Step 2: CRISP Dimension Scoring

Rate each dimension 1–10 and identify specific violations. Use the failure indicators below as your diagnostic criteria.

**Scoring rule (mechanical - do not score by feel):** identify the dimension's violations first, rate their severity (Step 3), then compute the score: start at 10, subtract 3 per P0, 2 per P1, and 1 per P2 (P3s subtract nothing), floor at 1. Scores derived this way are reproducible - which is what makes the History tracking in `.crisp.md` meaningful across runs.

**Grade mapping (shared with `/crisp-review` so History entries are comparable):**

| Total /50 | Grade |
|---|---|
| 45–50 | A |
| 38–44 | B |
| 30–37 | C |
| 20–29 | D |
| ≤ 19 | F |

Any P0 caps the grade at C regardless of total.

### C - Contextual
**Test:** Can the user tell where they are and what this page does within 5 seconds?

Fail indicators:
- Generic empty states ("No data available" vs. "You haven't added any deals yet. Add your first one to start tracking.")
- Missing breadcrumbs or location signals on deep pages
- Page title or heading doesn't reflect what the user is doing
- No orientation after a user action ("What just happened?")
- Missing states - empty, sparse, dense, or error states are undesigned; developers will invent them, and invented states are always wrong

Violation examples:
- Generic "Success" message → Fails C. Tell the user exactly what changed.
- Empty dashboard with no call-to-action → Fails C. Show what they're missing and how to get it.

### R - Responsive
**Test:** Does the UI update immediately on every interaction?

Fail indicators:
- Spinner appears on filter changes, tab switches, or any action the user can predict the result of
- Click-wait-update patterns where the user has to wait to see their action reflected
- No hover feedback on interactive elements
- No loading skeleton - blank space appears while content loads
- Dead zones - areas that look interactive are not clickable; misleads intent and wastes user actions
- Unstable skeletons - loading skeleton layout differs from the final content, causing layout shift on load

Violation examples:
- Spinner on search → Fails R. Use debounced optimistic filtering.
- Page refresh on form submit → Fails R. Update inline, background sync.

### I - Intelligent
**Test:** Are we showing insight, not raw data?

Fail indicators:
- Numbers displayed without context, comparison, or suggested action
- Blank/empty forms when we already know the user's data
- No next-best-action when the user reaches a dead end
- We know the user's history but present them a generic experience

Violation examples:
- "1,247" with no label, no comparison, no action → Fails I.
- Empty form when user has done this before → Fails I. Pre-populate from their last session.

### S - Seamless
**Test:** Are we fitting into their day - not forcing them into ours?

Fail indicators:
- Redirect to a portal or separate app for a task the user considers routine
- Forced login to complete an action that could be handled inline or via email
- Custom UI components that break familiar mental models (e.g. a custom dropdown that doesn't behave like a dropdown)
- Unnecessary page reloads for contextual tasks
- Pre-disabled submit - the submit button is disabled until all fields are filled, hiding which fields are required and preventing error discovery

Violation examples:
- "Open in portal to approve" → Fails S. Inline approval card, one click.
- Custom date picker with non-standard interactions → Fails S. Use the native or library standard.

### P - Powerful
**Test:** Is complexity hidden appropriately for each user type?

Fail indicators:
- All settings visible to all users regardless of role or experience level
- No keyboard shortcuts for power users
- No undo - destructive actions are permanent without confirmation
- Advanced options surfaced to novices who don't need them

Violation examples:
- 23 settings on the main view → Fails P. Surface 3–5, collapse the rest.
- Delete with no undo or confirm → Fails P. Soft delete with 5-second undo.

## Step 3: Severity Rating

Rate each violation using this scale:

| Priority | Definition | Example |
|----------|-----------|---------|
| P0 | Blocks the user entirely | Empty state with no recovery path |
| P1 | Major friction - user can work around it but shouldn't have to | Spinner on every filter change |
| P2 | Noticeable degradation in experience | Generic empty state copy |
| P3 | Minor polish issue | Missing hover state on secondary action |

## Step 3b: Emotional Journey Check

After scoring the CRISP dimensions, check the emotional arc of the user's experience. This is a short, targeted check - not a full journey map.

**Peak-end rule**: Users judge an experience primarily by its emotional peak (highest or lowest point) and its ending. A technically competent design can fail if the highest-anxiety moment gets no reassurance, or if the flow ends without confirming success.

Ask:
- **Where does user anxiety peak?** (Destructive action, payment, form submission, irreversible decision)
- **Does the design provide reassurance at that exact moment?** (Confirmation copy, undo, preview, progress indicator)
- **What does the user feel when the flow ends?** (Success state - specific or generic? Any signal of what changed?)

Flag as a violation if:
- A high-stakes action has no reassurance mechanism (no confirmation, no preview, no undo)
- The success state is generic ("Done" rather than what specifically changed)
- The ending leaves the user uncertain about what happened

Add to output:
```
### Emotional Journey
Anxiety peak: [Where in the flow does anxiety spike]
Reassurance present: [Yes / No - and what form it takes]
Ending quality: [What the user feels when the flow completes]
Gap: [Any moment that feels unaddressed - or "None identified"]
```

---

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

### AI Slop Check
Result: [Pass / Fail]
[If Fail - list specific tells before anything else]

**Grade: [A–F]** - [One-line verdict]

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

### Emotional Journey
Anxiety peak: [Where in the flow does anxiety spike]
Reassurance present: [Yes / No - and what form it takes]
Ending quality: [What the user feels when the flow completes]
Gap: [Any moment that feels unaddressed, or "None identified"]

### Violations by Priority
**P0 - Fix immediately**
- [Dimension tag] [Specific violation] → [Specific fix]

**P1 - Fix this sprint**
- [Dimension tag] [Specific violation] → [Specific fix]

**P2–P3 - Backlog**
- [List]

### Quick Wins (high-impact, low-effort)
- [List]

### Benchmark Comparison
Compared against [Stripe / Linear / Notion / project benchmark]:
[2–3 sentences on where this design falls vs. the benchmark]

### Strategic Recommendations
- [How to elevate to world-class - 2–3 points]
- [User research questions to validate]
- [Success metrics to track]
```

## Analysis Style

- British English in all output.
- Be direct and specific. "This fails I" is useful. "The UX could be improved" is not.
- Every violation should have a specific fix, not a direction.
- Prioritise by user impact, not by what's easiest to say.
- Reference the user context from `.crisp.md` if available - a violation matters more or less depending on who the user is.
- If `.crisp.md` lists `Extensions: CRISP + AI`, note AI-specific dimension violations using the `/crisp-ai` lens.

## Longitudinal Tracking

After delivering the audit output, append a one-line summary to the `## History` section in `.crisp.md`. Get today's date from the `date` command (`date +%Y-%m-%d`) - never from memory:

```
- [YYYY-MM-DD] | /crisp-audit | C:[score] R:[score] I:[score] S:[score] P:[score] | Grade: [A–F] | Top issue: [P0/P1 summary in <10 words]
```

Example:
```
- 2026-03-31 | /crisp-audit | C:7 R:8 I:5 S:9 P:6 | Grade: B | Top issue: [I] Numbers without context on dashboard
```

If `.crisp.md` has prior History entries, call out any dimension regressions: "Your I score has dropped from 7 to 5 since the last audit - the Intelligent dimension has regressed."
