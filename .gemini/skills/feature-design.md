---
name: feature-design
description: Design a new product feature using CRISP principles. Takes a problem statement and produces user flows, component decisions, CRISP compliance checks, and decision rationale benchmarked against world-class products. If .crisp.md exists, load it first.
user-invocable: true
---

# /feature-design — CRISP Feature Design

Design a new feature from scratch, grounded in CRISP principles. This is not wireframe generation — it's structured design thinking that produces flows, decisions, rationale, and open questions.

If `.crisp.md` exists, load it before beginning. The design should be grounded in the specific users, design system, and benchmarks documented there.

## Step 1: Problem Framing

Before designing anything, clarify the problem. If the user hasn't provided these, ask:

1. **Who is experiencing this problem?** (Role, sophistication level, context)
2. **What are they trying to do?** (The job, not the feature)
3. **What do they do today?** (Workaround, existing tool, manual process)
4. **What does success look like?** (Observable outcome, not feature completion)
5. **What constraints exist?** (Technical, timeline, design system)

If `.crisp.md` exists, cross-reference with the documented user persona and known issues before proceeding.

## Step 2: CRISP Design Principles to Apply

Design the feature so that each dimension is explicitly addressed:

**Contextual** — The user should always know:
- Where they are in the flow
- What they've just done
- What happens next

**Responsive** — Every action should feel immediate:
- Optimistic UI for predictable state changes
- Skeleton loading, not blank spaces
- No spinners for actions the user initiated

**Intelligent** — The feature should leverage what we know:
- Pre-populate from history or context
- Surface the next-best-action at every step
- Show data as insight, not raw numbers

**Seamless** — The feature should fit into their existing workflow:
- Don't redirect users out of their context unnecessarily
- Use familiar patterns before inventing new ones
- Keep the feature's footprint as small as possible

**Powerful** — Complexity should be progressive:
- Surface the most-used 20% by default
- Hide the other 80% behind deliberate disclosure
- Add keyboard shortcuts for power users

## Step 3: Flow Design

Map the user flow as a numbered sequence of steps. For each step, document:

```
Step [N]: [What the user does / sees]
- State: [What the UI shows]
- CRISP check: [Which dimension(s) this step addresses or risks]
- Decision: [Why this approach over alternatives]
- Edge cases: [Empty state / error state / loading state]
```

## Step 4: Component Decisions

For each key UI element in the flow, document:
- **What it is** (component name/type)
- **Why this pattern** (over alternatives)
- **Benchmark reference** (where this pattern works well — Stripe, Linear, etc.)
- **CRISP alignment** (which dimension it serves)

## Step 5: Open Questions

List the research questions this design surfaces — things that should be validated before building or in a usability test:

- User behaviour questions (do users actually do X?)
- Technical feasibility questions
- Edge cases that need product decisions

## Output Format

```
## Feature Design: [Feature Name]

### Problem
Who: [User]
Job: [What they're trying to do]
Today: [Current workaround]
Success: [Observable outcome]

### User Flow

**Step 1: [Name]**
State: [UI description]
CRISP: [Dimension + how it's addressed]
Decision: [Why this approach]
Edge cases: [Empty / error / loading]

[Repeat for each step]

### Key Component Decisions

| Component | Pattern | Benchmark | CRISP Dimension |
|-----------|---------|-----------|-----------------|
| [Name]    | [Type]  | [Reference] | [C/R/I/S/P]   |

### CRISP Compliance Summary

| Dimension   | How addressed | Risk |
|-------------|--------------|------|
| Contextual  | [How]        | [Any gaps] |
| Responsive  | [How]        | [Any gaps] |
| Intelligent | [How]        | [Any gaps] |
| Seamless    | [How]        | [Any gaps] |
| Powerful    | [How]        | [Any gaps] |

### Open Questions
- [Research / product / technical questions to resolve]

### Next Steps
- [Recommended actions before building]
```

## Design Style

- Design for the primary user first. Edge cases come second.
- Favour familiar patterns over novel ones unless novelty is the point.
- Every design decision should be justifiable against CRISP.
- If a step in the flow fails a CRISP dimension, flag it and propose a fix before moving on.
