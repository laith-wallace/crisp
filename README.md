# CRISP — Design Intelligence for AI Agents

Twenty-four skills plus a `/crisp` router that give your AI agent a senior product designer's eye. Drop them
into Claude, Cursor, Copilot, or Gemini and get structured design reviews,
feature specs, developer handoffs, accessibility audits, AI surface evaluations,
funnel assembly, craft-level motion polish, before/after proof, and human-sounding prose,
all grounded in the CRISP framework.

**CRISP** = Contextual · Responsive · Intelligent · Seamless · Powerful

---

## Skills

### Core

| Command           | What it does                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/crisp-teach`    | Onboards the AI to your product — users, design system, benchmarks. Writes `.crisp.md` which all other commands read automatically. Run once per project. |
| `/crisp-review`   | 30-second scan. Returns a grade A–F and your top 3 issues with specific fixes. Use during rapid iteration.                                                |
| `/crisp-audit`    | Full CRISP evaluation. Scores all five dimensions, rates violations P0–P3, and benchmarks against Stripe, Linear, Notion, Asana, and Slack.               |
| `/feature-design` | Designs a new feature from scratch using CRISP principles — user flows, component decisions, compliance checks, and open questions.                       |
| `/handoff`        | Converts a reviewed design into a developer-ready spec — states, tokens, interactions, edge cases, accessibility, and exact copy.                         |

### Extensions

| Command             | What it does                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/crisp-brief`      | Turns a vague feature request into a structured `.brief.md` — problem statement, success criteria, scope, and CRISP dimension priority.                                                                 |
| `/crisp-research`   | Synthesises competitor and reference patterns. Surfaces anti-patterns and flags gaps in your brief before design begins.                                                                                |
| `/crisp-copy`       | Audits and generates all UI microcopy — labels, empty states, errors, tooltips, CTAs, and success messages.                                                                                             |
| `/crisp-a11y`       | Full WCAG 2.2 AA accessibility audit with exact code-level fixes, P0–P3 severity, and a committable `a11y-checklist.md`.                                                                                |
| `/crisp-ai`         | Evaluates AI-native UI surfaces — chat interfaces, streaming responses, generative UI, inline assist — across 6 AI-specific dimensions.                                                                 |
| `/crisp-design-eng` | Design engineering craft layer — motion decisions, micro-interaction quality, component polish, and the invisible details that make an interface feel right. Maps every craft fix to a CRISP dimension. |
| `/crisp-redesign`   | Overhauls an existing UI or site without breaking what works - audit baseline, Mechanical Pre-Flight Checks, and a re-review that must beat the baseline grade. |
| `/crisp-ux-laws`    | Grounds a design argument in cognitive laws (Fitts, Hick, Miller, Jakob, and more) with the specific violation and fix. |
| `/crisp-unslop`     | The Slop Check for words. Edits prose (landing copy, blog posts, docs, release notes, PR bodies) with the minimum effective edit and a Voice Card that must survive, or detects slop patterns by id with quoted lines - never scores, never claims AI authorship. UI strings stay with `/crisp-copy`. |
| `/crisp-improve-ui` | Evidence-locked improvement audit. Read-only on product source: traces the rendered path, keeps only findings that pass a three-proof gate (contract, runtime, correction), tags each with a CRISP dimension and P0–P3 severity, then writes self-contained execution plans to `design-plans/`. Improves a surface without replacing its identity. |

### Funnel Kit

| Command          | What it does                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/crisp-funnel`  | Assembles a mobile-first funnel from a brief: classifies the funnel type, sequences sections from the CRISP Funnel Kit (10 tested sections) to the audience's awareness level, writes the copy, and runs `/crisp-review` before delivery. Ships with the `crisp-funnel-kit.html` section library. |

### Ship gate

| Command                   | What it does                                                                                                                                                                                                                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/crisp-production-ready` | Complete production-readiness audit: repeated passes through 24 lenses (security, auth, claims-vs-code, data shapes, perf, a11y, config, concurrency and more) until two consecutive passes find nothing new. Outputs a flat findings list plus `production-playbook.html` - a visual, checkable, step-by-step fix plan with a binary READY / FIX FIRST / NOT READY verdict. |
| `/crisp-loop`             | Bounded review-fix-review loop. Detector + `/crisp-review`, fix only the cited P0/P1s, re-review, stop on TARGET MET (default B, zero P0), CAP REACHED (default 5), STALLED, or SCOPE BLOCKED. Reports the grade trend per iteration. Never lowers the target or widens scope. |
| `/crisp-proof`            | Visual proof a change did what it claims: before/after screenshot pairs across states and breakpoints, `/crisp-review` grades on both sides, detector on After, and a binary IMPROVED / NO CHANGE / REGRESSED verdict in a PR-ready markdown table. Never switches branches to fake a Before. |

### Repo setup

| Command             | What it does                                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/crisp-isolate`          | Starts every task in its own Git worktree and branch cut from `origin/main` after a scope check against open PRs and other agents' work. Prints an Isolation receipt before any code. Never builds on main, never `--force`. |
| `/crisp-structure`        | Two-layer code structure: actions own the why and when, services own the how with explicit inputs and structured returns. Audit (file:line findings), Design (placement table), and Extract (one-caller-at-a-time migration) modes. |
| `/crisp-evidence`         | Runtime proof a change works: the agent drives the app live while a bundled recorder stamps `passed` / `failed` / `untested` assertions into the video and writes `report.md` for the PR. Headless path with numbered captures; non-UI changes ship measured numbers. |
| `/crisp-agents-md`  | Generates or refreshes a repo's `AGENTS.md` from evidence: discovers installed skills and real repo facts (scripts, stack, CI, env var names), maps them onto the CRISP workflow chain (`/crisp-isolate` → `/crisp-brief` → `/crisp-structure` → `/crisp-evidence` → `/crisp-proof` + `/crisp-loop` → `/crisp-unslop`), and keeps managed sections it can regenerate later without touching hand-written rules. Wires `CLAUDE.md` to include it. |

### Maintenance

| Command         | What it does                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/crisp`        | Router. Names every skill, its pipeline stage, and when to reach for it.                                          |
| `/crisp-doctor` | Reports and repairs drift between `.crisp.md` / `.crisp/config.json` and what the installed pack version expects. |

---

## Install

### Claude Code

```bash
npx skills add laith-wallace/crisp
```

### Cursor

Copy the contents of `.cursor/rules/` into your project's `.cursor/rules/`
folder.

### Other agents

- **GitHub Copilot / Antigravity** — copy from `.agents/skills/`
- **Gemini** — copy from `.gemini/skills/`
- **Manual** — copy any `.md` file from `files/` and add it to your agent's
  context

---

## How it works

Run `/crisp-teach` first. The AI interviews you about your product, users, and
design system, then writes a `.crisp.md` file to your project root. Every
subsequent CRISP command reads that file automatically — so reviews and specs
are grounded in your specific context, not generic advice.

**Reviewing existing UI:**

```
/crisp-teach       →  writes .crisp.md (run once)
/crisp-review      →  quick scan, grade A–F + top 3 issues
/crisp-audit       →  full scored evaluation across all 5 dimensions
/crisp-design-eng  →  motion, micro-interaction + craft polish (optional pass)
/crisp-copy        →  microcopy audit and generation (optional pass)
/crisp-a11y        →  accessibility audit (optional pass)
/handoff           →  developer-ready spec from the reviewed design
/crisp-loop        →  review-fix-review until the target grade (optional, bounded)
/crisp-proof       →  before/after screenshot proof for the PR
/crisp-unslop      →  PR title and body, release notes, any prose a person reads
```

**Agent workflow (Isolate → Build → Prove → Ship):**

```
/crisp-isolate     →  own worktree + branch from origin/main, scope check, receipt
/crisp-structure   →  actions decide, services do - where each piece of code goes
/crisp-evidence    →  recorded, annotated proof the change works (before + after)
/crisp-proof       →  before/after screenshot table with a grade delta
/crisp-loop        →  review-fix-review until the target grade
/crisp-unslop      →  the PR title and body
/crisp-agents-md   →  writes this workflow into the repo's AGENTS.md
```

**Designing a new feature:**

```
/crisp-teach       →  writes .crisp.md (run once)
/crisp-brief       →  structures your idea into a .brief.md
/crisp-research    →  competitor patterns, anti-patterns, brief gaps
/feature-design    →  user flows + component decisions, reads .crisp.md + .brief.md
/crisp-design-eng  →  motion, micro-interaction + craft polish (optional pass)
/crisp-ai          →  AI surface evaluation if feature includes AI interactions (optional pass)
/handoff           →  developer-ready spec
```

---

## The CRISP Framework

| Dimension       | The test                                                                   |
| --------------- | -------------------------------------------------------------------------- |
| **C**ontextual  | Can the user tell where they are and what this page does within 5 seconds? |
| **R**esponsive  | Does the UI update immediately on every interaction?                       |
| **I**ntelligent | Are we showing insight, not raw data?                                      |
| **S**eamless    | Are we fitting into their day — not forcing them into ours?                |
| **P**owerful    | Is complexity hidden appropriately for each user type?                     |

---

## License

MIT
