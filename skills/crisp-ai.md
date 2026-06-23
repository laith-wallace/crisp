---
name: crisp-ai
description: Evaluate and design AI-native UI surfaces — chat interfaces, streaming responses, generative UI, AI agents, inline AI assist — across 6 AI-specific dimensions mapped to the CRISP framework. Use when building or reviewing any feature where AI is a primary interaction. Reads .crisp.md for context.
user-invocable: true
---

# /crisp-ai — AI UI Design Patterns

`CRISP + AI` extension. AI surfaces have design problems that didn't exist before 2023: how do you show uncertainty without percentages nobody can calibrate? How do you make streaming text readable? How do you design for an agent that might be wrong? This command evaluates those problems systematically.

Load `.crisp.md` if it exists. If the product type is AI-Native, this command runs automatically as part of `/crisp-audit`.

## AI Surface Type Detection

Ask the user: **"What type of AI surface are you designing or reviewing?"**

| Type | Definition | Examples |
|------|-----------|---------|
| **Chat interface** | User sends messages, AI responds with text | Claude.ai, ChatGPT, Perplexity |
| **Inline AI assist** | AI augments within an existing editor or tool | Notion AI, GitHub Copilot, Cursor |
| **AI agent** | AI takes actions, user monitors progress | Vercel Agent, Devin, AutoGPT interfaces |
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
- Confidence is communicated in percentages — users don't calibrate these well
- The UI never acknowledges that the AI might be wrong
- Knowledge cutoff or context limits aren't surfaced

Good patterns:
- Subtle visual de-emphasis for AI-generated content (slightly lighter weight, AI badge)
- Source citations inline ("Based on your Q3 report...")
- "Verify this" micro-CTA next to high-stakes claims
- "AI is confident about X but uncertain about Y" — qualitative, not percentage
- Knowledge cutoff surfaced when relevant ("This reflects data as of [date]")

---

### Dimension 2: Streaming Legibility
**CRISP link:** Responsive (R) + Contextual (C)
**Test:** Is partial output readable and non-disorienting as it arrives?

Fail indicators:
- Text streams token-by-token, creating an erratic reading rhythm
- Layout shifts as content streams in — elements jump around the page
- No indication that streaming is in progress — silence before text appears
- The "cursor" blinks but nothing else communicates progress
- Code blocks start rendering as plain text, then reformat suddenly

Good patterns:
- Paragraph-unit streaming where possible (complete sentences appear together)
- Reserved layout space for the response area — no layout shifts
- A persistent "Generating..." or pulsing indicator visible throughout
- Syntax highlighting applied incrementally, not in a sudden flash
- Markdown rendered progressively — headings appear as headings from the start

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
| Knowledge limit | "I don't have reliable information about [X] — I'd recommend [source]" | Link to authoritative source |
| Context overflow | "This conversation is getting long — I may lose context from earlier. Consider starting a new thread." | New thread CTA |
| Rate limit | "You've hit the usage limit — [upgrade / wait X mins]" | Clear action |
| Ambiguity | "I wasn't sure what you meant by X — here are two interpretations" | Let user select |
| Wrong output | "Did this miss the mark?" | Regenerate + feedback options |

---

### Dimension 4: Human Override Clarity
**CRISP link:** Powerful (P)
**Test:** Can the user take control, correct, or undo AI output easily?

The most important AI UI principle: the AI assists the human, not the reverse. Users must always feel in control — able to correct, regenerate, edit, or reject any AI output without effort.

Fail indicators:
- AI-generated content cannot be edited inline after generation
- No undo for AI actions taken on the user's behalf
- AI fills form fields with no way to see what was pre-filled vs. user-entered
- Regeneration is buried or requires explaining the problem to get a different answer
- There's no way to give feedback on a bad response
- Users can't see what changed when the AI modifies a document

Good patterns:
- Inline edit on all AI-generated content, immediately after generation
- "Diff view" — show exactly what the AI changed in an existing document
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
- Clear session / conversation boundaries — "Starting a new conversation clears context"
- Explicit context attachment: "Add file", "Include this page", "Mention @document"
- "Why did you say that?" — ability to see the reasoning or sources behind an output
- Context indicator that shows when approaching limits

---

### Dimension 6: Progressive AI Power Disclosure
**CRISP link:** Powerful (P)
**Test:** Are AI capabilities introduced progressively rather than overwhelming new users while still accessible to power users?

Fail indicators:
- Full AI command palette shown on first use — 30 options with no hierarchy
- AI options are mixed with non-AI options without visual distinction
- New users see the same interface as expert users
- AI features are hidden too deep — power users discover them by accident
- No onboarding path that teaches the AI's capabilities through use

Good patterns:
- Single primary AI action surfaced prominently — one "Ask AI" or inline trigger
- Secondary capabilities revealed progressively (type "/" to see commands)
- Visual hierarchy between core AI actions and advanced options
- Feature discovery hints after a user action: "Did you know you can ask AI to summarize this?"
- Keyboard shortcuts for power users without cluttering the interface for novices

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

**P0 — Fix before shipping**
- [Dimension] [Violation] → [Exact fix]

**P1 — Fix this sprint**
- [Dimension] [Violation] → [Exact fix]

**P2–P3 — Backlog**
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

Compared against: [Perplexity / Claude.ai / Cursor / Notion AI / Vercel v0 — or project benchmarks from .crisp.md]

[2–3 sentences: where this AI surface excels relative to the benchmark, and where it falls behind]

---

### Strategic Recommendations

- [How to move from current score to world-class — 2–3 points]
- [User research questions specific to AI trust and comprehension]
- [Metrics to track: task completion rate, regeneration rate, edit-after-generation rate]
```

---

## Analysis Notes

- AI UI design is still a new field. Be direct about what's genuinely unknown or unsettled.
- The goal is not to hide AI limitations — it's to design around them honestly.
- Reference the product type from `.crisp.md` — an AI agent for enterprise compliance needs different uncertainty communication than a consumer writing assistant.
- The dimension scores here are separate from the five core CRISP scores. A `/crisp-audit` gives the CRISP scorecard; this gives the AI UI scorecard. Both are needed for AI-native products.
