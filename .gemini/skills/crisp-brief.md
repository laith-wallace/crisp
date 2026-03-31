---
name: crisp-brief
description: Turn a vague design request into a structured, unambiguous design brief. Writes .brief.md with problem statement, target user, observable success criteria, scope boundaries, constraints, and CRISP dimension priority. Reads .crisp.md for project context.
user-invocable: true
---

# /crisp-brief — Design Brief Generator

Vague requests are a permanent design failure mode. "Can we improve the dashboard?" is not a brief — it's a starting point. This command converts any request into a scoped, unambiguous `.brief.md` that eliminates ambiguity before a pixel is moved.

Load `.crisp.md` if it exists before beginning. Project context (users, design system, constraints) informs the output.

## Intake Protocol

**If `.crisp.md` exists** (product context is known):
Ask only:
1. "Describe the request in one sentence — what did someone ask you to design or improve?"
2. "What observable outcome would tell you this worked?"

**If `.crisp.md` does not exist** (no project context):
Ask all five questions:
1. "Describe the request in one sentence — what did someone ask you to design or improve?"
2. "Who specifically will use this? (role, how often, technical level)"
3. "What observable outcome would tell you this worked?"
4. "What is explicitly NOT in scope?"
5. "What constraints exist? (time, design system, team dependencies)"

---

## Problem Sharpening

Before writing the brief, flag any of these patterns and prompt for clarification:

| Pattern | Flag | Prompt |
|---------|------|--------|
| Request describes a solution, not a problem | "This describes a solution — what's the underlying problem?" | "What makes users need this in the first place?" |
| Success criteria are feature-based, not outcome-based | "This describes a feature, not an outcome" | "What would a user be able to do or feel if this worked?" |
| Scope is open-ended | "This has no boundaries" | "What is explicitly NOT included in this work?" |
| User is not specified | "Who specifically uses this?" | "Describe the person who will interact with this design" |

Do not write the brief until flagged items are resolved or the user explicitly accepts the ambiguity.

---

## CRISP Dimension Mapping

Before writing the brief, identify which CRISP dimension is most implicated by the problem:

- **C (Contextual)** — users are confused about where they are, what happened, or what to do next
- **R (Responsive)** — interactions feel slow, unresponsive, or have no feedback
- **I (Intelligent)** — data is shown without context, insight, or next-best-action
- **S (Seamless)** — users are interrupted, redirected, or forced out of their workflow
- **P (Powerful)** — complexity is poorly managed, or expert users can't work efficiently

Use the product type from `.crisp.md` to weight dimension priority (e.g. B2B SaaS should weight S + P; Consumer App weights C + R).

---

## Output Format

Write `.brief.md` to the project root:

```markdown
# Brief: [Descriptive name — not "Dashboard improvement", but "Revenue trend visibility for account managers"]
Date: [Today's date]
Status: Draft
Requested by: [If known]

---

## Problem
[The user problem in one sentence — not the feature request, the underlying need]

Example of bad: "We need a dashboard redesign"
Example of good: "Account managers can't identify at-risk accounts without switching between three tools"

## User
Who: [Role + context — e.g. "Account manager, checks pipeline daily, moderate technical sophistication"]
Current behaviour: [What they do today to solve this problem]
Frequency: [How often they encounter this]

## Success Criteria
Observable outcomes that define success — not features delivered:

- [ ] [User can do X without Y friction]
- [ ] [User no longer needs to Z]
- [ ] [Metric X improves / drops to zero]

Avoid: "Build a dashboard" — that's a deliverable, not a success criterion.
Use: "Account manager identifies at-risk accounts in under 30 seconds from the pipeline view."

## Scope
**In scope:**
- [What this brief covers — be specific]

**Out of scope:**
- [Explicit exclusions — prevents scope creep during design and review]

## Constraints
- Design system: [From .crisp.md, or "None documented"]
- Timeline: [If provided]
- Dependencies: [What this work depends on or blocks]
- Known off-limits: [From .crisp.md Known Issues, or stated by user]

## CRISP Priority
Primary dimension: **[C / R / I / S / P]** — [One sentence on why this dimension matters most for this problem]
Secondary dimension: [Second most relevant, if applicable]

## Open Questions
Decisions needed before designing:
- [ ] [Product decision — e.g. "Should this show team data or individual data?"]
- [ ] [Technical question — e.g. "Is real-time data available for this view?"]
- [ ] [User research needed — e.g. "Do account managers prefer tabular or visual data?"]
```

---

## After Writing

Confirm to the user that `.brief.md` has been written. Suggest running `/feature-design` next, using the brief as input — it will read `.brief.md` and `.crisp.md` together to design the solution.
