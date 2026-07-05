# Changelog

All changes to `@laith-wallace/crisp` are documented here.

Versioning:
- **MAJOR** — Framework change: new/removed CRISP dimensions, breaking change to `.crisp.md` format
- **MINOR** — New skill added, new agent platform supported, new CRISP extension
- **PATCH** — Benchmark updates, copy fixes, content clarity improvements

Severity language matches the CRISP framework: P0 (breaking) / P1 (significant) / P2 (improvement) / P3 (polish).

---

## [1.4.0] — 2026-07-03

### New Skills in the Pack
- **P1** `/crisp-redesign` and `/crisp-ux-laws` join the repo as canonical sources (previously installed-only). `/crisp-redesign` now defines its VARIANCE / MOTION / DENSITY dials inline.

### Fixed Broken Cross-References
- **P0** `/crisp-design-eng` no longer requires a phantom `CRISP-STYLE-KIT.md` - the motion tokens in the skill are now canonical defaults, with a project-root `CRISP-STYLE-KIT.md` as an optional override. The project-specific `--duration-thread` token is generalised to `--duration-structural`.
- **P0** The **Mechanical Pre-Flight Checks** referenced by `/crisp-redesign` now actually exist in `/crisp-design-eng` - ten countable checks (em-dash count, eyebrow count, zigzag cap, CTA contrast and wrap, palette and radius locks, transition lock, entry scale, press feedback). `/crisp-funnel` also calls them as a quality gate.
- **P0** The **Copy Self-Audit** referenced by `/crisp-redesign` now exists in `/crisp-copy` - seven binary checks run over every touched string.

### Reproducible Scoring
- **P1** `/crisp-audit` scores are now mechanical: 10 - 3/P0 - 2/P1 - 1/P2, floor 1, with a shared /50-to-grade mapping. `/crisp-review` grades follow matching binary rules (A = zero P0/P1 ... F = two or more P0s). Any P0 caps the grade at C. History entries from both commands are now comparable across runs.
- **P1** AI Slop Check is binary in both skills: one or more tells = Fail.

### Evidence-Gathering Protocol
- **P1** `/crisp-audit`, `/crisp-review`, `/crisp-a11y`, and `/crisp-design-eng` now require evidence before judgement when a codebase is available: read the components, enumerate actual states, verify mechanically, cite file:line for every violation.

### Infer-First, Ask-Second
- **P1** `/crisp-copy` (mode + register), `/crisp-ai` (surface type), `/crisp-a11y` (setup), and `/crisp-teach` (new Step 0: scan the codebase and pre-fill a draft .crisp.md for confirmation) now infer from context and only ask what they cannot infer.

### File-Based Pipeline
- **P1** `/crisp-research` writes `.research.md`; `/feature-design` reads `.brief.md` and `.research.md` automatically and skips questions they already answer. The teach → brief → research → feature-design → design-eng → handoff chain no longer relies on manual paste.

### WCAG 2.2 Completion
- **P1** `/crisp-a11y` adds the missing new-in-2.2 criteria (2.4.11 Focus Not Obscured, 2.5.7 Dragging Movements, 3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication), scopes its coverage claim honestly, and reconciles the 24px WCAG floor with the 44px touch recommendation used in `/handoff`.

### Structure & Consistency
- **P2** `/crisp-design-eng` is now a directory skill: lean SKILL.md core plus `references/motion-recipes.md` (clip-path, springs, gestures) and `references/performance.md` (performance rules, debugging).
- **P2** `/crisp-research`: source-fallback rules for auth-walled/thin sources, `[verified via search]` vs `[from knowledge]` labels, redundant bottom risk guide merged into Step 2.
- **P2** `/crisp-funnel`: funnel-native benchmark exemplars (Hims/Ro, Typeform, Calendly, Lemonade) for direct-response offers alongside the SaaS defaults.
- **P2** Frontmatter standardised: `user-invocable` and `version` on every skill. Natural-language trigger phrases added to weak descriptions (design-eng, review, audit, handoff, copy, a11y).
- **P2** Voice: British English across the pack (`/crisp-ux-laws` spellings corrected); em dashes replaced with spaced hyphens in all skill sources; History dates must come from the `date` command, never from memory.

### Infrastructure
- **P1** `scripts/install.mjs` now derives the skill list from canonical `skills/` sources (flat + directory skills) instead of `files/`, which only contained one skill and silently skipped the rest.
- **P2** New `tests/` directory: three seeded fixtures (janky component CSS, weak copy strings, bad dashboard description) with expected-findings files, so skill revisions can be regression-checked.

---

## [1.3.0] — 2026-07-02

### Improvements to Existing Skills
- **P1** `/crisp-funnel` v2.0.0 - Merged the Funnel Architect methodology into the funnel skill. One skill now builds and critiques. New in this release:
  - **Critique mode** - choke-point analysis from stage-by-stage numbers, kit-section leak mapping, P0-P3 severity findings, 80/20 above-the-fold rule, benchmark-and-show guidance.
  - **Strategy layer in build mode** - research-first inputs (insight surveys, sales-call mining, journal mining), five explicit strategy decisions (awareness stage, offer type, format, named mechanism, transformation line), ad angles, and tracking instrumentation (CAC and ROI, not CPL).
  - **Two formats** - step funnel from the ten-section kit, or long-form landing page via the eight-block hierarchy.
  - **Progressive disclosure structure** - lean SKILL.md core plus `references/` for build mode, critique mode, and landing-page/copy/ads/forms patterns.
  - Supersedes the separate `funnel-architect` skill draft, which is fully absorbed.

### Infrastructure
- **P2** `scripts/sync.mjs` now supports directory-based skills (`skills/[name]/SKILL.md` plus `references/` and assets). The full tree syncs to Claude Code and Antigravity; Cursor and Gemini receive SKILL.md and references flattened into a single file. Flat `skills/[name].md` skills keep working unchanged.
- **P2** `skills/crisp-funnel.md` and `skills/crisp-funnel-kit.html` moved into the directory skill `skills/crisp-funnel/`.

---

## [1.2.0] — 2026-06-23

### New Skills
- **P1** `/crisp-funnel` - Funnel assembly from a brief. Classifies the funnel type (appointment, application, webinar, direct sale, email list), sequences sections from the CRISP Funnel Kit (10 tested sections) to the audience's awareness level, writes the copy, and runs `/crisp-review` before delivery, so no funnel ships unaudited. Ships with the `crisp-funnel-kit.html` section library.

### Infrastructure
- **P2** Migrated the canonical skill source directory from `files/` to `skills/`. Updated `scripts/sync.mjs` and the `package.json` `files` array accordingly.
- **P2** `scripts/sync.mjs` now carries a skill's companion `.html` asset (e.g. `crisp-funnel-kit.html`) into each platform directory alongside the skill, so library-backed skills stay self-contained.

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
