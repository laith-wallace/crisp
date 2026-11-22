---
name: crisp-worlds
description: Show 3 genuinely different visual directions before any code is written, picked from a curated library of 30 worlds (each with an OKLCH palette, type pairing, layout grammar and real-world inspiration), next to the category default built on purpose as a baseline, in one local picker page with a Build this button per direction; the recommended direction borrows the best ideas from the others, and the chosen world becomes a linted DESIGN.md. With two references, it blends one idea from each into the recommendation. Use when "show me some directions", "what could this look like", "explore visual directions", "I don't want it to look like every other SaaS site", "moodboard this", or before a new product, homepage, rebrand or redesign has a look. Not for variants of one component in the real code (use /crisp-variants), extracting tokens from an existing site or screenshot (use /crisp-study), changing an existing surface (use /crisp-redesign), or building a landing page that converts (use /crisp-funnel).
license: MIT
metadata:
  version: "1.1.0"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
  author: Laith Wallace
---

# /crisp-worlds - Directions Before Code

The first idea an agent has for a new surface is the category default: the cloud-beige SaaS hero, the fintech blue gradient, three icon cards in a row. Arguing about it after it is built is expensive. This skill shows the default and three real alternatives side by side, before a line of product code exists, and turns the one the user picks into tokens the build can follow.

Directions come from a curated library, `worlds/*.md`, not from a blank prompt, because curated taste is more reliable than improvisation and every world has already passed contrast checks. List them with `npx @laith-wallace/crisp worlds list`.

## When to use / not use

| Use this | Use the neighbour instead |
|---|---|
| A new product, homepage, rebrand or redesign has no look yet | Three versions of one existing component in the codebase -> `/crisp-variants` |
| "Make it not look like every other X" | Copy the look of a site or screenshot into tokens -> `/crisp-study` |
| The team disagrees on direction and words are not settling it | Modernise an existing surface while keeping what works -> `/crisp-redesign` |
| Before `/feature-design` or `/crisp-redesign` overhaul mode | A landing page that has to convert -> `/crisp-funnel` |

## Inputs

| Input | Default | Notes |
|---|---|---|
| Surface | required | One surface: "the homepage", "the invoices dashboard". Ask once if missing |
| Register | from `.crisp.md` | `product` (app screens) or `brand` (marketing, editorial). Picks which worlds qualify |
| `--n` | `3` | Worlds besides the baseline, 2 to 4; the picker holds 5 cards at most |
| `--worlds` | chosen by fit | Force specific world ids, for example `--worlds ledger-book,swiss-timetable` |
| `--serve` | off | Run `crisp worlds serve` so Build this records the choice without copy and paste |
| `--refs` | from `.research.md` | Two references with one idea taken from each (the `REFERENCE BLEND` block `/crisp-research` writes). Enables the reference blend in step 5 |

## Steps

1. **Load context.** Read `.crisp.md` (register, users, Named Rules, `## Decisions`) and `.brief.md` if present. If both are missing, ask at most three questions in one message: what is it and for whom, which surface, and one product they admire or want to avoid. If there is no reply, see Headless below. State the register you will use and why in one line.
2. **Write the category default on purpose.** Name what a typical product in this category ships (for invoicing: centred hero, AI pill badge, icon cards, gradient metrics) and build it as direction `A`, `isBaseline: true`, title "Category default". It is a real option, rendered with the same care, so the cost of doing nothing is visible. Never present it as a straw man with broken layout.
3. **Shortlist worlds.** Run `crisp worlds list --register <register> --json`, and `--fights "<default>"` for the defaults you named in step 2. Pick 3 worlds that suit the brief. Every pair, and each against the baseline, must differ on at least 2 of: layout, type, colour, density (the same difference test as `/crisp-variants`). Write the pairwise axes down. Read each world in full with `crisp worlds show <id>` before using it.
4. **Render previews.** For each direction write one self-contained HTML document: the surface's hero plus one real product surface (the dashboard, a settings panel, a list), with the brief's real copy and plausible data. Use the world's tokens exactly (`crisp worlds show <id> --css` prints them as CSS variables plus the Google Fonts link). Follow its layout grammar and its three signature moves. Rules for preview markup are in `references/world-format.md`.
5. **Challenger pass.** Choose the direction you recommend. Look at the other directions for ideas that would make it stronger without breaking its world (a ledger's red-for-negatives rule, a receipt's dot leaders). Fold in at most 3, update its preview, and record each in `borrowedFrom` as `{from, what, why}`. The picker labels it "Improved by".
   **Reference blend.** With `--refs` or a `REFERENCE BLEND` block in `.research.md`, the recommended direction must carry the one idea taken from each reference, recorded in `borrowedFrom` with the reference name as `from`, and the concept line goes in its description. These two count toward the limit of 3. The world still owns the tokens: a reference gives an idea, never its palette, logo, copy or layout. For a 3D surface, render the preview as a still frame of the first camera stop in HTML and CSS, not WebGL, so the picker sandbox can show it.
6. **Write the spec and picker.** Save `.crisp/worlds/spec.json` (shape in `references/world-format.md`), then:
   ```bash
   npx @laith-wallace/crisp worlds picker .crisp/worlds/spec.json
   npx @laith-wallace/crisp worlds serve        # optional; loopback only
   ```
   Fix any validation error it prints and re-run. Give the user the path or URL and the one-line recommendation.
7. **Wait for the choice.** Stop here. The user clicks Build this (served: writes `.crisp/worlds/choice.json`; opened as a file: copies `build <id>` to paste back), or types "build B". Read it with `crisp worlds choice --json` (exit 3 means no choice yet). Never pick for an attended user.
8. **Hand off to DESIGN.md.** For a world direction:
   ```bash
   npx @laith-wallace/crisp worlds to-design-md <worldId> --out DESIGN.md
   npx @laith-wallace/crisp design-md lint DESIGN.md
   ```
   If `DESIGN.md` exists, write `DESIGN.worlds.md` and say so instead of overwriting. Add each `borrowedFrom` idea to its Do's and Don'ts by hand. If the baseline was chosen, write no DESIGN.md and say the category default stands.
9. **Build and prove.** Hand over to `/crisp-redesign` (existing surface, overhaul mode) or `/feature-design` (new surface) with DESIGN.md as the token source. After the build, `/crisp-proof` captures baseline vs chosen with `/crisp-review` grades on both sides.

## Headless and missing input

| Situation | What to do |
|---|---|
| No `.crisp.md`, no brief, no reply to the questions | Infer register from the request (a dashboard or settings is product, a homepage or campaign is brand), state the assumption, continue |
| No reply after the picker, or a non-interactive run | Pick the recommended direction yourself, write `choice.json` with `crisp worlds choice`-compatible fields (`{id, worldId, chosenAt}`) and `"auto": true`, and say "Recommended C recorded; reply build A/B/D to switch" |
| No world fits the brief | Use the 2 closest, say which axis is a stretch, and never invent a world inline; propose a new world file instead |
| Browser unavailable | The picker is still a file; give the path. Previews are HTML, so no screenshot is required |
| The surface already has a DESIGN.md the team likes | Stop: this skill is for choosing a direction, and one is chosen. Suggest `/crisp-tune` or `/crisp-redesign` |

## Binary rules

1. Exactly one baseline, labelled "Category default", built on purpose, because without it the user cannot see what the alternatives buy them.
2. 2 to 4 world directions, from `worlds/` only, because uncurated directions bring back the defaults this skill exists to fight.
3. Every pair of directions differs on at least 2 of layout, type, colour and density, written in the report, because two near-identical options hide the real choice.
4. Every preview uses its world's tokens with zero off-token colours and shows a real product surface, not only a hero, because product screens are where most worlds succeed or fail.
5. Every preview passes the Slop Check, except the baseline, which is expected to show the tells it names.
6. At most one recommended direction, and its `borrowedFrom` lists each borrowed idea with a reason, because "improved" without a source is a claim, not evidence.
7. Previews are self-contained: inline CSS, no scripts, no external requests except Google Fonts, because the picker sandboxes them and blocks everything else.
8. No product source file is edited before a choice exists, because this skill decides direction and the build belongs to the next skill.
9. The DESIGN.md written in step 8 lints with 0 findings.

## Slop Check

Run on every world preview before the picker is written.

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

**Model overlay: Cursor.** Seed list, unverified: confirm with scripts/slop-harvest.mjs before trusting. Cursor runs several model families, so these are tells commonly attributed to its default component stack, not to one model. Until a harvest run confirms a row, a match is a note in the report, not a Fail.

| Tell | What it looks like | Nearest detector rule |
|------|--------------------|-----------------------|
| Untouched component-kit defaults | Zinc or slate neutrals, default radius, every surface wrapped in a bordered card | `nested-card-selector` (partial) |
| Card inside card | A `Card` component holding further bordered or shadowed panels | `nested-card-selector` |
| Icon-only buttons with no label | Icon buttons from the kit with no `aria-label` or visible text | `icon-button-no-label` |
| Blanket transitions | `transition-all` or `transition: all` on most interactive elements | `transition-all` |
<!-- /crisp:shared slop-tells -->

## Stop conditions

| Condition | Stop reason |
|---|---|
| Picker written, waiting for the user | `READY TO PICK` |
| Choice recorded and DESIGN.md linted | `CHOSEN <id>` |
| Headless run, recommendation recorded | `AUTO-CHOSEN <id>` |
| Fewer than 2 worlds pass the difference test and the Slop Check | `NOT ENOUGH DISTINCT DIRECTIONS` - say which failed and why |
| `crisp worlds picker` rejects the spec 3 times | `SPEC INVALID` - quote the errors |

## Output format

```
## crisp-worlds: <surface>

**Stop reason:** READY TO PICK
**Register:** product (from .crisp.md)
**Picker:** .crisp/worlds/index.html   (or http://127.0.0.1:4478/)

| Id | Direction | World | Differs from A on |
|---|---|---|---|
| A | Category default | - | - |
| B | Books an accountant would keep | ledger-book | layout, type, colour |
| C | Timetable of what is due (recommended) | swiss-timetable | layout, type, density |
| D | Invoice as receipt | thermal-receipt | layout, type, colour, density |

**Pairwise:** B vs C layout, type; B vs D layout, type, density; C vs D layout, type, colour
**Improved by:** C borrows B's red-for-overdue rule, D's dot leaders on totals
**Slop Check:** B pass, C pass, D pass (A shows 5 tells by design)

Pick in the page, or reply: build A | build B | build C | build D
```

After the choice: `**Stop reason:** CHOSEN C`, the DESIGN.md path and its lint line, and the `Next:` line from the Next step list below.

## Self-check before delivery

- [ ] The baseline is present, labelled, and honestly built
- [ ] Pairwise difference axes are written for every pair
- [ ] Every world id came from `crisp worlds list`
- [ ] Each preview shows the hero and one product surface with real copy
- [ ] `borrowedFrom` names the source direction and a reason for each idea
- [ ] The picker command ran and its output is quoted
- [ ] Zero em dashes in the report and preview copy

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists, after the choice. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-worlds | [surface] | [N] directions, chose [id] ([worldId or baseline])
```

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

End the report with one line, `Next: <command> - <why>`, picked from these by what this run found. It is the report's only next-step line: where the report template above has a **Next:** or `Ready for` line, write this line there instead. Where the report ends with Handover lines, put it directly above them.

- Waiting for the pick: `build <id>` - the user clicks Build this or types the choice
- The team needs the look in one place: `/crisp-brand` (it asks website or app)
- A landing or sales page: `/crisp-funnel`
- An existing site: `/crisp-redesign`, then `/crisp-proof` baseline vs chosen
- A feature: `/feature-design`
