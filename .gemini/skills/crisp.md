---
name: crisp
description: Router for the CRISP skill pack - names every skill and when to reach for it.
user-invocable: true
disable-model-invocation: true
version: "1.1.0"
---

# /crisp - Skill Pack Router

One place to find the right CRISP skill. Read the user's situation, name the matching skill, and suggest it - this router never runs the work itself.

## The pipeline (in order)

| Stage | Skill | Reach for it when |
|---|---|---|
| Onboard | `/crisp-teach` | Once per project - interviews you and writes `.crisp.md`, the context every other skill reads |
| Scope | `/crisp-brief` | A request is vague - converts it into a `.brief.md` with success criteria and scope boundaries |
| Research | `/crisp-research` | Before designing - competitive patterns, anti-patterns, dimension risks, writes `.research.md` |
| Design | `/feature-design` | Designing a new feature from a problem statement - reads `.brief.md` and `.research.md` |
| Check | `/crisp-review` | 30-second scan mid-iteration - grade A-F plus top 3 issues |
| Check | `/crisp-audit` | Full scored evaluation across all five dimensions with a prioritised action plan |
| Ship | `/handoff` | Design has passed review - produces the developer-ready spec |

## Specialists (any stage)

| Skill | Reach for it when |
|---|---|
| `/crisp-design-eng` | An interaction feels janky or "off"; motion, micro-interaction, and polish decisions; Mechanical Pre-Flight Checks |
| `/crisp-copy` | Any UI wording - labels, errors, empty states, CTAs - audit or generate |
| `/crisp-a11y` | Deep WCAG 2.2 AA evaluation with code-level remediation |
| `/crisp-ai` | The feature's primary interaction is AI - chat, streaming, generative UI, agents |
| `/crisp-ux-laws` | Grounding a design argument in cognitive laws (Fitts, Hick, Miller, ...) |

## Whole-surface work

| Skill | Reach for it when |
|---|---|
| `/crisp-redesign` | Overhauling an existing UI or site without breaking what works |
| `/crisp-improve-ui` | Tightening an existing surface without redesigning it - evidence-locked, writes plans to `design-plans/` |
| `/crisp-funnel` | Landing pages, sales pages, funnels, conversion problems - ATM methodology |
| `/crisp-production-ready` | Pre-launch audit of the whole product - 24 lenses, HTML remediation playbook |

## Maintenance

| Skill | Reach for it when |
|---|---|
| `/crisp-doctor` | `.crisp.md` or `.crisp/config.json` might be stale, out of date, or missing fields - especially after upgrading the crisp package |

If no `.crisp.md` exists yet, suggest `/crisp-teach` first - every skill above reads it.
