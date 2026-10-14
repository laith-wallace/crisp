# CRISP roadmap: lessons from Impeccable

Source: the Zapier interview with Impeccable's creator (transcript supplied 14 Oct 2026). The claims about Impeccable below come from that video, not from reading its code. Check its licence before reusing any of its code or content.

## The short version

Impeccable wins on two things CRISP lacks:

1. **Divergence before code.** It shows you several distinct visual directions (it calls them "worlds") in a picker, next to the bland "category default", and you click "Build this".
2. **Direct manipulation.** "Impeccable Live" puts a toolbar in your own dev server. You click an element, steer it ("bolder", "quieter", "animate"), edit copy inline, draw on it, and ask for variants. Those events go back to your local agent.

CRISP wins on evidence. It has severity scales, an evidence gate, before/after proof, runtime evidence, stress tests, an eval suite with a no-skill baseline, and coverage of product UI, not only landing pages.

The plan: borrow divergence and direct manipulation, and keep the evidence layer as the moat.

---

## Feature comparison

| Impeccable feature (from the video) | CRISP today | Gap |
|---|---|---|
| Critique: heuristic health score, AI-slop verdict, what works, priority issues | crisp-audit, crisp-review, shared slop tells, P0-P3 | Small. Audit does not end by routing to the next command |
| Interviews you first (audience, purpose) | crisp-teach, crisp-brief | crisp-teach cannot be auto-invoked (`disable-model-invocation: true`) |
| World building: several directions with palette, type and decisions in a live picker | crisp-funnel art direction (landing pages only), crisp-variants (code variants of one component) | **Large.** No pre-code direction picker, no world library |
| Shows the "category default" as a baseline | Eval baseline arm only (not shown to users) | Medium |
| "Improved by challengers": the chosen world borrows the best ideas from the losers | None | Medium |
| Live mode: pick or insert elements in your dev server | None | **Large** |
| Steer with commands (bolder, quieter, layout, adapt, animate) | crisp-tune (bolder, quieter, simpler), design-eng, improve-ui, stress | Commands exist; no visual surface for them |
| Inline text editing, drawing, arrows, comments, voice | None | Large |
| N variants with tunable parameters, accept writes code | crisp-variants (switcher, pick deletes losers), tune `--dial` | Medium. Not reachable from the page |
| DESIGN.md visualised on the page | crisp-study writes DESIGN.md | Medium. Not visualised |
| Per-agent versions, because each model produces different slop | `sync.mjs` mirrors identical copies to .claude, .cursor, .gemini, .agents | Medium. Infrastructure exists, content does not differ |
| Deterministic detector as hooks, under 10 ms, no LLM | `crisp detect` (63 rules), PostToolUse and Stop hooks | Parity. Measure latency |
| One-command install | `bin/crisp.mjs`, `scripts/install.mjs` | Parity |
| Same-prompt gallery, with vs without | Graded evals with ablation | Medium. Not public |
| Design review on every PR (paid cloud beta) | crisp-proof writes PR tables | Medium. No CI action |

---

## Phase 0. Foundations (1 week)

Do this first. Every later phase routes through these skills.

1. Ship the bug batch from `plans/skills-improvements-new-models.md` Part 2.
2. Enable auto-invocation for crisp-teach, and preserve History and Decisions on a re-run. Impeccable's "interview first" is the step that stops one model's slop being replaced with another's.
3. End crisp-audit and crisp-review with a **Next** block that names one or two commands per finding cluster ("3 tone issues → /crisp-tune quieter"). Impeccable's router does this, and it turns a critique into an action.

**Done when:** an audit on the `bad-dashboard` fixture ends with a Next block, and the triggering eval for crisp-teach passes.

## Phase 1. CRISP Worlds: directions before code (3 to 4 weeks)

New skill: `crisp-worlds`. It sits between crisp-brief and feature-design or crisp-redesign. crisp-variants stays the tool for in-code variants of one component.

**1.1 World library** (`skills/crisp-worlds/worlds/*.md`)
- Start with 30 to 50 curated worlds, not hundreds. Curation is the advantage a Head of Design brings; volume is not.
- Each world: a name, one-line thesis, source of inspiration (an airport departure board, a 1970s Swiss timetable, a field notebook), tokens (OKLCH palette, type pairing, radius, density), layout grammar, motion stance, and which registers it suits (Product or Brand).
- Tag each world with the category defaults it fights (for example "fintech blue gradient", "SaaS cloud beige").
- Lint worlds with the existing `crisp design-md lint`, so they share one format with DESIGN.md.

**1.2 Flow**
1. Read `.crisp.md` and `.brief.md`. If missing, run the crisp-teach interview first.
2. Build the **category default** on purpose, labelled as the baseline. This makes the cost of doing nothing visible.
3. Pick 3 worlds that fit the register and brief, each differing on at least 2 of layout, type, colour and density (reuse the crisp-variants diversity rule).
4. Render each as a static HTML direction card: a hero, one product surface, palette swatches, type specimen, and the 3 key decisions.
5. **Challenger pass:** the recommended direction lists what it borrowed from the others and why ("improved by challengers").
6. Write `.crisp/worlds/index.html` (the picker) and `.crisp/worlds/choice.json`.

**1.3 Picker page**
- Plain local HTML, no server. Cards side by side, enlarge on click, "Build this" writes the choice. The agent reads `choice.json`. If the harness cannot watch files, the user types "build B".
- Hover a card to show its source world (Impeccable does this).
- Image generation is optional. Rendered HTML is harness-agnostic and closer to the final code than a generated image.

**1.4 Hand-off**
- The chosen world becomes `DESIGN.md` (via crisp-study's format), then crisp-redesign or feature-design builds it.
- crisp-proof captures baseline vs chosen.

**Done when:** on the restaurant and dashboard fixtures, 3 judges (or an `llm` grader) rate the 3 directions as distinct, and the chosen direction beats the category default on crisp-review grade.

## Phase 2. CRISP Live: edit in your own dev server (6 to 8 weeks, MVP in 3)

The biggest build, and the one users noticed most in the video.

**2.1 Architecture**
- `crisp live` CLI command starts a local event bridge and prints a one-line script tag. It also offers a Vite/Next dev-only plugin, so production builds never include it.
- The overlay sends events (pick, comment, command, edit, insert) to `.crisp/live/events.jsonl` through the local bridge. Nothing leaves the machine.
- The agent consumes events through `crisp live next` (returns the oldest unhandled event as JSON). In Claude Code, a hook can trigger it. Elsewhere the user says "check live".
- Results come back as variants through the crisp-variants switcher, which already handles the dev-only toggle and clean deletion on pick.

**2.2 MVP scope (ship first)**
- Pick mode: click an element, get a selector, a source file:line (via data attributes or source maps), and a screenshot crop.
- Command chips mapped to existing skills:

| Chip | Skill |
|---|---|
| Bolder, Quieter, Simpler | crisp-tune |
| Fix layout | crisp-improve-ui (scoped to the element) |
| Animate | crisp-design-eng |
| Adapt for mobile | crisp-stress cases S12, S13, then fix |
| Rewrite copy | crisp-copy |
| Check accessibility | crisp-a11y (scoped) |

- Free-text comment on the element.
- Ask for 2 or 3 variants, accept or reject.

**2.3 Version 2**
- Inline text editing that writes straight to source (no agent round-trip for copy).
- Insert mode: draw a box, describe a section ("case study section"), get it built at that size and position.
- Drawing and arrows, sent as an annotated screenshot.
- Tunable parameters on variants (the `--dial` values for VARIANCE, MOTION, DENSITY as sliders).
- DESIGN.md panel: tokens, type and colour shown live, edits written back.
- Voice input through the browser's speech API.

**2.4 Guardrails, from CRISP's evidence layer**
- Every accepted variant runs the detector and the relevant pre-flight checks before it is written.
- Each session logs to `.crisp.md` History once (top-level only, per the shared-block fix).
- crisp-proof can replay a Live session as before/after pairs.

**Done when:** a user can pick an element, ask for "quieter", compare 2 variants and accept one, with the losing code deleted and the detector clean, in under 2 minutes on the fixture app.

## Phase 3. Per-model slop tells (2 weeks)

Impeccable ships different versions per agent because each model slops in its own way.

1. Use the eval baseline arm (no skill) to collect output per model: Claude, GPT, Gemini.
2. Tag recurring tells per model (for example cloud beige plus italic serif, emoji feature cards, centred three-card stacks).
3. Split `_shared/slop-tells.md` into a common list plus `slop-tells.<harness>.md` overlays. `sync.mjs` already writes per-harness folders, so it can inline the right overlay.
4. Add matching detector rules where the tell is checkable in code.

**Done when:** each harness copy carries its own overlay, and the graded `unslop` and `audit` cases still pass.

## Phase 4. Proof and reach (2 to 3 weeks)

1. **Public gallery.** Run the same prompt with and without CRISP ("homepage for a family Italian restaurant", "SaaS analytics dashboard", "settings page"). Publish the pairs with the crisp-review grade on each side. The eval suite already produces both arms.
2. **Functional first, then style.** The restaurant example in the video put opening hours, phone and directions at the top. Add this to crisp-funnel and crisp-review as a check: "The 2 things a visitor came for are visible without scrolling."
3. **PR design review.** A GitHub Action that runs crisp-review and crisp-proof on changed UI files and posts one comment with the grade, top 3 issues and before/after table. Free and self-hosted, which undercuts a paid cloud service.
4. **Detector speed.** Measure hook latency on a large repo. Rewrite in a faster language only if the median goes over 50 ms. Users do not see the language, only the speed.

---

## What not to copy

- **Hundreds of worlds.** Fifty strong ones beat five hundred average ones. Your taste is the product.
- **A Rust rewrite** before latency is a measured problem.
- **A cloud service** before the free Action shows demand.
- **Landing-page bias.** Most of Impeccable's demo is marketing pages. CRISP covers product UI (dashboards, settings, AI surfaces). Keep the worlds library split by register so product screens get product-grade directions.

## Design-system work vs new-feature work

| Phase | Type of work |
|---|---|
| 0, 3 | Design-system work: rules, shared blocks, detector |
| 1 | Both: world library is system content; the flow is a new feature |
| 2 | New feature: novel interaction, needs its own brief, flow and usability test |
| 4 | Distribution and proof |

Phase 2 deserves a proper `/crisp-brief` and `/feature-design` pass before code. It is a product in its own right.

## Suggested sequence

| Weeks | Work |
|---|---|
| 1 | Phase 0 |
| 2 to 5 | Phase 1, and the Phase 2 brief and prototype in parallel |
| 6 to 8 | Phase 2 MVP |
| 9 to 10 | Phase 3, Phase 4 gallery |
| 11 onward | Phase 2 version 2, PR Action |
