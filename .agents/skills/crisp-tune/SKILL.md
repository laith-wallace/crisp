---
name: crisp-tune
description: Turn the tone of an existing UI up or down without redesigning it - three modes (bolder, quieter, simpler) each made of a fixed, countable list of moves, plus --dial overrides for VARIANCE, MOTION, and DENSITY on a 1-10 scale, all inside the project's tokens. Use when "make it bolder", "tone it down", "this is too loud", "too busy", "simplify this", "distill it", "more personality", "less motion", or "denser". Fixing specific usability issues belongs to /crisp-improve-ui; changing the brand or the IA belongs to /crisp-redesign; motion craft details belong to /crisp-design-eng.
metadata:
  version: "1.0.1"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
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

One table for modes and `--dial`, so a mode can never reach further than an explicit dial:

| Register | Dial | `--dial` range | quieter floor | bolder ceiling |
|---|---|---|---|---|
| Brand | VARIANCE | 1-10 | 3 | 9 |
| Brand | MOTION | 1-10 | 2 | 8 |
| Brand | DENSITY | 1-10 | - | - |
| Product | VARIANCE | 1-6 | 1 | 6 |
| Product | MOTION | 1-5 | 1 | 5 |
| Product | DENSITY | 3-10 | - | - |

A dial request outside the range is clamped and the clamp is reported. It is never silently applied.

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

**Binary rule: one or more tells present = Fail. Zero tells = Pass.** It is a disqualifier, not a dimension. A tell recorded in `.crisp.md` `## Decisions` as accepted for this surface does not count. A purple gradient on a brand that is purple is not a tell. A pattern documented in the project's DESIGN.md or .crisp.md tokens is a decision, not a tell.

**Model overlay: Codex and GPT (agents standard).** Seed list, unverified: confirm with scripts/slop-harvest.mjs before trusting. These are tells commonly attributed to GPT-family output, not measured ones. Until a harvest run confirms a row, a match is a note in the report, not a Fail.

| Tell | What it looks like | Nearest detector rule |
|------|--------------------|-----------------------|
| Emoji feature cards | An emoji standing in for an icon at the start of every card or list heading | `emoji-heading-icon` |
| Centred card stack | Centred hero, then centred rows of `rounded-2xl shadow-lg` cards with equal weight | `thin-border-wide-shadow` (partial) |
| Blue-to-purple utility gradient | `from-blue-500 to-purple-600` or similar on the hero or primary button | `purple-blue-gradient` |
| Placeholder content left in | Lorem ipsum, "Your Company", `href="#"` links that go nowhere | `lorem-ipsum`, `dead-href` |
<!-- /crisp:shared slop-tells -->

## Binary rules

1. Zero values outside the token set in the diff (colours, radii, spacing, shadows, font sizes). Count off-token values added: must be 0.
2. Zero moves outside the chosen mode's list.
3. Every applied move reports a before and an after count.
4. No dial exceeds the register cap; every clamp is reported.
5. Detector findings after <= detector findings before.
6. Slop tells after <= slop tells before. A bolder run that adds a tell (gradient text, glow halo, hero pill) has failed that move; revert it.
7. Zero edits outside the target's files, except the History line, `.crisp/lessons.md`, and the finish check's git-ignored `.crisp/render/`.
8. Zero changes to copy, IA, routes, anchor IDs, or tracked element labels. Exception: `simpler` moves 1, 3 and 7 may delete copy, because distilling is their purpose; every deletion is listed in the report.
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
Next: <command> - <why>
```

If the result regressed, the first line is `REGRESSED` and the table follows.

## Self-check before delivery

- [ ] Every row has a before and after count, or a skip reason
- [ ] Detector and Slop counts are quoted from this run's output, not predicted
- [ ] `git diff` adds zero hex, rgb, oklch, or px values that are not already tokens
- [ ] No copy, route, or tracked label changed (except listed `simpler` deletions)
- [ ] Dials stayed inside the register caps
- [ ] Zero em dashes in the report

## Longitudinal tracking

<!-- crisp:shared history -->
**Top-level runs only.** Write `## History` lines and `crisp critique write` snapshots only when the user invoked this skill directly. When another skill calls it (`/crisp-loop`, `/crisp-proof`, `/crisp-variants`, or a CRISP Live session), skip both writes and hand the result back to the caller, because the caller writes one line for the whole run and nested writes would multiply entries (a five-iteration loop would otherwise log six lines). `## Decisions` lines are not affected: they record what the user said, whoever ran the skill.
<!-- /crisp:shared history -->

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-tune | [mode] | [surface] | V[a->b] M[a->b] D[a->b] | detector [a->b]
```

## Finish check

<!-- crisp:shared finish-check -->
**Finish check.** Before you say a built or changed page is done, measure it as the browser draws it. Screenshots go to `.crisp/render/`: tool output, git-ignored, and never counted as an edit outside this skill's scope.

```bash
mkdir -p .crisp/render && { grep -qx '\*' .crisp/render/.gitignore 2>/dev/null || printf '*\n' >> .crisp/render/.gitignore; } && rm -f .crisp/render/*.png
npx @laith-wallace/crisp render-check "<local url>" --width 1280,375 --shots .crisp/render
```

- Exit 0: clean. Say so in the report.
- Exit 2: findings. `page-overflow-x`, `overlapping-text`, `text-cut` and `text-spills` are bugs, never style choices. Fix them and run it again, at most 3 rounds.
- Exit 3 (inconclusive), exit 1 (no URL, no Playwright, or the page did not load), or no local URL to give it: report `render-check: untested` with the reason. Never report the page as checked, and open no screenshots: an untested or inconclusive run proves nothing about the layout.

Only after exit 0 or 2, open `.crisp/render/render-1280.png` and `.crisp/render/render-375.png` (the folder was emptied first, so both are from this run) and look at them once against the taste rules. A clean exit code proves the layout holds, not that the page has taste.
<!-- /crisp:shared finish-check -->

## Taste rules

<!-- crisp:shared taste -->
**Taste rules.** Each rule is a count, so a check can say pass or fail. Rules 1 to 7 apply when this skill makes or judges a rendered UI (a screen, a page, a component). The copy tells apply to all copy, prose included. Where this skill states a stricter limit for the same pattern, the stricter limit wins. Em dashes follow this skill's own rule where it has one.

1. **One detail only this client has.** Each screen shows at least 1 detail taken from the brief or the product: its units, its terms, its real prices, hours or numbers. A screen that would fit any business in the category fails.
2. **Real material first.** The client's own product, UI, photos and words lead. A stand-in (stock photo, mock data, coined name) is listed in the report as a stand-in. Zero stand-ins are presented as the client's own.
3. **One system.** 1 primary and 1 secondary button style, 1 card style, 1 radius scale, 1 heading scale, 1 link style per surface.
4. **One bold move per screen.** At most 1 element per screen breaks the system (an oversized heading, a full-bleed photo, a colour block). Everything around it stays quiet.
5. **Structure says something true.** Numbers (01, 02) only on steps a user follows in order. A label over a heading only when it adds information the heading does not.
6. **Motion answers the user.** Every button, link and linked card answers hover and press. Zero sections fade in on scroll by default. Anything that moves for more than 5 seconds has a pause control.
7. **Read the taste bank.** When `.crisp/taste-bank/` exists, read it before designing and name the 1 or 2 references this work borrows from, and what it borrows. Never copy a reference's code, copy, images or signature effect.

**Copy tells that current models still write.** These look like good copy, so they pass review. Count them on the whole surface.

| Tell | Limit | Fix |
|---|---|---|
| Invented specifics: room numbers, batch numbers, times, percentages the brief does not give | 0 | Use a fact from the brief, or write a plainer line |
| A strip of 3 or 4 figures over one-word labels | 0, unless every figure is a brief fact (price, hours, count) | Put each figure in the sentence it proves |
| Two-fragment heading, "X. Y." ("Twelve rooms. Three ways to stay.") | 1 | A name with a claim under it, a verb and the thing, or one plain sentence |
| Number-pair heading ("Four projects, four problems") | 0 | Say what the section holds |
| Contrast frames: "not X but Y", "isn't X", "rather than", "instead of", "without the" | 2, all forms counted together | State the positive fact alone |
| Negation runs ("No forms, no waiting") | 1 | Keep it only when each item is a refusal the buyer can check |
| Virtue words about the client: honest, calm, quiet, quietly, genuinely, truly, simply, thoughtful, carefully, intentional | 0 | Show it with a fact or an admission |
| A dry closing quip at the end of a paragraph | 1 | End on information |
| Default cast names: Priya, Okafor, Marcus, Dana, Aisha, Theo, Kestrel, Halcyon, Acme, Northwind, Lumen, Nimbus, Zenith | 0 | Names only from the brief; mock names that fit the place and age |
| The same section shape (label, heading, short lede, 3 cards) used back to back | 2 in a row | Shape each section from the question the reader has there |
| Testimonials or quotes the brief does not give word for word | 0 | Leave them out |
| Unsourced proof figures ("3x faster", "10,000+ teams", "98% happy") | 0 | Only figures from the brief, with their unit, in a sentence |
| The page talks about itself ("Below you'll find", "This section shows") | 0 | Say the thing |

**Over-correction.** Every ban breeds a substitute. Check for the substitute too.

| Rule applied | Habit it breeds | Counter |
|---|---|---|
| No em dashes | Comma splices and nothing but full stops | Rewrite the sentence: split it in two, or join the parts with a plain word ("and", "so", "because") |
| No "not X but Y" | "rather than", "instead of", "without the" | Count them together; state the positive |
| No hype words | Calm words: quietly, steady, honest, practical | A fact in place of the adjective |
| Avoid lists of three | Everything in pairs | List as many items as there are |
| Be specific | Invented numbers and stories | Brief facts, or a plainer line |
| Short sentences | A drumbeat of fragments | Let 1 sentence per section run long |
| End strong | A moral or quip on every paragraph | End on information |
| Vary section length | One huge and one tiny section on every page | Length follows the material |
<!-- /crisp:shared taste -->

## Lessons

<!-- crisp:shared lessons -->
**Lessons log.** The pack learns the user's taste from their corrections.

- **Before you start:** when `.crisp/lessons.md` exists, read it. Apply every line tagged with this skill or with `all`.
- **This file is always writable.** Appending to `.crisp/lessons.md` is allowed in every skill, read-only ones and ones limited to their target's files included. It never counts against a skill's scope, clean-tree or zero-writes rules.
- **When the user corrects or rejects your output:** append 1 line to `.crisp/lessons.md` (create it if needed) in this shape:
  `- YYYY-MM-DD | <skill or all> | <what was wrong> | <the rule that would have prevented it>`
  Write the rule as a count or a yes/no check, so a later run can test it. One correction, one line. Never log praise, and never log a line the user did not cause.
- **Promote:** when the same rule appears 3 times, tell the user it is ready to move into the pack's shared taste rules (`skills/_shared/taste.md` in the CRISP repo).
<!-- /crisp:shared lessons -->

## Next step

End the report with one line, `Next: <command> - <why>`, picked from these by what this run found. It is the report's only next-step line: where the report template above has a **Next:** field or a `Ready for /<command>` line, write this line there instead (a status line such as `Status: Ready for development` stays as it is). Where the report ends with Handover lines, put it directly above them.

- DONE, the tone is right: `/crisp-proof` for the before and after
- DONE, other issues surfaced: `/crisp-review`
- ALREADY THERE: `/crisp-review` if the surface still feels off, since the tone moves are all applied
- PLAN ONLY: `/crisp-tune` again without `--dry-run` to apply the plan
- REGRESSED: `/crisp-review` to see what broke before tuning again
- SCOPE: `/crisp-tune` again on one surface
- NO TOKENS: `/crisp-study .`
