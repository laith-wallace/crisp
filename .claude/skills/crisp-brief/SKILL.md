---
name: crisp-brief
description: "Turn a vague design request into a structured, unambiguous design brief - writes .brief.md with problem statement, target user, observable success criteria, scope, constraints, and CRISP priority. Use when a request is vague or before designing anything new: 'write a brief', 'scope this feature', 'what exactly are we building'."
metadata:
  version: "1.4.2"
---

# /crisp-brief - Design Brief Generator

Vague requests are a permanent design failure mode. "Can we improve the dashboard?" is not a brief - it's a starting point. This command converts any request into a scoped, unambiguous `.brief.md` that eliminates ambiguity before a pixel is moved.

Load `.crisp.md` if it exists before beginning. Project context (users, design system, constraints) informs the output.

## Stance

A brief that agrees with everything protects nothing. While interviewing and sharpening:
- Lead with what is missing, vague, or risky in the request before naming what is solid.
- No praise for the request or the answers. "Great idea" tells the user nothing; a named gap does.
- Do not restate the user's framing as fact. If they say "users hate the dashboard", ask what shows that.
- For every proposed solution, name the strongest case against building it at all.

## Intake Protocol

Interview rules, in force for every question below:
1. Ask one question at a time. Wait for the answer before asking the next.
2. If a *fact* can be found in the environment (framework, existing components, analytics events, current copy), look it up instead of asking. The *decisions* - success criteria, scope, priorities - are the user's: put each one to them and wait.
3. Skip any question the request already answers.
4. Do not write the brief until the Readiness Gate below is passed.
5. Headless exception: if no reply is possible (a scheduled, CI, or other unattended run), do not wait. Answer each question from the request and the environment, list every answer you inferred as an assumption under Open Questions, and go straight to writing with `Status: Draft - confirmation pending`.

**Before the first question, look for earlier work.** Search the repo for existing plans, briefs, or specs for this feature: `.brief*.md`, `.feature-design*.md`, and folders such as `specs/`, `plans/`, `docs/`, and `design-plans/`. If you find one, read it and open with what is wrong with it - the missing user, the unmeasurable criterion, the scope gap - and ask whether to build on it or start fresh. Teams often re-brief a feature someone already scoped, and the old plan's gaps are the fastest route to the right questions.

**If `.crisp.md` exists** (product context is known):
Ask only:
1. "Describe the request in one sentence - what did someone ask you to design or improve?"
2. "How do people handle this today, and where does that break down?"
3. "What observable outcome would tell you this worked?"

**If `.crisp.md` does not exist** (no project context):
Ask all six questions:
1. "Describe the request in one sentence - what did someone ask you to design or improve?"
2. "Who specifically will use this? (role, how often, technical level)"
3. "How do people handle this today, and where does that break down?"
4. "What observable outcome would tell you this worked?"
5. "What is explicitly NOT in scope?"
6. "What constraints exist? (time, design system, team dependencies)"

The "today" question matters most. A request with no current workaround is often a solution looking for a problem; a request with a painful workaround tells you exactly what to beat.

---

## Problem Sharpening

Before writing the brief, flag any of these patterns and prompt for clarification:

| Pattern | Flag | Prompt |
|---------|------|--------|
| Request describes a solution, not a problem | "This describes a solution - what's the underlying problem?" | "What makes users need this in the first place?" |
| Success criteria are feature-based, not outcome-based | "This describes a feature, not an outcome" | "What would a user be able to do or feel if this worked?" |
| Scope is open-ended | "This has no boundaries" | "What is explicitly NOT included in this work?" |
| User is not specified | "Who specifically uses this?" | "Describe the person who will interact with this design" |
| An existing component, pattern, or product already covers most of it | "This may not need new design" | "What does [existing thing] fail to do for this user?" |
| A success criterion only the requester could judge ("feels cleaner", "more intuitive") | "Nobody else can check this" | "What would a stranger watch the user do to know it worked?" |

Do not write the brief until flagged items are resolved or the user explicitly accepts the ambiguity.

---

## Readiness Gate

Before writing, restate the brief as a working hypothesis in 2-3 sentences: who, what breaks for them today, and what will be observably different. Then ask one question: "Write the brief from this, or adjust it first?"

Write only on a yes. On an adjustment, fold it in and restate. If no reply is possible (a headless or scheduled run), write the brief anyway with `Status: Draft - confirmation pending` (see interview rule 5), and put the hypothesis and the gate question first under Open Questions. This is the moment a misunderstanding costs one sentence instead of a whole design.

---

## CRISP Dimension Mapping

Read the request, determine the most likely primary CRISP dimension, then **assert it and ask for confirmation** rather than presenting a menu. This is faster and treats the user as a collaborator.

Dimension signals:
- **C (Contextual)** - users are confused about where they are, what happened, or what to do next
- **R (Responsive)** - interactions feel slow, unresponsive, or have no feedback
- **I (Intelligent)** - data is shown without context, insight, or next-best-action
- **S (Seamless)** - users are interrupted, redirected, or forced out of their workflow
- **P (Powerful)** - complexity is poorly managed, or expert users can't work efficiently

Assert-then-confirm format:
```
Primary dimension: S (Seamless) - this is a workflow interruption problem. Confirm, or tell me which dimension is more relevant.
```

Not a menu:
```
Which dimension applies? C / R / I / S / P
```

Use the register and product type from `.crisp.md` to weight dimension priority (Brand register weights C + I; Product register B2B weights S + P; Consumer weights C + R).

---

## Output Format

Write `.brief.md` to the project root. If one already exists, ask "Replace the existing brief for [its title], or keep both?" and on "keep both" (or no reply) write `.brief-<slug>.md` instead, because silently overwriting a brief loses decisions someone already made. Every later step - the cold read, the report, the `/feature-design` suggestion - uses the file you actually wrote, called the brief file below.

Two rules for filling the template, kept outside it so they are never copied into the file:
- **Problem** is the underlying need, not the request. Bad: "We need a dashboard redesign". Good: "Account managers can't identify at-risk accounts without switching between three tools".
- **Success criteria** are outcomes, not deliverables. Bad: "Build a dashboard". Good: "Account manager identifies at-risk accounts in under 30 seconds from the pipeline view."

```markdown
# Brief: [Descriptive name - not "Dashboard improvement", but "Revenue trend visibility for account managers"]
Date: [Today's date - from the `date` command, never from memory]
Status: Draft
Check: [Cold read, Self-check, or Skipped at user request]
Requested by: [If known]

---

## Problem
[The user problem in one sentence - not the feature request, the underlying need]

## User
Who: [Role + context - e.g. "Account manager, checks pipeline daily, moderate technical sophistication"]
Current behaviour: [What they do today to solve this problem]
Where that breaks: [The specific point the current approach fails - the thing the design must beat]
Frequency: [How often they encounter this]

## Success Criteria
Observable outcomes that define success - not features delivered:

- [ ] [User can do X without Y friction]
- [ ] [User no longer needs to Z]
- [ ] [Metric X improves / drops to zero]

## Scope
**In scope:**
- [What this brief covers - be specific]

**Out of scope:**
- [Explicit exclusions - prevents scope creep during design and review]

## Constraints
- Design system: [From .crisp.md, or "None documented"]
- Timeline: [If provided]
- Dependencies: [What this work depends on or blocks]
- Known off-limits: [From .crisp.md Known Issues, or stated by user]
- Reuse checked: [Existing component, pattern, or product considered, and what it lacks - or "None found"]

## Anti-Goals
What this design should NOT be or do - explicit exclusions prevent the wrong reference product being used:
- Not: [e.g. "Not a settings page - stays in the user's current context"]
- Not: [e.g. "Not a modal - must be inline"]
- Not: [e.g. "Not optimised for first-time users - this is for power users only"]

## CRISP Priority
Primary dimension: **[C / R / I / S / P]** - [One sentence on why this dimension matters most for this problem]
Secondary dimension: [Second most relevant, if applicable]

## Open Questions
Decisions needed before designing:
- [ ] [Product decision - e.g. "Should this show team data or individual data?"]
- [ ] [Technical question - e.g. "Is real-time data available for this view?"]
- [ ] [User research needed - e.g. "Do account managers prefer tabular or visual data?"]
- [ ] [Unresolved cold-read finding - e.g. "(cold read) No behaviour defined when an account has no revenue history"]
```

---

## Cold-Read Stress Test

The brief exists to be read by someone who was not in the conversation - `/feature-design`, another agent, a teammate. You cannot judge that yourself: you remember every answer, so every gap looks filled. Hand the written brief to a reader with no memory of the interview.

**How:** spawn one isolated sub-agent (Claude Code: the Agent tool; other harnesses: their sub-agent tool). Give it only the path to the brief file, `.crisp.md` (if present), and the prompt below with `[BRIEF FILE]` replaced by that path. It may search and read the codebase, read-only, so the contrarian lens can check for components that already do the job. Pass nothing from the interview - no summary, no hints, no "the user meant". Run it inline only when no sub-agent tool exists, and then tell the user it was a self-check, not a cold read.

Skip this step only if the user asks to skip it.

Prompt to pass verbatim:

```
You are a product designer who has just joined this project. You know nothing beyond the files below.
Read [BRIEF FILE] (and .crisp.md if it exists). You may search and read the codebase to check the brief's claims and look for existing components or patterns. Do not edit any file.

Report findings in five lenses. For each finding give severity (P0 blocks design from starting, P1 would likely send design the wrong way, P2 worth tightening), the brief section, and the question you would need answered.

1. Cold start: could you start designing tomorrow from this alone? What would you have to ask first?
2. Testability: for each success criterion, could someone who was not in the room mark it pass or fail? Which ones cannot be checked?
3. Contrarian: what is the strongest case against building this? Does an existing component, pattern, or product already solve most of it? Name the file if you found one in the codebase.
4. Missing states and edges: which users, states (empty, error, first-run, no permission, slow data), or scope boundaries does the brief not mention but design will hit?
5. Contradictions: where do two sections disagree, or does scope conflict with constraints or anti-goals?

No praise. No rewrites. Findings only, most severe first. If a lens has nothing, say "none" for it.
```

**Folding findings back in:**
- A gap you can close from facts already in the environment: fix the brief directly.
- A gap that needs a decision: put it to the user, one question at a time, P0 first. Update the brief with the answer.
- A finding the user chooses not to resolve: add it to Open Questions, tagged `(cold read)`.
- Then fill the `Check:` line with what actually ran: `Cold read`, `Self-check`, or `Skipped at user request`. Set `Status: Stress-tested` only after a cold read. A `Draft - confirmation pending` status stays as it is until the user confirms the brief; the check never clears it.

Report to the user in chat: how many findings by severity, which you fixed, and which became Open Questions. Do not paste the raw sub-agent output.

---

## After Writing

Tell the user which file was written and what check it got: cold read, self-check, or skipped at their request. Never call a brief stress-tested when the cold read did not run. Suggest running `/feature-design` next with that brief file as input - it reads the brief and `.crisp.md` together to design the solution.
