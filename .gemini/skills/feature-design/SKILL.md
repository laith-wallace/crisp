---
name: feature-design
description: "Design a new product feature using CRISP principles - takes a problem statement and produces user flows, component decisions, compliance checks, and decision rationale. Reads .brief.md and .research.md when present. Use when designing a new feature from a problem statement: 'design this feature', 'give me the user flow', 'spec the screens for X'. Developer specs belong to /handoff."
metadata:
  version: "1.2.0"
---

# /feature-design - CRISP Feature Design

Design a new feature from scratch, grounded in CRISP principles. This is not wireframe generation - it's structured design thinking that produces flows, decisions, rationale, and open questions.

If `.crisp.md` exists, load it before beginning. The design should be grounded in the specific users, design system, and benchmarks documented there.

Also read `.brief.md` and `.research.md` if they exist. The brief supplies the problem, user, scope, and CRISP priority; the research supplies patterns, benchmarks, and open questions. Do not re-ask anything those files already answer.

## Step 0: Visual Direction (when applicable)

Before writing flows or specs, establish visual direction. This step prevents technically correct specs from being discarded because the aesthetic was wrong.

**Trigger this step when:**
- The feature is greenfield (no existing visual reference in the product)
- The `.brief.md` CRISP priority is **C (Contextual)** or **I (Intelligent)** - these dimensions are most visually dependent
- The user explicitly requests a direction exploration

**How to run it:**
1. Read `.crisp.md` for register (Brand/Product), Creative North Star, and named rules
2. Describe 2–3 distinct layout/density approaches in plain language - vary hierarchy, density, and type voice, not just colour. Each should be distinct enough that "a bit of both" is not a reasonable answer.

Example directions for a data table feature:
- **Dense + functional**: Full-width table, data-forward, toolbar at top, minimal chrome
- **Card-forward**: Grouped records as expandable cards, progressive disclosure per row
- **Split-view**: List column left, detail panel right, no full-page navigation

3. Ask the user to confirm which direction (or what combination) to carry forward.
4. Write the rest of the spec to preserve the confirmed direction's major ingredients: layout structure, density, navigation model.

**If the user skips this step:** proceed, but note in Open Questions which visual direction assumptions you made and why.

---

## Step 1: Problem Framing

Before designing anything, clarify the problem. Skip any question `.brief.md` already answers. If the user hasn't provided these, ask:

1. **Who is experiencing this problem?** (Role, sophistication level, context)
2. **What are they trying to do?** (The job, not the feature)
3. **What do they do today?** (Workaround, existing tool, manual process)
4. **What does success look like?** (Observable outcome, not feature completion)
5. **What constraints exist?** (Technical, timeline, design system)

If `.crisp.md` exists, cross-reference with the documented user persona and known issues before proceeding.

## Step 2: CRISP Design Principles to Apply

Design the feature so that each dimension is explicitly addressed:

**Contextual** - The user should always know:
- Where they are in the flow
- What they've just done
- What happens next

**Responsive** - Every action should feel immediate:
- Optimistic UI for predictable state changes
- Skeleton loading, not blank spaces
- No spinner-only replacements for actions the user initiated: a spinner may sit beside the label (see `/handoff`'s form submission rule), never replace it

**Intelligent** - The feature should leverage what we know:
- Pre-populate from history or context
- Surface the next-best-action at every step
- Show data as insight, not raw numbers

**Seamless** - The feature should fit into their existing workflow:
- Don't redirect users out of their context unnecessarily
- Use familiar patterns before inventing new ones
- Keep the feature's footprint as small as possible

**Powerful** - Complexity should be progressive:
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
- **Benchmark reference** (where this pattern works well - Stripe, Linear, etc.)
- **CRISP alignment** (which dimension it serves)

## Step 5: Open Questions

List the research questions this design surfaces - things that should be validated before building or in a usability test:

- User behaviour questions (do users actually do X?)
- Technical feasibility questions
- Edge cases that need product decisions

## Output Format

Write the spec to `.feature-design.md` in the project root, then give a short summary in chat. A file is what `/handoff` and the Cold-Read Stress Test below can read. If one already exists, ask "Replace the existing spec for [its feature name], or keep both?" and on "keep both" (or no reply) write `.feature-design-<slug>.md` instead.

```
## Feature Design: [Feature Name]
Date: [Today's date - from the `date` command, never from memory]
Status: Draft
Brief: [.brief.md title, or "None"]

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

---

## Cold-Read Stress Test

The spec is read next by people who were not in this session: an engineer, `/handoff`, a reviewer. You cannot judge it yourself, because you remember every reason behind every step. Hand the written spec to a reader with no memory of the session.

**How:** spawn one isolated sub-agent (Claude Code: the Agent tool; other harnesses: their sub-agent tool). Give it only the paths to `.feature-design.md`, plus `.brief.md` and `.crisp.md` if they exist, and the prompt below. Pass nothing from the session: no summary, no hints, no "what I meant". Run it inline only when no sub-agent tool exists, and then tell the user it was a self-check, not a cold read.

Skip this step only if the user asks to skip it.

Prompt to pass verbatim:

```
You are a senior product designer and a front-end engineer who have just joined this project. You know nothing beyond the files below.
Read .feature-design.md, and .brief.md and .crisp.md if they exist. Do not edit any file.

Report findings in six lenses. For each finding give severity (P0 blocks building, P1 would likely get built wrong, P2 worth tightening), the spec section or flow step, and the question you would need answered.

1. Build start: could you build this flow from the spec alone? What would you have to ask first?
2. Brief trace: does every success criterion in .brief.md map to a flow step that delivers it? Does anything in the spec fall outside the brief's scope or break an anti-goal? If there is no brief, say so and judge against the spec's own Problem section.
3. Missing states: which steps lack empty, error, or loading behaviour? Which states does design hit but the spec never mentions (no permission, first run, long content, slow or partial data, undo)?
4. Weak decisions: which decisions name no alternative, rest on "best practice" alone, or cite a benchmark that does not fit this user?
5. Contrarian: what is the simplest flow that would still meet the success criteria? Which steps or components could go?
6. Contradictions: where do the flow, the component table, and the CRISP compliance summary disagree?

No praise. No rewrites. Findings only, most severe first. If a lens has nothing, say "none" for it.
```

**Folding findings back in:**
- A gap you can close from facts already in the environment or the brief: fix the spec directly.
- A gap that needs a decision: put it to the user, one question at a time, P0 first. Update the spec with the answer.
- A finding the user chooses not to resolve: add it to Open Questions, tagged `(cold read)`.
- Then set `Status: Stress-tested` (or `Draft - self-checked` if the check ran inline).

Report to the user in chat: how many findings by severity, which you fixed, and which became Open Questions. Do not paste the raw sub-agent output. Then suggest `/handoff`, which reads `.feature-design.md`.
