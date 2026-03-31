# CRISP Benchmarks
*Current as of @laith-wallace/crisp v1.1.0 — updated with each release*

This catalog lists the products used as positive references in CRISP evaluations. Skills use project-specific benchmarks from `.crisp.md` first; these are the defaults when no project context exists.

When a benchmark product's design quality changes significantly, or a better exemplar emerges, this file is updated in a patch release — without changing the skill evaluation criteria.

---

## Benchmark Catalog

### Contextual (C) — Exemplars of orientation and clarity

| Product | Pattern | Why it's referenced |
|---------|---------|-------------------|
| **Stripe** | Error handling and feedback copy | Every error tells you what went wrong and exactly what to do next. No generic "Something went wrong." |
| **Linear** | Empty states | Empty states in Linear explain what's missing, why it matters, and have one clear recovery action. |
| **Notion** | Navigation and wayfinding | Breadcrumbs, page history, and link previews mean users rarely feel lost, even in deeply nested wikis. |
| **Vercel** | Dashboard first-run experience | New projects show you what to do next with zero ambiguity — deploy path is obvious from the first screen. |

### Responsive (R) — Exemplars of instant feedback

| Product | Pattern | Why it's referenced |
|---------|---------|-------------------|
| **Linear** | Optimistic UI everywhere | Filter changes, status updates, and edits all reflect immediately. Nothing waits for a server round-trip before updating visually. |
| **Spotify** | Playback controls | Every control responds within one frame. Queue updates, volume, scrubbing — instant. |
| **Figma** | Canvas interaction | Panning, zooming, and selection feel physically accurate. Zero perceived latency at the interaction layer. |
| **Cash App** | Payment confirmation | Transaction state is communicated immediately. Sending money feels as responsive as sending a text. |

### Intelligent (I) — Exemplars of insight over data

| Product | Pattern | Why it's referenced |
|---------|---------|-------------------|
| **Stripe** | Revenue dashboards | MRR, churn rate, and cohort views are shown with comparisons, trends, and context — not raw numbers. |
| **Duolingo** | Streak and progress framing | Progress is framed as momentum, not statistics. The product understands what motivates the user and surfaces it. |
| **Notion AI** | In-context suggestions | Suggestions appear where the user is working, based on the document content — not in a separate interface. |
| **Perplexity** | Search answers with sources | Answers include citations, follow-up questions, and source quality signals — not just a text block. |

### Seamless (S) — Exemplars of workflow fit

| Product | Pattern | Why it's referenced |
|---------|---------|-------------------|
| **Slack** | Notification and thread management | Slack works around your day — threads, huddles, and status mean you can stay in flow without interruptions breaking context. |
| **GitHub** | Code review workflow | PR reviews happen where developers already are — no context switching to a separate tool for comments, approvals, or CI. |
| **Retool** | Internal tool composition | Operations teams can build what they need without leaving their data sources. Tools come to the workflow, not the reverse. |
| **Airbnb** | Booking flow | The booking experience doesn't require creating an account at the last step. Trust-building and task completion happen together. |

### Powerful (P) — Exemplars of managed complexity

| Product | Pattern | Why it's referenced |
|---------|---------|-------------------|
| **Linear** | Keyboard-first navigation | Every action has a keyboard shortcut. The command palette is the fastest path to any function. Power users never need the mouse. |
| **Figma** | Layer hierarchy and components | Complex designs stay manageable through components, variants, and auto-layout. Complexity is organized, not hidden. |
| **Metabase** | Question builder | Complex SQL queries are buildable through a visual interface. Novices can answer questions; experts can write SQL when they need to. |
| **Arc Browser** | Space and tab management | Dozens of tabs remain manageable through spaces and pinning. Users who want simplicity get it; users who want control get that too. |

---

## AI-Native Benchmarks (CRISP + AI Extension)

| Product | Pattern | Why it's referenced |
|---------|---------|-------------------|
| **Claude.ai** | Uncertainty communication | Responds with epistemic humility — acknowledges uncertainty, knowledge limits, and offers alternatives when it can't help directly. |
| **Cursor** | Inline AI assist | Diff view for AI-generated code changes. User sees exactly what changed before accepting. Override is one keystroke. |
| **Perplexity** | Context transparency | Shows sources inline. User understands the basis for every claim. Citation quality varies, but transparency is structural. |
| **Vercel v0** | Progressive power disclosure | Single generation input. Advanced options (model, framework) are secondary — not surfaced until needed. |
| **Notion AI** | Failure grace | When AI doesn't know something, it says so plainly and suggests what the user can try instead. |

---

## Anti-References

Products not to emulate — referenced in audits when a design pattern resembles these failure modes.

| Product / Pattern | Failure | CRISP dimension |
|------------------|---------|----------------|
| Generic dashboard spinners | Every filter change shows a full-screen spinner. Nothing is predictable or instant. | R |
| Portal redirect patterns | "Open in [portal] to complete this action." Forces context switch for routine tasks. | S |
| Generic error messages | "An error occurred. Please try again." No specificity, no recovery path. | C |
| Checkbox forests | 40 settings visible to all users, all with equal visual weight. | P |
| Clippy-era AI suggestions | Interrupts user flow with unrequested AI guidance that's often wrong and hard to dismiss. | S + I |

---

## Suggesting a Benchmark Update

If a product's design quality has changed significantly, or you've found a better exemplar, open a GitHub Issue with the label `benchmark-suggestion`:
- Product name
- Which CRISP dimension it exemplifies
- The specific pattern and why it's exemplary
- A link or description of the pattern

Benchmark updates ship as patch releases.
