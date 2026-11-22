---
name: crisp-variants
description: Build N (default 3, max 5) genuinely different design variants of one component or section in the real codebase, behind a dev-only variant switcher (?variant= or a small floating toggle), so the user compares them live; each variant has a one-line thesis and differs on at least 2 of layout, hierarchy, density, typography, and colour use; when one is picked, the others and the switcher are deleted with zero dead code left. Use when "show me options", "give me 3 versions", "explore variants", "A/B this hero", "I can't decide how this should look", or "prototype a few directions". Designing a new feature from a problem belongs to /feature-design; adjusting the tone of one existing design belongs to /crisp-tune; production A/B testing with real traffic is out of scope.
metadata:
  version: "1.0.1"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
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
8. **Record and hand over.** Write `.crisp/variants.json` with the target, start commit, switcher file, and every variant file path, because the pick may come in a later session that has none of this context. Then give the Build report below. Stop and wait for the pick.

### Pick phase

Read `.crisp/variants.json` first; if it is missing, rebuild the list from `git status` and the `data-crisp-variants` marker, and state that you did.

9. **Keep the chosen variant.** If it is not `a`, move its implementation into the original file (same name, same export) so imports elsewhere are untouched.
10. **Delete the rest.** Every losing variant file, the switcher, the guard, any helper added in step 5, and `.crisp/variants.json`.
11. **Prove zero dead code.**
    ```bash
    grep -rn "data-crisp-variants\|crisp-variant" <src dirs>                     # must print nothing
    grep -rnF "<each losing variant file's basename from .crisp/variants.json>" <src dirs>   # must print nothing
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

**Binary rule: one or more tells present = Fail. Zero tells = Pass.** It is a disqualifier, not a dimension. A tell recorded in `.crisp.md` `## Decisions` as accepted for this surface does not count. A purple gradient on a brand that is purple is not a tell. A pattern documented in the project's DESIGN.md or .crisp.md tokens is a decision, not a tell.
<!-- /crisp:shared slop-tells -->

## Binary rules

1. 2 <= N <= 5. The original counts as variant `a`.
2. Every variant has a one-line thesis.
3. Every pair of variants differs on >= 2 axes of the difference test, and the report names them.
4. Every variant passes the Slop Check (0 tells) and adds 0 detector findings over the original.
5. Zero off-token values in any variant.
6. Every variant keeps the original's props interface, copy source, tracked labels, and anchor IDs. Copy may be rearranged, not rewritten, unless the brief asks for copy variants.
7. The switcher is unreachable in production: the production build contains 0 references to variant files or the switcher marker.
8. Zero edits outside the target's file, its new sibling variant files, the one render site that hosts the switcher, and `.crisp/variants.json`. `.crisp/lessons.md`, the finish check's git-ignored `.crisp/render/`, and the one `## History` line in `.crisp.md` are logs and tool output, not edits; no other `.crisp.md` change is allowed.
9. After the pick: `grep` for variant markers returns 0 lines, and `git diff --stat` against the start commit lists only the target's files, plus `.crisp.md` (its one History line) and `.crisp/lessons.md` when a lesson was logged.
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

Next: /crisp-variants pick <id> - choose the variant to keep
```

Pick report:

```
## crisp-variants: <target> - picked <id>

**Stop reason:** PICKED c
**Deleted:** Hero.variant-b.tsx, Hero.variant-c.tsx, switcher in app/pricing/page.tsx
**Dead-code check:** 0 matches for variant markers
**Diff vs abc1234:** 1 file changed, +34 -41 (src/components/Hero.tsx)
**Detector:** 0   **Build:** pass
Next: <command> - <why>
```

## Self-check before delivery

- [ ] Every thesis is one line and names a bet, not a style word
- [ ] Every pair differs on >= 2 axes, written in the report
- [ ] Slop and detector results are quoted from this run
- [ ] Production build grep run, result quoted
- [ ] After the pick: dead-code grep prints nothing and the diff stat is shown
- [ ] Zero em dashes in the report and in any variant copy

## Longitudinal tracking

<!-- crisp:shared history -->
**Top-level runs only.** Write `## History` lines and `crisp critique write` snapshots only when the user invoked this skill directly. When another skill calls it (`/crisp-loop`, `/crisp-proof`, `/crisp-variants`, or a CRISP Live session), skip both writes and hand the result back to the caller, because the caller writes one line for the whole run and nested writes would multiply entries (a five-iteration loop would otherwise log six lines). `## Decisions` lines are not affected: they record what the user said, whoever ran the skill.
<!-- /crisp:shared history -->

Append one line to `## History` in `.crisp.md` if it exists, after the pick. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-variants | [surface] | [N] variants, picked [id]: [thesis]
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

- READY TO COMPARE: `/crisp-variants pick <id>` once the user chooses - never choose for them
- A variant was picked: `/crisp-proof` for the before and after
- The picked variant still shows issues: `/crisp-review`
- NOT ENOUGH DISTINCT VARIANTS: `/crisp-worlds` when the problem is direction, not one component
- NO SWITCH POINT or GUARD UNPROVEN: `/crisp-variants` again once the user names the render site or the env flag
- REVERTED: `/crisp-review` on the original to decide what to change instead
