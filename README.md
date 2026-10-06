# CRISP - Design Intelligence for AI Agents

Twenty-eight skills plus a `/crisp` router that give your AI agent a senior product designer's eye. Drop them
into Claude Code, Codex, Cursor, Copilot, or Gemini CLI and get structured design reviews,
feature specs, developer handoffs, accessibility audits, AI surface evaluations,
funnel assembly, craft-level motion polish, before/after proof, and human-sounding prose,
all grounded in the CRISP framework. A zero-dependency design detector checks every UI edit
as the agent works and reports only the problems that edit added.

**CRISP** = Contextual · Responsive · Intelligent · Seamless · Powerful

---

## Skills

### Core

| Command           | What it does                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/crisp-teach`    | Onboards the AI to your product - users, design system, benchmarks. Writes `.crisp.md` which all other commands read automatically. Run once per project. |
| `/crisp-review`   | 30-second scan. Returns a grade A–F and your top 3 issues with specific fixes. Use during rapid iteration.                                                |
| `/crisp-audit`    | Full CRISP evaluation. Scores all five dimensions, rates violations P0–P3, and benchmarks against Stripe, Linear, Notion, Asana, and Slack.               |
| `/feature-design` | Designs a new feature from scratch using CRISP principles - user flows, component decisions, compliance checks, and open questions.                       |
| `/handoff`        | Converts a reviewed design into a developer-ready spec - states, tokens, interactions, edge cases, accessibility, and exact copy.                         |

### Extensions

| Command             | What it does                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/crisp-brief`      | Turns a vague feature request into a structured `.brief.md` - problem statement, success criteria, scope, and CRISP dimension priority.                                                                 |
| `/crisp-research`   | Synthesises competitor and reference patterns. Surfaces anti-patterns and flags gaps in your brief before design begins.                                                                                |
| `/crisp-copy`       | Audits and generates all UI microcopy - labels, empty states, errors, tooltips, CTAs, and success messages.                                                                                             |
| `/crisp-a11y`       | Full WCAG 2.2 AA accessibility audit with exact code-level fixes, P0–P3 severity, and a committable `a11y-checklist.md`.                                                                                |
| `/crisp-ai`         | Evaluates AI-native UI surfaces - chat interfaces, streaming responses, generative UI, inline assist - across 6 AI-specific dimensions.                                                                 |
| `/crisp-design-eng` | Design engineering craft layer - motion decisions, micro-interaction quality, component polish, and the invisible details that make an interface feel right. Maps every craft fix to a CRISP dimension. |
| `/crisp-redesign`   | Overhauls an existing UI or site without breaking what works - audit baseline, Mechanical Pre-Flight Checks, and a re-review that must beat the baseline grade. |
| `/crisp-ux-laws`    | Grounds a design argument in cognitive laws (Fitts, Hick, Miller, Jakob, and more) with the specific violation and fix. |
| `/crisp-unslop`     | The Slop Check for words. Edits prose (landing copy, blog posts, docs, release notes, PR bodies) with the minimum effective edit and a Voice Card that must survive, or detects slop patterns by id with quoted lines - never scores, never claims AI authorship. UI strings stay with `/crisp-copy`. |
| `/crisp-study`      | Study a reference. Extracts the design DNA of a URL, screenshot, or codebase into a `DESIGN.md` (Google's open token format) with provenance for every token. Study, not clone. |
| `/crisp-tune`       | Tone dials for a UI that is right but feels wrong: `bolder`, `quieter`, `simpler`, plus VARIANCE, MOTION, and DENSITY dials (1-10). Every move is on-token and checked by the detector. |
| `/crisp-stress`     | Worst-case data stress test: empty, one item, 1000 items, 200-char names, RTL, emoji, 200% zoom, 320px, slow network, +40% translations. Pass/fail table with P0-P3 fixes. |
| `/crisp-variants`   | 3 to 5 genuinely different variants of one component, live in your app behind a dev-only switcher. Pick one and the others are deleted, with zero dead code left. |
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
| `/crisp-agents-md`  | Generates or refreshes a repo's `AGENTS.md` from evidence: discovers installed skills and real repo facts (scripts, stack, CI, env var names), maps them onto the CRISP workflow chain (`/crisp-isolate` -> `/crisp-brief` -> `/crisp-structure` -> `/crisp-evidence` -> `/crisp-proof` + `/crisp-loop` -> `/crisp-unslop`), and keeps managed sections it can regenerate later without touching hand-written rules. Wires `CLAUDE.md` to include it. |

### Maintenance

| Command         | What it does                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `/crisp`        | Router. Names every skill, its pipeline stage, and when to reach for it.                                          |
| `/crisp-doctor` | Reports and repairs drift between `.crisp.md` / `.crisp/config.json` and what the installed pack version expects. |

---

## Install

### Claude Code (plugin, includes the detector hooks)

```bash
/plugin marketplace add laith-wallace/crisp
/plugin install crisp@crisp-skills
```

### Any agent (skills.sh)

```bash
npx skills add laith-wallace/crisp
```

### npm installer (Claude Code, Codex, Copilot, Cursor, Gemini CLI)

```bash
npx @laith-wallace/crisp
```

Pick the skills and the agents. Each skill is copied as a folder (`SKILL.md` plus its references and scripts) to:

| Agent | Folder |
| --- | --- |
| Claude Code | `~/.claude/skills/` |
| Codex, Copilot, Antigravity | `~/.agents/skills/` |
| Cursor | `~/.cursor/skills/` |
| Gemini CLI | `~/.gemini/skills/` |

For Claude Code, the installer also offers the detector hooks for the current project.

### Manual

Copy any folder from `skills/` into your agent's skills folder. Every skill follows the [Agent Skills](https://agentskills.io/specification) layout.

---

## Design detector

`crisp detect` is a deterministic checker: plain text rules, no LLM, no browser, no dependencies. It covers AI slop tells (purple-blue gradients, glow halos, hero pill badges, icon tile stacks, template copy), accessibility (missing alt text, icon buttons with no label, zoom disabled, positive tabindex), and craft (transition: all, missing reduced-motion, heading skips, low-contrast colour pairs). With a `DESIGN.md` in the repo it also flags colours that are not in your tokens.

```bash
npx @laith-wallace/crisp detect src/          # exit 0 clean, 2 findings, 1 error
npx @laith-wallace/crisp detect --json src/   # for CI
```

**Hooks.** After each Edit or Write, the PostToolUse hook scans the file and reports only the findings that edit added, so old problems never repeat. Before the agent stops, the Stop hook checks every changed UI file once against `git HEAD` and blocks on new P0/P1 findings. Plugin installs get both hooks automatically.

**Silencing a finding on purpose.** Add `crisp-disable-line <rule-id>: reason` (or `crisp-disable-next-line`, or `crisp-disable` for the file) in any comment, or use `crisp ignores add-value <rule-id> "<value>" --reason "..."` for a repo-wide exception.

## DESIGN.md

CRISP reads and writes [DESIGN.md](https://github.com/google-labs-code/design.md), Google's open format for design tokens plus rationale. `.crisp.md` holds product context (users, register, decisions); `DESIGN.md` holds the tokens. `/crisp-study` writes one from a reference, `/crisp-tune` stays inside it, and the detector flags off-token colours.

```bash
npx @laith-wallace/crisp design-md lint            # broken references, invalid values, contrast
npx @laith-wallace/crisp design-md diff old.md DESIGN.md
npx @laith-wallace/crisp design-md diff --git HEAD # what changed since the last commit
```

## CLI

| Command | What it does |
| --- | --- |
| `crisp` | Interactive installer (skills plus optional hooks) |
| `crisp detect [--json] <path...>` | Run the design detector |
| `crisp hook [--stop]` | Hook entry point (reads the hook payload on stdin) |
| `crisp ignores list\|add-file\|add-value` | Manage detector ignores in `.crisp/config.json` |
| `crisp design-md lint\|diff` | Lint or diff a `DESIGN.md` |
| `crisp critique slug\|write\|trend` | Per-surface review history in `.crisp/critique/` |
| `crisp doctor [--fix]` | Check `.crisp.md` and `.crisp/config.json` for drift |

## Tests and evals

```bash
npm test                 # detector, hook, and DESIGN.md unit tests, plus skill lint and drift check
claude plugin eval       # skill triggering and graded output vs a no-plugin baseline (see evals/README.md)
```

---

## How it works

Run `/crisp-teach` first. The AI interviews you about your product, users, and
design system, then writes a `.crisp.md` file to your project root. Every
subsequent CRISP command reads that file automatically - so reviews and specs
are grounded in your specific context, not generic advice.

**Reviewing existing UI:**

```
/crisp-teach       ->  writes .crisp.md (run once)
/crisp-review      ->  quick scan, grade A–F + top 3 issues
/crisp-audit       ->  full scored evaluation across all 5 dimensions
/crisp-stress      ->  worst-case data stress test (optional pass)
/crisp-tune        ->  bolder, quieter, or simpler (optional pass)
/crisp-design-eng  ->  motion, micro-interaction + craft polish (optional pass)
/crisp-copy        ->  microcopy audit and generation (optional pass)
/crisp-a11y        ->  accessibility audit (optional pass)
/handoff           ->  developer-ready spec from the reviewed design
/crisp-loop        ->  review-fix-review until the target grade (optional, bounded)
/crisp-proof       ->  before/after screenshot proof for the PR
/crisp-unslop      ->  PR title and body, release notes, any prose a person reads
```

**Agent workflow (Isolate -> Build -> Prove -> Ship):**

```
/crisp-isolate     ->  own worktree + branch from origin/main, scope check, receipt
/crisp-structure   ->  actions decide, services do - where each piece of code goes
/crisp-evidence    ->  recorded, annotated proof the change works (before + after)
/crisp-proof       ->  before/after screenshot table with a grade delta
/crisp-loop        ->  review-fix-review until the target grade
/crisp-unslop      ->  the PR title and body
/crisp-agents-md   ->  writes this workflow into the repo's AGENTS.md
```

**Designing a new feature:**

```
/crisp-teach       ->  writes .crisp.md (run once)
/crisp-brief       ->  structures your idea into a .brief.md
/crisp-research    ->  competitor patterns, anti-patterns, brief gaps
/crisp-study       ->  DESIGN.md from a reference URL, screenshot, or codebase (optional)
/feature-design    ->  user flows + component decisions, reads .crisp.md + .brief.md
/crisp-variants    ->  3-5 live variants behind a dev-only switcher (optional)
/crisp-design-eng  ->  motion, micro-interaction + craft polish (optional pass)
/crisp-ai          ->  AI surface evaluation if feature includes AI interactions (optional pass)
/handoff           ->  developer-ready spec
```

---

## The CRISP Framework

| Dimension       | The test                                                                   |
| --------------- | -------------------------------------------------------------------------- |
| **C**ontextual  | Can the user tell where they are and what this page does within 5 seconds? |
| **R**esponsive  | Does the UI update immediately on every interaction?                       |
| **I**ntelligent | Are we showing insight, not raw data?                                      |
| **S**eamless    | Are we fitting into their day - not forcing them into ours?                |
| **P**owerful    | Is complexity hidden appropriately for each user type?                     |

---

## License

MIT
