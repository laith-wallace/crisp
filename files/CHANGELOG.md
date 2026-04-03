# Changelog

All changes to `@laith-wallace/crisp` are documented here.

Versioning:
- **MAJOR** — Framework change: new/removed CRISP dimensions, breaking change to `.crisp.md` format
- **MINOR** — New skill added, new agent platform supported, new CRISP extension
- **PATCH** — Benchmark updates, copy fixes, content clarity improvements

Severity language matches the CRISP framework: P0 (breaking) / P1 (significant) / P2 (improvement) / P3 (polish).

---

## [1.1.0] — 2026-03-31

### New Skills
- **P1** `/crisp-brief` — Design brief generator. Converts vague requests into structured `.brief.md` with problem statement, observable success criteria, scope, and CRISP dimension priority. Reads `.crisp.md` for project context.
- **P1** `/crisp-copy` — UX microcopy specialist. Two modes: audit existing copy or generate new copy. Produces an audit table and a committable copy system reference. Grounded in cognitive load research.
- **P1** `/crisp-a11y` — Full WCAG 2.2 AA accessibility audit. Covers all four WCAG principles with exact code-level fixes and P0–P3 severity. Outputs `a11y-checklist.md` for committing to the project.
- **P1** `/crisp-ai` — AI UI design patterns. Evaluates AI-native surfaces (chat, agents, generative UI, inline assist) across 6 dimensions mapped to the CRISP framework.

### Improvements to Existing Skills
- **P1** `/crisp-teach` — Added product type selection (B2B SaaS / Consumer / E-commerce / Internal Tool / AI-Native). Product type pre-configures CRISP dimension priority and default benchmarks. Updated `.crisp.md` output format to include `Type`, `Extensions`, and `## History` section.
- **P2** `/crisp-audit` — Now appends a dated score summary to `.crisp.md` History section after each run. Calls out dimension regressions when prior history exists.
- **P2** `/crisp-review` — Now appends a dated grade summary to `.crisp.md` History section after each run.

### Infrastructure
- **P2** Added `BENCHMARKS.md` — curated catalog of benchmark products with specific patterns and rationale. Updated with patch releases independently of skill content.
- **P2** Added `CONTRIBUTING.md` — three-tier contribution model for benchmarks, skills, and framework changes.
- **P2** Added `scripts/sync.mjs` — platform sync script. Run via `npm run sync` or automatically before `npm publish` via `prepublishOnly` hook. Eliminates drift between `files/` and platform directories.
- **P3** Added `--version` flag to CLI (`npx @laith-wallace/crisp --version`).

### CRISP Extensions model
- Introduced the concept of CRISP Extensions: named evaluation lenses that apply on top of the five core dimensions for specific contexts (`CRISP + AI`, `CRISP + a11y`, `CRISP + Motion`, `CRISP + Mobile`). The five core dimensions are unchanged.

---

## [1.0.1] — 2026-03-31

- **P3** Fixed: Restructured skills to use `SKILL.md` subdirectory format for Claude Code compatibility.

## [1.0.0] — 2026-03-31

Initial release with five skills: `/crisp-teach`, `/crisp-review`, `/crisp-audit`, `/feature-design`, `/handoff`.
