# CRISP — Design Intelligence for AI Agents

Five skills that give your AI agent a senior product designer's eye. Drop them into Claude, Cursor, Copilot, or Gemini and get structured design reviews, feature specs, and developer handoffs grounded in the CRISP framework.

**CRISP** = Contextual · Responsive · Intelligent · Seamless · Powerful

---

## Skills

| Command | What it does |
|---------|-------------|
| `/crisp-teach` | Onboards the AI to your product — users, design system, benchmarks. Writes `.crisp.md` which all other commands read automatically. Run once per project. |
| `/crisp-review` | 30-second scan. Returns a grade A–F and your top 3 issues with specific fixes. Use during rapid iteration. |
| `/crisp-audit` | Full CRISP evaluation. Scores all five dimensions, rates violations P0–P3, and benchmarks against Stripe, Linear, Notion, Asana, and Slack. |
| `/feature-design` | Designs a new feature from scratch using CRISP principles — user flows, component decisions, compliance checks, and open questions. |
| `/handoff` | Converts a reviewed design into a developer-ready spec — states, tokens, interactions, edge cases, accessibility, and exact copy. |

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

```
/crisp-teach   →  writes .crisp.md
/crisp-review  →  reads .crisp.md, returns grade + top 3 issues
/crisp-audit   →  reads .crisp.md, full scored evaluation
/feature-design → reads .crisp.md, produces user flow + spec
/handoff       →  reads .crisp.md, produces dev-ready spec
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
