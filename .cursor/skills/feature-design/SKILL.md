---
name: feature-design
description: "Design a new product feature using CRISP principles - takes a problem statement and produces user flows, component decisions, compliance checks, and decision rationale. Reads .brief.md and .research.md when present. Use when designing a new feature from a problem statement: 'design this feature', 'give me the user flow', 'spec the screens for X'. Developer specs belong to /handoff."
metadata:
  version: "1.3.2"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
---

# /feature-design - CRISP Feature Design

Design a new feature from scratch, grounded in CRISP principles. This is not wireframe generation - it's structured design thinking that produces flows, decisions, rationale, and open questions.

If `.crisp.md` exists, load it before beginning. The design should be grounded in the specific users, design system, and benchmarks documented there.

Also read the brief and `.research.md` if they exist. The brief is the file the user names, else `.brief.md`; if several `.brief*.md` files exist and the user named none, ask which one this feature belongs to. The brief supplies the problem, user, scope, and CRISP priority; the research supplies patterns, benchmarks, and open questions. Do not re-ask anything those files already answer.

## Step 0: Visual Direction (when applicable)

Before writing flows or specs, establish visual direction. This step prevents technically correct specs from being discarded because the aesthetic was wrong.

**Trigger this step when:**
- The feature is greenfield (no existing visual reference in the product)
- The brief's CRISP priority is **C (Contextual)** or **I (Intelligent)** - these dimensions are most visually dependent
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

Before designing anything, clarify the problem. Skip any question the brief already answers. If the user hasn't provided these, ask:

1. **Who is experiencing this problem?** (Role, sophistication level, context)
2. **What are they trying to do?** (The job, not the feature)
3. **What do they do today?** (Workaround, existing tool, manual process)
4. **What does success look like?** (Observable outcome, not feature completion)
5. **What constraints exist?** (Technical, timeline, design system)

If `.crisp.md` exists, cross-reference with the documented user persona and known issues before proceeding.

Then search the codebase for two things before designing:
- **Reuse:** components, patterns, or screens that already do part of this job. Design on top of them, or say in a Decision line why not.
- **Rules:** business rules the feature must respect (validation, permissions, state transitions, what can be deleted versus hidden). These become the Invariants section. If a rule matters and you cannot find it in the code or the brief, ask.

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

## Step 5: Invariants and Critical Journeys

**Invariants** are rules that must hold no matter which path the user takes. Write each one so a test or a reviewer can check it. Good: "A product with at least one sale can be hidden, never deleted." Bad: "Data stays consistent." Aim for 3-7; if you have none, the feature has no business rules or you have not found them yet.

**Critical journeys** are the 2-5 end-to-end paths that must work for the feature to count as done: the main happy path, the most common failure, and any path that touches an invariant. Each gets a pass condition someone else could check, so `/crisp-evidence` or a test can prove it later.

## Step 6: Open Questions

List the research questions this design surfaces - things that should be validated before building or in a usability test:

- User behaviour questions (do users actually do X?)
- Technical feasibility questions
- Edge cases that need product decisions

## Output Format

Write the spec to `.feature-design.md` in the project root, then give a short summary in chat. A file is what `/handoff` and the Cold-Read Stress Test below can read. If one already exists, ask "Replace the existing spec for [its feature name], or keep both?" and on "keep both" (or no reply) write `.feature-design-<slug>.md` instead. Every later step uses the file you actually wrote, called the spec file below.

```
## Feature Design: [Feature Name]
Date: [Today's date - from the `date` command, never from memory]
Status: Draft
Check: [Cold read, Self-check, or Skipped at user request]
Brief: [Brief file path and title, or "None"]

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

### Invariants
- [ ] [Rule that must always hold - e.g. "A product with at least one sale can be hidden, never deleted"]

### Critical Journeys
| Journey | Steps | Pass condition |
|---------|-------|----------------|
| [Happy path name] | [Step numbers from the flow] | [Observable result a stranger could check] |
| [Main failure path] | [Steps] | [What the user sees and can do next] |

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

**How:** spawn one isolated sub-agent (Claude Code: the Agent tool; other harnesses: their sub-agent tool). Give it only the paths to the spec file, plus the brief, `.research.md`, and `.crisp.md` if they exist, and the prompt below with `[SPEC FILE]` and `[BRIEF FILE]` replaced by those paths. With no brief, delete the "If a brief was supplied" sentence from the prompt. It may search and read the codebase, read-only, so it can check reuse claims and whether the code already breaks an invariant. Pass nothing from the session: no summary, no hints, no "what I meant". Run it inline only when no sub-agent tool exists, and then tell the user it was a self-check, not a cold read.

Skip this step only if the user asks to skip it.

Prompt to pass verbatim:

```
You are a senior product designer and a front-end engineer who have just joined this project. You know nothing beyond the files below.
Read [SPEC FILE]. If a brief was supplied, also read [BRIEF FILE]. Read .research.md and .crisp.md if they exist. You may search and read the codebase to check the spec's claims. Do not edit any file.

Report findings in seven lenses. For each finding give severity (P0 blocks building, P1 would likely get built wrong, P2 worth tightening), the spec section or flow step, and the question you would need answered.

1. Build start: could you build this flow from the spec alone? What would you have to ask first?
2. Brief trace: does every success criterion in the brief map to a flow step that delivers it? Does anything in the spec fall outside the brief's scope or break an anti-goal? If there is no brief, say so and judge against the spec's own Problem section.
3. Missing states: which steps lack empty, error, or loading behaviour? Which states does design hit but the spec never mentions (no permission, first run, long content, slow or partial data, undo)?
4. Weak decisions: which decisions name no alternative, rest on "best practice" alone, or cite a benchmark that does not fit this user?
5. Contrarian: what is the simplest flow that would still meet the success criteria? Which steps or components could go? Does the codebase already have a component that does the job? Name the file.
6. Contradictions: where do the flow, the component table, and the CRISP compliance summary disagree?
7. Invariants and journeys: which invariant could a flow step break? Does the current code already break one? Which critical journey has a pass condition nobody else could check, and which important path has no journey at all?

No praise. No rewrites. Findings only, most severe first. If a lens has nothing, say "none" for it.
```

**Folding findings back in:**
- A gap you can close from facts already in the environment or the brief: fix the spec directly.
- A gap that needs a decision: put it to the user, one question at a time, P0 first. Update the spec with the answer.
- A finding the user chooses not to resolve: add it to Open Questions, tagged `(cold read)`.
- Then fill the `Check:` line with what actually ran: `Cold read`, `Self-check`, or `Skipped at user request`. Set `Status: Stress-tested` only after a cold read. A `Draft - confirmation pending` status stays as it is until the user confirms the spec; the check never clears it.

Report to the user in chat: which file was written, what check it got (cold read, self-check, or skipped at their request), how many findings by severity, which you fixed, and which became Open Questions. Do not paste the raw sub-agent output. Then end with the `Next:` line from the Next step list below.

## Finish check

<!-- crisp:shared finish-check -->
**Finish check.** Before you say a built or changed page is done, measure it as the browser draws it. Screenshots go to `.crisp/render/`: tool output, git-ignored, and never counted as an edit outside this skill's scope.

```bash
mkdir -p .crisp/render && printf '*\n' > .crisp/render/.gitignore && rm -f .crisp/render/*.png
npx @laith-wallace/crisp render-check "<local url>" --width 1280,375 --shots .crisp/render
```

- Exit 0: clean. Say so in the report.
- Exit 2: findings. `page-overflow-x`, `overlapping-text`, `text-cut` and `text-spills` are bugs, never style choices. Fix them and run it again, at most 3 rounds.
- Exit 3 (inconclusive), exit 1 (no URL, no Playwright, or the page did not load), or no local URL to give it: report `render-check: untested` with the reason. Never report the page as checked, and open no screenshots: this run took none.

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

End the report with one line, `Next: <command> - <why>`, picked from these by what this run found. It is the report's only next-step line: where the report template above has a **Next:** or `Ready for` line, write this line there instead. Where the report ends with Handover lines, put it directly above them.

- Spec written, feature not AI-led: `/handoff` with the spec file
- Spec written, feature AI-led: `/crisp-ai` before handoff
- After it is built: `/crisp-review`
