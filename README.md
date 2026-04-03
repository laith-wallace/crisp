# CRISP — Design Intelligence for AI Agents

Five skills that give your AI agent a senior product designer's eye. Drop them into Claude, Cursor, Copilot, or Gemini and get structured design reviews, feature specs, and developer handoffs grounded in the CRISP framework.

**CRISP** = Contextual · Responsive · Intelligent · Seamless · Powerful

---

## Skills

### Core

| Command | What it does |
|---------|-------------|
| `/crisp-teach` | Onboards the AI to your product — users, design system, benchmarks. Writes `.crisp.md` which all other commands read automatically. Run once per project. |
| `/crisp-review` | 30-second scan. Returns a grade A–F and your top 3 issues with specific fixes. Use during rapid iteration. |
| `/crisp-audit` | Full CRISP evaluation. Scores all five dimensions, rates violations P0–P3, and benchmarks against Stripe, Linear, Notion, Asana, and Slack. |
| `/feature-design` | Designs a new feature from scratch using CRISP principles — user flows, component decisions, compliance checks, and open questions. |
| `/handoff` | Converts a reviewed design into a developer-ready spec — states, tokens, interactions, edge cases, accessibility, and exact copy. |

### Extensions

| Command | What it does |
|---------|-------------|
| `/crisp-brief` | Turns a vague feature request into a structured `.brief.md` — problem statement, success criteria, scope, and CRISP dimension priority. |
| `/crisp-research` | Synthesises competitor and reference patterns. Surfaces anti-patterns and flags gaps in your brief before design begins. |
| `/crisp-copy` | Audits and generates all UI microcopy — labels, empty states, errors, tooltips, CTAs, and success messages. |
| `/crisp-a11y` | Full WCAG 2.2 AA accessibility audit with exact code-level fixes, P0–P3 severity, and a committable `a11y-checklist.md`. |
| `/crisp-ai` | Evaluates AI-native UI surfaces — chat interfaces, streaming responses, generative UI, inline assist — across 6 AI-specific dimensions. |

---

## Install

### Claude Code
```bash
npx skills add laith-wallace/crisp
```

### Cursor
Copy the contents of `.cursor/rules/` into your project's `.cursor/rules/` folder.

### Other agents
- **GitHub Copilot / Antigravity** — copy from `.agents/skills/`
- **Gemini** — copy from `.gemini/skills/`
- **Manual** — copy any `.md` file from `files/` and add it to your agent's context

---

## How it works

Run `/crisp-teach` first. The AI interviews you about your product, users, and design system, then writes a `.crisp.md` file to your project root. Every subsequent CRISP command reads that file automatically — so reviews and specs are grounded in your specific context, not generic advice.

**Reviewing existing UI:**
```
/crisp-teach   →  writes .crisp.md (run once)
/crisp-review  →  quick scan, grade A–F + top 3 issues
/crisp-audit   →  full scored evaluation across all 5 dimensions
/crisp-copy    →  microcopy audit and generation (optional pass)
/crisp-a11y    →  accessibility audit (optional pass)
/handoff       →  developer-ready spec from the reviewed design
```

**Designing a new feature:**
```
/crisp-teach      →  writes .crisp.md (run once)
/crisp-brief      →  structures your idea into a .brief.md
/crisp-research   →  competitor patterns, anti-patterns, brief gaps
/feature-design   →  user flows + component decisions, reads .crisp.md + .brief.md
/handoff          →  developer-ready spec
```

---

## The CRISP Framework

| Dimension | The test |
|-----------|----------|
| **C**ontextual | Can the user tell where they are and what this page does within 5 seconds? |
| **R**esponsive | Does the UI update immediately on every interaction? |
| **I**ntelligent | Are we showing insight, not raw data? |
| **S**eamless | Are we fitting into their day — not forcing them into ours? |
| **P**owerful | Is complexity hidden appropriately for each user type? |

---

## License

MIT
