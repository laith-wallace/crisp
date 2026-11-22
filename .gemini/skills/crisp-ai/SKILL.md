---
name: crisp-ai
description: Evaluate and design AI-native UI surfaces - chat, streaming responses, generative UI, agents, inline assist - across 6 AI-specific dimensions mapped to CRISP. Use when building or reviewing any feature where AI is a primary interaction.
metadata:
  version: "1.2.0"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
---

# /crisp-ai - AI UI Design Patterns

`CRISP + AI` extension. AI surfaces have design problems that didn't exist before 2023: how do you show uncertainty without percentages nobody can calibrate? How do you make streaming text readable? How do you design for an agent that might be wrong? This command evaluates those problems systematically.

Load `.crisp.md` if it exists. If the product type is AI-Native, this command runs automatically as part of `/crisp-audit`.

## AI Surface Type Detection

Infer the surface type from the request, screenshot, or code before asking - a message list with an input box is a chat interface; an editor plugin is inline assist. If the type is evident, declare it and proceed. Ask **"What type of AI surface are you designing or reviewing?"** only when genuinely ambiguous.

| Type | Definition | Examples |
|------|-----------|---------|
| **Chat interface** | User sends messages, AI responds with text | Claude.ai, ChatGPT, Perplexity |
| **Inline AI assist** | AI augments within an existing editor or tool | Notion AI, GitHub Copilot, Cursor |
| **AI agent** | AI takes actions, user monitors progress | Claude Code, Devin, Vercel Agent |
| **Generative UI** | AI creates or modifies components or layouts | Vercel v0, Galileo AI, Uizard |
| **AI-powered search/retrieval** | AI surfaces answers from a corpus | Perplexity, Glean, Notion Q&A |
| **Hybrid** | AI is embedded in a product that isn't primarily AI | Feature in a SaaS product, AI-assisted form filling |

---

## The 6 AI UI Dimensions

Each dimension maps to one or more CRISP dimensions. Score each 1–10 and identify specific violations.

---

### Dimension 1: Uncertainty Communication
**CRISP link:** Intelligent (I) + Contextual (C)
**Test:** Does the user know when to trust the AI and when to verify?

The core problem: AI output is probabilistic, but most UIs present it with the same visual confidence as verified data. A user who can't distinguish high-confidence output from a hallucination will either over-trust (dangerous) or under-trust (useless).

Fail indicators:
- AI-generated content has the same visual weight as user-authored or verified data
- No mechanism to see the source or reasoning behind a claim
- Confidence is communicated in percentages - users don't calibrate these well
- The UI never acknowledges that the AI might be wrong
- Knowledge cutoff or context limits aren't surfaced

Good patterns:
- Subtle visual de-emphasis for AI-generated content (slightly lighter weight, AI badge)
- Source citations inline ("Based on your Q3 report...")
- "Verify this" micro-CTA next to high-stakes claims
- "AI is confident about X but uncertain about Y" - qualitative, not percentage
- Knowledge cutoff surfaced when relevant ("This reflects data as of [date]")

---

### Dimension 2: Streaming Legibility
**CRISP link:** Responsive (R) + Contextual (C)
**Test:** Is partial output readable and non-disorienting as it arrives?

Fail indicators:
- Text streams token-by-token, creating an erratic reading rhythm
- Layout shifts as content streams in - elements jump around the page
- No indication that streaming is in progress - silence before text appears
- The "cursor" blinks but nothing else communicates progress
- Code blocks start rendering as plain text, then reformat suddenly

Good patterns:
- Paragraph-unit streaming where possible (complete sentences appear together)
- Reserved layout space for the response area - no layout shifts
- A persistent "Generating..." or pulsing indicator visible throughout
- Syntax highlighting applied incrementally, not in a sudden flash
- Markdown rendered progressively - headings appear as headings from the start

---

### Dimension 3: Failure Grace
**CRISP link:** Contextual (C) + Seamless (S)
**Test:** When the AI fails, is recovery clear without making the user feel at fault?

AI fails in distinctive ways: it runs out of context, hits a content policy, doesn't know something, or produces confidently wrong output. Each failure type needs a different recovery path.

Fail indicators:
- Generic "Something went wrong" for all AI failure modes
- Refusal messages that explain limits but offer no path forward
- Rate limit errors that appear as generic errors
- Context window errors that aren't explained
- No regeneration option after a poor response
- The user has to start over from scratch when the AI fails mid-task

Failure type taxonomy and recovery patterns:
| Failure type | What to say | Recovery action |
|-------------|------------|----------------|
| Content policy | "I can't help with that specific request, but I can help with [adjacent thing]" | Suggest a reframe |
| Knowledge limit | "I don't have reliable information about [X] - I'd recommend [source]" | Link to authoritative source |
| Context overflow | "This conversation is getting long - I may lose context from earlier. Consider starting a new thread." | New thread CTA |
| Rate limit | "You've hit the usage limit - [upgrade / wait X mins]" | Clear action |
| Ambiguity | "I wasn't sure what you meant by X - here are two interpretations" | Let user select |
| Wrong output | "Did this miss the mark?" | Regenerate + feedback options |

---

### Dimension 4: Human Override Clarity
**CRISP link:** Powerful (P)
**Test:** Can the user take control, correct, or undo AI output easily?

The most important AI UI principle: the AI assists the human, not the reverse. Users must always feel in control - able to correct, regenerate, edit, or reject any AI output without effort.

Fail indicators:
- AI-generated content cannot be edited inline after generation
- No undo for AI actions taken on the user's behalf
- AI fills form fields with no way to see what was pre-filled vs. user-entered
- Regeneration is buried or requires explaining the problem to get a different answer
- There's no way to give feedback on a bad response
- Users can't see what changed when the AI modifies a document

Good patterns:
- Inline edit on all AI-generated content, immediately after generation
- "Diff view" - show exactly what the AI changed in an existing document
- Undo available for every AI action (including multi-step agent actions)
- One-click regenerate with optionally specific direction ("Make it shorter / more formal / different approach")
- Thumbs up / down feedback as a minimal feedback loop
- Clear visual distinction between user-authored and AI-generated content

---

### Dimension 5: Context Transparency
**CRISP link:** Contextual (C) + Intelligent (I)
**Test:** Does the user understand what context the AI is using to generate responses?

Users who don't know what context the AI has will either give redundant information or wonder why the AI seems to know things about them. Both are friction.

Fail indicators:
- AI uses project files, past conversations, or user data with no indication it's doing so
- User doesn't know if the AI "remembers" the previous session
- No way to add context to the AI (attach files, mention documents)
- No way to remove context or start fresh
- The AI refers to information the user didn't explicitly provide, with no explanation of where it came from

Good patterns:
- "Context pill" showing what's in scope: "Using: [project.md, this conversation]"
- Clear session / conversation boundaries - "Starting a new conversation clears context"
- Explicit context attachment: "Add file", "Include this page", "Mention @document"
- "Why did you say that?" - ability to see the reasoning or sources behind an output
- Context indicator that shows when approaching limits

---

### Dimension 6: Progressive AI Power Disclosure
**CRISP link:** Powerful (P)
**Test:** Are AI capabilities introduced progressively rather than overwhelming new users while still accessible to power users?

Fail indicators:
- Full AI command palette shown on first use - 30 options with no hierarchy
- AI options are mixed with non-AI options without visual distinction
- New users see the same interface as expert users
- AI features are hidden too deep - power users discover them by accident
- No onboarding path that teaches the AI's capabilities through use

Good patterns:
- Single primary AI action surfaced prominently - one "Ask AI" or inline trigger
- Secondary capabilities revealed progressively (type "/" to see commands)
- Visual hierarchy between core AI actions and advanced options
- Feature discovery hints after a user action: "Did you know you can ask AI to summarize this?"
- Keyboard shortcuts for power users without cluttering the interface for novices

---

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

---

## Output Format

```
## AI UI Evaluation: [Product / Feature Name]

**Surface type:** [Chat / Inline assist / Agent / Generative UI / Search / Hybrid]
**CRISP extension:** CRISP + AI

---

### AI Dimension Scores

| Dimension | Score | Top Violation |
|-----------|-------|--------------|
| 1. Uncertainty Communication | /10 | [Specific violation] |
| 2. Streaming Legibility | /10 | [Specific violation] |
| 3. Failure Grace | /10 | [Specific violation] |
| 4. Human Override Clarity | /10 | [Specific violation] |
| 5. Context Transparency | /10 | [Specific violation] |
| 6. Progressive Power Disclosure | /10 | [Specific violation] |
| **Total** | **/60** | |

---

### Violations by Priority

**P0 - Fix before shipping**
- [Dimension] [Violation] → [Exact fix]

**P1 - Fix this sprint**
- [Dimension] [Violation] → [Exact fix]

**P2–P3 - Backlog**
- [List]

---

### Component Recommendations

For each primary AI component in the surface:

**[Component name, e.g. "Chat message"]**
- Current pattern: [What it does now]
- Problem: [What fails at which dimension]
- Recommendation: [Specific design change with rationale]
- Benchmark: [How a comparable product solves this]

---

### Benchmark Comparison

Compared against: [Perplexity / Claude.ai / Cursor / Notion AI / Vercel v0 - or project benchmarks from .crisp.md]

[2–3 sentences: where this AI surface excels relative to the benchmark, and where it falls behind]

---

### Strategic Recommendations

- [How to move from current score to world-class - 2–3 points]
- [User research questions specific to AI trust and comprehension]
- [Metrics to track: task completion rate, regeneration rate, edit-after-generation rate]
```

---

## Analysis Notes

- AI UI design is still a new field. Be direct about what's genuinely unknown or unsettled.
- The goal is not to hide AI limitations - it's to design around them honestly.
- Reference the product type from `.crisp.md` - an AI agent for enterprise compliance needs different uncertainty communication than a consumer writing assistant.
- The dimension scores here are separate from the five core CRISP scores. A `/crisp-audit` gives the CRISP scorecard; this gives the AI UI scorecard. Both are needed for AI-native products.

## Taste rules

<!-- crisp:shared taste -->
**Taste rules.** Each rule is a count, so a check can say pass or fail. Rules 1 to 7 apply when this skill makes or judges a rendered UI (a screen, a page, a component). The copy tells apply to all copy, prose included. Where this skill states a stricter limit for the same pattern, the stricter limit wins.

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
- **This file is always writable.** Appending to `.crisp/lessons.md` is allowed even in a skill that is otherwise read-only or limited to the target's files. It is the only such exception.
- **When the user corrects or rejects your output:** append 1 line to `.crisp/lessons.md` (create it if needed) in this shape:
  `- YYYY-MM-DD | <skill or all> | <what was wrong> | <the rule that would have prevented it>`
  Write the rule as a count or a yes/no check, so a later run can test it. One correction, one line. Never log praise, and never log a line the user did not cause.
- **Promote:** when the same rule appears 3 times, tell the user it is ready to move into the pack's shared taste rules (`skills/_shared/taste.md` in the CRISP repo).
<!-- /crisp:shared lessons -->

## Next step

End the report with one line, `Next: <command> - <why>`, picked from these by what this run found. Where the report template above has a **Next:** line, this is that line, never a second one:

- After it is built: `/crisp-review`
