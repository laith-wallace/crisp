---
name: crisp-tune
description: Turn the tone of an existing UI up or down without redesigning it - three modes (bolder, quieter, simpler) each made of a fixed, countable list of moves, plus --dial overrides for VARIANCE, MOTION, and DENSITY on a 1-10 scale, all inside the project's tokens. Use when "make it bolder", "tone it down", "this is too loud", "too busy", "simplify this", "distill it", "more personality", "less motion", or "denser". Fixing specific usability issues belongs to /crisp-improve-ui; changing the brand or the IA belongs to /crisp-redesign; motion craft details belong to /crisp-design-eng.
metadata:
  version: "1.0.0"
  author: Laith Wallace - FlowConverts
  adapted-from: workflow inspired by impeccable bolder/quieter/distill and taste-skill dials (no vendored code)
---

# /crisp-tune - Tone Dials

"Make it pop" and "tone it down" are the two most common design requests and the two most often answered with a random pile of changes. This skill answers them with a fixed list of moves per mode, each one countable before and after, applied only with values the project already owns.

Load `.crisp.md` if it exists. Its **register** caps how far a mode may go (table below). Load `DESIGN.md` if it exists; it is the token source. With neither, read tokens from CSS custom properties and the Tailwind config, and declare that in one line. Read `.crisp.md` `## Decisions`: a move that would undo an accepted decision is skipped and listed as `skipped: decision YYYY-MM-DD`.

## When to use / not use

| Use this | Use the neighbour instead |
|---|---|
| The surface works but the tone is wrong (too loud, too flat, too busy) | Specific usability problems -> `/crisp-improve-ui` |
| A quick, reversible shift on one surface | New brand, new IA, new visual language -> `/crisp-redesign` |
| Setting VARIANCE / MOTION / DENSITY to a number | How a single animation should feel -> `/crisp-design-eng` |
| | No tokens exist yet -> `/crisp-study .` first to extract them |

## Inputs

| Input | Default | Notes |
|---|---|---|
| Target | required | One surface: a file, component, route, or URL. Never "the app" |
| Mode | required unless `--dial` given | `bolder`, `quieter`, or `simpler` |
| `--dial` | none | `variance=N`, `motion=N`, `density=N`, each 1-10, comma-separated |
| `--dry-run` | off | Print the move plan and stop; zero edits |

## Register caps

| Register | bolder may reach | quieter may reach | Dial range |
|---|---|---|---|
| Brand | VARIANCE 9, MOTION 8 | VARIANCE 3, MOTION 2 | 1-10 |
| Product | VARIANCE 5, MOTION 4 | VARIANCE 1, MOTION 1 | VARIANCE 1-6, MOTION 1-5, DENSITY 3-10 |

A dial request above the cap is clamped and the clamp is reported. It is never silently applied.

## The dials

Rate the current surface first, then move. Scores come from counts, not taste:

| Dial | 1-3 | 4-6 | 7-10 |
|---|---|---|---|
| VARIANCE (layout risk) | Single column or symmetric grid, one type family, one accent | One asymmetric section or one display face | Broken grid, overlap, 2+ display treatments, unconventional nav |
| MOTION | Hover/focus only, 0 entrance animations | Entrance on 1-3 sections, state transitions | Scroll-linked, staggered, or ambient motion on 4+ elements |
| DENSITY | Body gap >= 32px, <= 1 primary block per viewport | 16-32px gaps, 2-3 blocks per viewport | <= 12px gaps, tables, 4+ blocks per viewport |

A `--dial` value moves the surface one band toward the target per run at most. Going from 2 to 8 takes two runs; say so.

## The moves

Each mode is an ordered list. Apply moves top to bottom, skip a move only if it is already satisfied (say so) or blocked by a decision. Every move names its countable before/after.

### bolder

1. Raise the display/body size ratio to >= 3:1 using the largest existing type token. Count: ratio before/after.
2. Give exactly one element per viewport the primary accent fill; remove accent fill from the rest. Count: accent-filled elements.
3. Increase heading weight one step on the token scale (e.g. 500 -> 700). Count: heading weights in use.
4. Widen the largest section's spacing to the top spacing token, and tighten the rest one step, so contrast in rhythm grows. Count: distinct section gaps.
5. Make the primary CTA the highest-contrast element on screen (>= 7:1 label, solid fill). Count: CTA contrast ratio.
6. Replace one symmetric layout row with an asymmetric split using existing grid columns (VARIANCE +1). Count: asymmetric rows.
7. Add at most one purposeful entrance or state transition, only when MOTION is below the register cap. Count: animated elements.

### quieter

1. Cut accent colours to one. Every other accent use becomes a neutral token. Count: distinct accent colours.
2. Drop shadow levels to a maximum of 2 (none + one). Count: distinct `box-shadow` values.
3. Remove decorative motion: any animation where no state changes (pulses, floats, ambient loops, hover zoom on cards). Count: animated elements.
4. Reduce font weights in use to a maximum of 3. Count: distinct weights.
5. Remove borders that duplicate a background change, leaving one separation method per container. Count: bordered containers.
6. Replace saturated background fills on non-primary sections with the surface token. Count: tinted sections.
7. Lower the display/body size ratio to <= 2.5:1 when it exceeds it. Count: ratio.

### simpler (distill)

1. Cut every element that does not serve the surface's primary action or primary information. List each removed element; never delete content the user wrote without listing it.
2. One primary CTA per viewport; others become secondary or link style. Count: primary-styled CTAs.
3. Merge duplicate messages (the same claim in a heading and a subhead). Count: duplicated claims.
4. Remove nested containers: a card inside a card becomes one card. Count: nesting depth.
5. Reduce distinct type sizes on the surface to a maximum of 5. Count: distinct font sizes.
6. Reduce distinct spacing values to the token scale only. Count: off-scale spacing values.
7. Remove icons that repeat their label's meaning in a list of 3+ items. Count: decorative icons.

## Steps

1. **Load context.** `.crisp.md`, `DESIGN.md`, Decisions. State register, token source, and caps in three lines.
2. **Baseline.** Rate the three dials. Record every count the chosen moves will touch. Run the detector and the Slop Check on the target:
   ```bash
   npx @laith-wallace/crisp detect <target files>
   ```
3. **Plan.** List the moves that will apply, each with its before count and the planned after. With `--dry-run`, print this and stop.
4. **Apply.** Edit only the target's files and only with existing token values. A move that needs a value the tokens lack is skipped and reported as `needs token: <what>`; never invent one.
5. **Verify.** Re-count every move. Re-rate the dials. Run the detector on the changed files and the Slop Check again:
   ```bash
   npx @laith-wallace/crisp detect <changed files>
   ```
6. **Build.** `npm run build` (or the project equivalent) and `tsc --noEmit` where present. A failing build means revert the move that broke it.
7. **Report** in the format below.

## Slop Check

Run on the baseline and on the result.

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

## Binary rules

1. Zero values outside the token set in the diff (colours, radii, spacing, shadows, font sizes). Count off-token values added: must be 0.
2. Zero moves outside the chosen mode's list.
3. Every applied move reports a before and an after count.
4. No dial exceeds the register cap; every clamp is reported.
5. Detector findings after <= detector findings before.
6. Slop tells after <= slop tells before. A bolder run that adds a tell (gradient text, glow halo, hero pill) has failed that move; revert it.
7. Zero edits outside the target's files.
8. Zero changes to copy, IA, routes, anchor IDs, or tracked element labels.
9. Build passes after the run.
10. `bolder` and `quieter` never run in the same pass.

## Stop conditions

| Condition | Stop reason |
|---|---|
| All planned moves applied or explained, checks re-run | `DONE` |
| `--dry-run` | `PLAN ONLY` |
| No token source can be found | `NO TOKENS` - suggest `/crisp-study .` |
| Every move is already satisfied | `ALREADY THERE` - report the dial ratings |
| Detector or slop count rose and the cause cannot be reverted cleanly | `REGRESSED` - first line of the report, list the cause |
| The target is not one surface | `SCOPE` - ask for one surface |

## Output format

```
## crisp-tune: <target> - <mode>

**Stop reason:** DONE
**Register:** Product (from .crisp.md)   **Tokens:** DESIGN.md
**Dials:** VARIANCE 3 -> 3   MOTION 6 -> 2   DENSITY 5 -> 5   (clamped: none)

| # | Move | Before | After | Where |
|---|---|---|---|---|
| 1 | Accent colours | 4 | 1 | src/components/Hero.tsx:12, :40 |
| 2 | Shadow levels | 5 | 2 | src/styles/cards.css:8 |
| 3 | Decorative animations | 3 | 0 | src/components/Stats.tsx:22 |
| 6 | Tinted sections | - | - | skipped: decision 2026-08-02 |

**Detector:** 4 -> 1   **Slop Check:** Fail (2 tells) -> Pass (0)
**Off-token values added:** 0   **Build:** pass
**Needs token:** <omit if none>
**Next:** /crisp-proof for the before/after pair
```

If the result regressed, the first line is `REGRESSED` and the table follows.

## Self-check before delivery

- [ ] Every row has a before and after count, or a skip reason
- [ ] Detector and Slop counts are quoted from this run's output, not predicted
- [ ] `git diff` adds zero hex, rgb, oklch, or px values that are not already tokens
- [ ] No copy, route, or tracked label changed
- [ ] Dials stayed inside the register caps
- [ ] Zero em dashes in the report

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-tune | [mode] | [surface] | V[a->b] M[a->b] D[a->b] | detector [a->b]
```
