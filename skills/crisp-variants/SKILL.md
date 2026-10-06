---
name: crisp-variants
description: Build N (default 3, max 5) genuinely different design variants of one component or section in the real codebase, behind a dev-only variant switcher (?variant= or a small floating toggle), so the user compares them live; each variant has a one-line thesis and differs on at least 2 of layout, hierarchy, density, typography, and colour use; when one is picked, the others and the switcher are deleted with zero dead code left. Use when "show me options", "give me 3 versions", "explore variants", "A/B this hero", "I can't decide how this should look", or "prototype a few directions". Designing a new feature from a problem belongs to /feature-design; adjusting the tone of one existing design belongs to /crisp-tune; production A/B testing with real traffic is out of scope.
metadata:
  version: "1.0.0"
  author: Laith Wallace - FlowConverts
  adapted-from: workflow inspired by emilkowalski/skills prototype and impeccable live/generate (no vendored code)
---

# /crisp-variants - Compare Live, Then Delete

Mockups lie: they skip real data, real breakpoints, and real neighbours. Three variants rendered inside the actual app, one keypress apart, settle a design argument faster than any description. The cost is dead code, so this skill owns both halves: build the variants behind a dev-only switcher, then, once the user picks, delete everything that lost.

Load `.crisp.md` if it exists. Its register and Named Rules bound every variant. Load `DESIGN.md` if it exists; every variant uses its tokens. Read `## Decisions`: a variant may not reintroduce a pattern the team accepted removing.

## When to use / not use

| Use this | Use the neighbour instead |
|---|---|
| One component or section, several plausible directions | A new feature from a problem statement -> `/feature-design` |
| The user wants to see options in the real app | One design that needs louder or quieter tone -> `/crisp-tune` |
| A design argument that words have not settled | Real-traffic A/B testing -> the product's experiment tooling (out of scope) |
| | Before/after proof of the chosen one -> `/crisp-proof` |

## Inputs

| Input | Default | Notes |
|---|---|---|
| Target | required | One component or one section. Never a whole page or the app |
| `--n` | `3` | 2-5. Above 5 the user cannot hold them in mind; refuse and cap at 5 |
| `--switcher` | `query` | `query` (`?variant=a`) or `floating` (small dev-only toggle, bottom corner) |
| `--brief` | inferred | One line on what the variants should explore; otherwise inferred from the request |
| Pick | none | Later: `/crisp-variants pick b` to keep one and clean up |

## The difference test

Each variant must differ from every other variant on **at least 2** of these axes. Record which, per pair:

| Axis | Counts as different when |
|---|---|
| Layout | Different grid structure, order, or alignment (stacked vs split vs inline) |
| Hierarchy | A different element is the primary focal point |
| Density | Spacing or items-per-viewport differ by at least one token step / band |
| Typography | Different type token for the primary text, or a different scale ratio |
| Colour use | Accent applied to a different element, or fill vs outline vs neutral treatment |

A variant that only changes colour, or only reorders two items, is a tweak, not a variant. Replace it.

## Steps

### Build phase

1. **Load context.** `.crisp.md`, `DESIGN.md`, Decisions. State register and token source.
2. **Record the start.** `git rev-parse --short HEAD` and `git status --porcelain`. The original component is variant `a` (the control) unless the user says otherwise; it is never edited.
3. **Write the theses.** One line per new variant: what it bets on and for whom. Example: `b - Proof first: lead with the customer logo row, CTA second, for sceptical buyers`. Show the theses before writing code.
4. **Build the variants** as sibling files next to the target (`Hero.variant-b.tsx`, `Hero.variant-c.tsx`), or as sibling components in the same file only when the framework forces it. Same props interface as the original. Existing tokens only.
5. **Add the switcher** at the single place the target is rendered. Guard it so it is unreachable in production: `process.env.NODE_ENV !== 'production'`, `import.meta.env.DEV`, `dev` from `$app/environment`, or an existing dev flag. Code patterns are in `references/switcher.md`. In production the original renders, always.
6. **Check every variant.** For each one, run the Slop Check and the detector, and confirm the build:
   ```bash
   npx @laith-wallace/crisp detect <variant files>
   npm run build
   ```
   A variant that fails the Slop Check or adds detector findings is fixed or replaced before the user sees it.
7. **Prove the guard.** Run a production build and grep the output for the variant file names or the switcher marker (`data-crisp-variants`). Zero hits, or the guard is wrong.
8. **Hand over** with the Build report below. Stop and wait for the pick.

### Pick phase

9. **Keep the chosen variant.** If it is not `a`, move its implementation into the original file (same name, same export) so imports elsewhere are untouched.
10. **Delete the rest.** Every losing variant file, the switcher, the guard, and any helper added in step 5.
11. **Prove zero dead code.**
    ```bash
    grep -rn "variant-[b-e]\|data-crisp-variants\|crisp-variant" <src dirs>   # must print nothing
    git diff --stat <start commit>                                               # only the target's files
    ```
12. **Re-run** the detector and the build on the kept file. Report the diff with the Pick report.

## Slop Check

Run on every variant before handover.

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

1. 2 <= N <= 5. The original counts as variant `a`.
2. Every variant has a one-line thesis.
3. Every pair of variants differs on >= 2 axes of the difference test, and the report names them.
4. Every variant passes the Slop Check (0 tells) and adds 0 detector findings over the original.
5. Zero off-token values in any variant.
6. Every variant keeps the original's props interface, copy source, tracked labels, and anchor IDs. Copy may be rearranged, not rewritten, unless the brief asks for copy variants.
7. The switcher is unreachable in production: the production build contains 0 references to variant files or the switcher marker.
8. Zero edits outside the target's file, its new sibling variant files, and the one render site that hosts the switcher.
9. After the pick: `grep` for variant markers returns 0 lines, and `git diff --stat` against the start commit lists only the target's files.
10. Build passes at handover and after the pick.

## Stop conditions

| Condition | Stop reason |
|---|---|
| Variants built, checked, guard proven | `READY TO COMPARE` - wait for the pick; do not choose for the user |
| Pick applied and cleanup proven | `PICKED <id>` |
| Fewer than 2 variants pass the difference test and the Slop Check after one replacement each | `NOT ENOUGH DISTINCT VARIANTS` - show what passed and why the rest failed |
| The target has no single render site to host the switcher | `NO SWITCH POINT` - ask where it renders |
| The production guard cannot be proven (no build, unknown env flag) | `GUARD UNPROVEN` - do not hand over; say what is missing |
| The user abandons ("none of them") | Delete all new variants and the switcher, prove zero dead code, report `REVERTED` |

## Output format

Build report:

```
## crisp-variants: <target>

**Stop reason:** READY TO COMPARE
**Switcher:** http://localhost:3000/pricing?variant=a|b|c   (dev only, guard: NODE_ENV)
**Start commit:** abc1234

| Id | Thesis | Differs from a on | Slop | Detector |
|---|---|---|---|---|
| a | Control - current hero | - | Pass | 0 |
| b | Proof first: logos lead, CTA second, for sceptical buyers | layout, hierarchy | Pass | 0 |
| c | One sentence and one button: dense, type-led, for returning users | density, typography, colour use | Pass | 0 |

**Pairwise:** b vs c - layout, density, typography
**Guard proof:** production build, 0 hits for variant files and data-crisp-variants
**Build:** pass

Pick one: /crisp-variants pick <id>
```

Pick report:

```
## crisp-variants: <target> - picked <id>

**Stop reason:** PICKED c
**Deleted:** Hero.variant-b.tsx, Hero.variant-c.tsx, switcher in app/pricing/page.tsx
**Dead-code check:** 0 matches for variant markers
**Diff vs abc1234:** 1 file changed, +34 -41 (src/components/Hero.tsx)
**Detector:** 0   **Build:** pass
**Next:** /crisp-proof abc1234 -> HEAD for the before/after
```

## Self-check before delivery

- [ ] Every thesis is one line and names a bet, not a style word
- [ ] Every pair differs on >= 2 axes, written in the report
- [ ] Slop and detector results are quoted from this run
- [ ] Production build grep run, result quoted
- [ ] After the pick: dead-code grep prints nothing and the diff stat is shown
- [ ] Zero em dashes in the report and in any variant copy

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists, after the pick. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-variants | [surface] | [N] variants, picked [id]: [thesis]
```
