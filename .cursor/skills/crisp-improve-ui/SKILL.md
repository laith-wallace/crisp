---
name: crisp-improve-ui
description: Evidence-locked improvement audit of an existing UI surface - read-only on product source, keeps only findings that pass a three-proof gate, writes self-contained implementation plans to design-plans/. Use for 'improve this UI', 'tighten this up without redesigning', 'find design drift', or 'why does this page feel inconsistent'. Identity is preserved - for overhauls use /crisp-redesign.
metadata:
  version: "1.1.1"
  author: Laith Wallace - FlowConverts
---

# /crisp-improve-ui - Improve Without Replacing

Audit one coherent product surface against the system that actually governs it, prove every problem before reporting it, and write plans another agent can execute cold. The product's identity is preserved. Existing owners are reused. No finding beats an unsupported finding.

This is the evidence-locked sibling of the pack:

- **/crisp-review** grades fast on judgement. This skill reports nothing it cannot prove.
- **/crisp-redesign** changes the design. This skill conforms the implementation to the design it already has.
- **/crisp-design-eng** fixes how things feel. This skill fixes where the code contradicts its own system.

If `.crisp.md` exists in the project root, load it first. Its documented design system, tokens, and benchmark references count as binding design sources in Step 2. Its **register** scopes judgement: on a Product surface, drift from the system is the enemy; on a Brand surface, a deliberate one-off may be identity - demand stronger contract evidence before calling it a defect.

## Boundaries

Ten hard rules. Violating any one invalidates the run:

1. Never modify product source. Create or edit files only under `design-plans/`.
2. Never install dependencies, run formatters, commit, or push.
3. Never update design documentation - record accepted doc changes inside the plan for its executor.
4. Use rendered evidence (screenshots, live pages) only when the user provides it or explicitly asks for visual inspection.
5. Every plan is self-contained - its executor has no access to this audit or conversation.
6. Every finding cites file:line (or URL+selector for rendered evidence). No location = no finding.
7. Zero findings from "prefer", "generally", naming similarity, or repetition alone.
8. Zero invented values - if the system has a token or component contract, the plan uses it by exact name.
9. Zero combined findings - one root problem per row, one plan per selected change.
10. Zero implementation - if asked to "just fix it", offer a plan; never execute it.

## 1. Select the surface

Honour the user's scope. If the request is broad, select one deployable application and one coherent surface family that carries a primary product task (`.crisp.md`'s jobs-to-be-done names the candidates). State the selection in one line before proceeding. Never synthesise the whole repository into one product.

Start from the surface's routes and layouts. Trace the rendered path: composition → shared components → variants → resolved tokens → styles. Do not begin with a repository-wide grep for inconsistencies - that produces candidates without context.

A connection exists only when proven through rendering, imports, props, resolved configuration, CSS inheritance, or a generated artifact the surface actually loads. Shared names, similar tokens, repository proximity, and conceptual kinship prove nothing. Exclude other apps, previews, configurators, generated registries, legacy systems, and enterprise variants unless they participate in the traced path.

## 2. Reconstruct the governing system

Collect the design sources that bind this surface, in precedence order:

1. `.crisp.md` - documented design system, tokens, register, and benchmarks
2. `DESIGN.md`, `CRISP-STYLE-KIT.md`, or equivalent repository design guidance
3. Surface-local design documentation and token definitions

Use a source only after proving it is current and governs the selected surface. Drafts, proposals, migrations, and task lists describe future intent - they bind nothing unless explicitly accepted. Absence of design documentation is not a finding.

Inspect only the tokens, variables, themes, primitives, variants, and compositions on the traced path. Resolve every alias and variant to its definition. Classify an implementation as legacy only when the repository says so.

Record before hunting:

```markdown
## Design language
- Audited surface:
- Design sources:
- Documented decisions:
- Governing owners and consumers:
- Explicit exceptions:
```

Write `None documented` under `Explicit exceptions` unless a cited source names the exception. An undocumented exception is how deliberate design decisions get flagged as bugs.

## 3. Prove findings

Sweep every traced surface's user-facing labels, active-state presentation, responsive branches, and sibling variants for internal contradictions. Everything found is a **candidate**, nothing more.

A finding is in scope only when its correction primarily changes visual presentation, interface copy, layout, component styling, or conformance to a documented design rule. If the correction primarily changes whether product behaviour works, it is a bug report, not a design finding - note it in one line and move on.

A candidate becomes a finding only when all three proofs exist:

1. **Contract** - cite a binding design decision for this exact property and scope, or a direct contradiction in user-facing presentation within the same task. "Prefer", "generally", naming conventions, omissions, and repetition establish nothing.
2. **Runtime** - prove the cited owner, value, or behaviour reaches the affected surface through the traced path. Never compare separate ownership layers or lifecycle states.
3. **Correction** - state the one change the evidence requires. If it uses an existing token, variant, primitive, or exemplar, name it exactly. If the evidence supports multiple corrections, the intent is ambiguous, or the correction requires inventing product intent - reject the candidate.

Source code can prove: token, typography, colour, spacing, layout, copy, component-variant, responsive-presentation, and explicit design-contract violations. Source code cannot prove: hierarchy, prominence, density, clarity, discoverability, or perceived coherence - those need rendered or user evidence.

Route out-of-scope candidates instead of dropping them silently, one line each:

- Accessibility and ARIA semantics → `/crisp-a11y` (unless the user asked for them here)
- Microcopy quality (as opposed to copy contradiction) → `/crisp-copy`
- Motion, interaction feel, and craft polish → `/crisp-design-eng`
- Broken routes, data wiring, performance, architecture → note as engineering issues

Tag every surviving finding with its CRISP dimension and a severity:

- **P0** - the contradiction breaks the user's read of the surface (wrong state shown, contradictory labels in one task)
- **P1** - visible drift a user would notice across the surface (wrong token in a primary component, divergent variant)
- **P2** - real inconsistency a user would feel but not name
- **P3** - polish; the system is violated but the surface reads fine

## 4. Vet findings

Re-open every cited source and try to falsify each finding. Six checks, all binary - one failure deletes the row:

1. The problem exactly matches the cited implementation at the cited line.
2. The cited rule governs this property AND this surface.
3. No counterevidence shows the difference is valid or deliberate (check `Explicit exceptions`, the register, and `.crisp.md` `## Decisions`).
4. The evidence supports exactly one correction.
5. The correction invents zero product intent.
6. No other finding shares the same root problem.

Only findings that pass all six enter the report.

<!-- crisp:shared decisions -->
## Settled Decisions

Before reporting, read the `## Decisions` section of `.crisp.md` if it exists. Each line is a finding the team already ruled on:

```
- YYYY-MM-DD | <rule, tell, or issue> | <surface path, or "all"> | accepted | <reason>
```

- **Same issue, same surface:** drop the finding. Add `Suppressed by decisions: N` as the last line of the output so nothing disappears silently.
- **The reason no longer holds** (the decision cites Brand register but this surface is Product, or the accepted element now blocks a task): report the finding, cite the decision's date, and state in one line what changed.
- **Never re-raise a settled decision on judgement alone.** New evidence reopens it; a different opinion does not.

When the user rejects a finding in this session with explicit words ("that's intentional", "on-brand", "won't fix", "leave it"), append one line to `## Decisions`, creating the section at the end of `.crisp.md` if it is missing. Get the date from `date +%Y-%m-%d`. Record only what the user said. Never log a decision on your own initiative.
<!-- /crisp:shared decisions -->

## 5. Report

Order surviving findings by severity, then user impact, then reach, then correction cost. Report at most five rows. If more survive, add one line: `N further findings withheld - say "show all" to list them.` Never silently discard survivors.

```markdown
## Design language
- Audited surface:
- Design sources:
- Documented decisions:
- Governing owners and consumers:
- Explicit exceptions:

## Findings
| # | CRISP | Sev | Problem | Evidence | Proposed change | Scope |
| --- | --- | --- | --- | --- | --- | --- |

## Routed elsewhere
- [One line per out-of-scope candidate and the skill or channel it belongs to, or `None.`]

## Improve first
[The single highest-leverage finding and why - or `No supported recommendation.`]
```

Evidence must name the contract, the runtime relationship, and the deterministic interface consequence, with file:line. Proposed change contains exactly one correction. Any row missing a column gets deleted, not padded.

If no candidate survives: write `No supported findings were found.` under `## Findings` and `No supported recommendation.` under `## Improve first`. A clean audit is a valid, reportable outcome - do not lower the gate to have something to say.

If findings survive, stop and ask which to turn into plans. If the user already selected a finding or explicitly requested a plan, continue with that scope. If asked to fix directly, offer a plan - never implement (Boundary 10).

## 6. Write plans

Load `references/plan-template.md`. Write one plan per selected change - never one per symptom - to `design-plans/<kebab-case-outcome>.md`.

Before writing: re-open every cited source, record the current commit (`git rev-parse --short HEAD`, or `unavailable`), name the exact reusable primitives and exemplars, and trace every affected consumer. If a plan for this change already exists in `design-plans/`, reconcile it - update stale evidence, affected surfaces, and status - instead of duplicating it.

A plan's proposed change must add zero of these tells to the surface. This check gates the plan only. A tell already on the surface is not a finding unless a cited contract forbids it (Step 3):

<!-- crisp:shared slop-tells -->
**Would someone look at this and immediately say "AI made that"?**

| Tell | What it looks like |
|------|--------------------|
| Hero metric template | Big number, small label, supporting stats below, gradient accent, with no context that explains the product |
| Identical card grid | Same-sized cards repeating icon + heading + text with equal visual weight |
| Side-stripe borders | Coloured left or right border (>1px) on cards or alerts as the primary decorative element, not a real alert or status |
| Gradient text | `background-clip: text` treatment on headings or CTAs |
| Off-brand purple-blue gradient | Purple or indigo to blue gradient on a background, button, or accent when the brand colour is not purple |
| Glassmorphism default | Blur + transparency used as the primary surface treatment, not as a specific elevated element |
| Glow halo | Radial glow, blurred colour blob, or soft spotlight behind a hero or section to show importance |
| Hero pill badge | Pill or eyebrow label above the hero headline ("New", "Introducing", "Now with AI") |
| Icon tile stack | An icon in a rounded-square tile above every card or section heading |
| Nested cards | A bordered or shadowed card inside another bordered or shadowed card |
| Fake sequence labels | Numbered labels (01, 02, 03) on items that are not steps a user follows in order |
| Decorative motion | Pulsing dots, bounce or elastic easing, hover zoom on cards, or an auto-scrolling logo strip where no state changes |
| Template copy | "Supercharge", "world-class", "seamless", or "Not a feature. A platform." in a headline or hero |
| SaaS cream + generic sans | Off-white background with no tint, Inter, Geist, Roboto or DM Sans on every level, zero distinctive colour decision |
| Saturated aesthetic lane | Editorial-typographic (italic display serif + mono labels + ruled separators) used as a default not a deliberate choice |

**Binary rule: one or more tells present = Fail. Zero tells = Pass.** It is a disqualifier, not a dimension. A tell recorded in `.crisp.md` `## Decisions` as accepted for this surface does not count. A purple gradient on a brand that is purple is not a tell.
<!-- /crisp:shared slop-tells -->

Introduce a new primitive only after proving the existing system cannot express the decision, where the primitive lives, and which consumers share it. Repetition alone never justifies a new shared primitive.

If asked to reconcile, recheck every existing plan in `design-plans/` against current source and documented decisions.

## Longitudinal tracking

After the report (not after plan-writing), append one line to `## History` in `.crisp.md` if it exists. Get the date from `date +%Y-%m-%d` - never from memory:

```
- [YYYY-MM-DD] | /crisp-improve-ui | [surface] | Findings: [N] ([P0 count] P0) | Top: [top finding in <10 words]
```

If prior `/crisp-improve-ui` entries exist for the same surface, state whether drift is shrinking or growing since the last run.
