---
name: crisp-brand
description: Turn a project's chosen look into a usable brand system, after asking one question first - is this a website or an app? Website route builds a /brand page in the project's own stack (logo rules, colour with contrast, type, voice, buttons). App route builds the design system (tokens file plus core components with every state) and one self-contained design-system.html that shows every token and component. Reads DESIGN.md from /crisp-worlds or /crisp-study and never invents a brand. Use when "make a brand page", "build our design system", "showcase our components", "brand guidelines page", "set up tokens and components", or right after a direction is picked. Not for choosing the look (use /crisp-worlds), extracting tokens from a reference (use /crisp-study), or restyling a live surface (use /crisp-redesign).
license: MIT
metadata:
  version: "1.0.0"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
  author: Laith Wallace
---

# /crisp-brand - Brand Page or Design System

A chosen direction is only useful once the team can see it and build with it. A website needs a `/brand` page that shows the brand to people. An app needs a design system that developers build with, and a page that shows it. This skill asks which one you are building, then builds that, from the tokens you already chose.

## When to use / not use

| Use this | Use the neighbour instead |
|---|---|
| A look is chosen (a DESIGN.md exists) and the team needs it in one place | No look yet -> `/crisp-worlds` |
| A website needs a public or internal `/brand` page | Copy a reference site's look into tokens -> `/crisp-study` |
| An app needs tokens, core components and a showcase page | Restyle a live surface to the tokens -> `/crisp-redesign` |
| Components drifted and need one source again | Spec one new feature -> `/feature-design` |

## Step 0: ask the route (always first)

Before reading files or writing anything, ask exactly one question and wait for the answer:

> What are you building?
> 1. **A website** - I build a `/brand` page in your site.
> 2. **An app** - I build the design system (tokens and components) and a `design-system.html` page that shows it.

- Ask even when the request seems to say which. If it does, ask as a confirmation: "You said website, so I will build the `/brand` page. Right?" One word back is enough.
- Product with both (a marketing site and an app): ask which to build first. Run the skill again for the other.
- No reply possible (headless run, sub-agent): stop with `WAITING: route`. Never guess the route.

## Inputs

| Input | Default | Notes |
|---|---|---|
| Route | asked in Step 0 | `website` or `app`. Never inferred |
| Token source | `DESIGN.md` at repo root | Else `DESIGN.worlds.md`, `DESIGN.study.md`, or the project's own token file (CSS variables, `@theme`, `tailwind.config.*`). None found: stop with `NO TOKENS` |
| Brand facts | `.crisp.md`, `.brief.md` | Name, logo files, voice. Missing facts are asked for once, in one message |
| `--out` | by route and stack | See the route steps. An existing file is overwritten only after the user says so |

## Steps

1. **Ask the route** (Step 0). Write the answer in the report's first line.
2. **Load the tokens.** Read the token source. List every token by role: colours, type styles, spacing, radius, shadow, motion. Note which have a dark value. If the project already has a token file in code, that file wins over DESIGN.md for values, and any difference between them goes in the report as drift.
3. **Load the brand facts.** From `.crisp.md` and `.brief.md`: the brand name, the logo files that exist in the repo (search for `logo`, `wordmark`, `mark` in svg, png and webp files), and the voice rules. Ask once for anything missing. Whatever is still missing after that is left out, never invented, and listed in the report.
4. **Detect the stack.** Next.js app router, Next.js pages router, Astro, SvelteKit, Vue or Nuxt, Vite with React, plain HTML, or Tailwind on top of any of them. Build in the stack and conventions the project already uses.
5. **Build the route** (below).
6. **Check.** Run the finish check below on the built page. Then the binary rules. Fix and re-check, at most 3 rounds.
7. **Report** in the format below, ending with the Next line.

### Website route: the `/brand` page

**Where:** the project's route for `/brand`: `app/brand/page.tsx`, `pages/brand.tsx`, `src/pages/brand.astro`, `src/routes/brand/+page.svelte`, or `brand/index.html`. Link it from the footer only if the user agrees.

**Sections, in this order.** Leave out a section that has no real material, and say so in the report:

1. **Name and one line.** The brand name and its one-line description from `.crisp.md` or the brief.
2. **Logo.** Each logo file that exists, on light and on dark grounds, with its clear space (the cap height of the wordmark, unless DESIGN.md sets one) and its minimum size. A download link for each file. Logo don'ts only when a logo file exists, drawn with the real file.
3. **Colour.** One swatch per colour token: role name, value (OKLCH and hex), and the text colour that reads on it, with the contrast ratio and AA pass or fail written out. Colours grouped by role: brand, surface, text, state.
4. **Type.** Each type style set in real copy from the brand, with its family, size, weight and line height. The pairing reason from DESIGN.md, in one sentence.
5. **Voice.** 3 to 5 do and don't pairs from the voice rules. With no voice rules, leave this section out; never write a voice for the client.
6. **Buttons and links.** The primary and secondary button and a text link, each in default, hover, focus and disabled, built from the real components when they exist.
7. **Imagery.** Only when DESIGN.md has imagery rules, with real examples from the repo.

**One source.** The page reads the project's tokens (CSS variables or the Tailwind theme). Zero colour, size or font values are typed into the page itself.

### App route: design system plus `design-system.html`

**Tokens.** One token file in the stack's format: `src/styles/tokens.css` as CSS custom properties (with a dark block when dark values exist), plus the Tailwind `@theme` or config mapping when Tailwind is present. If a token file already exists, update it in place and keep its names.

**Components.** The core set, built in the project's component folder and framework, each with every state it supports:

| Component | States |
|---|---|
| Button (primary, secondary, ghost, destructive) | default, hover, focus-visible, active, disabled, loading |
| Text input (with label, hint and error) | default, focus-visible, filled, error, disabled |
| Select, checkbox, radio, switch | default, focus-visible, checked or open, disabled |
| Card | default, linked with hover |
| Badge and alert | info, success, warning, danger |
| Modal or dialog | open, with focus trapped and Escape to close |
| Table row | default, hover, selected |
| Empty state | names what is missing and gives 1 action |

Reuse a component that already exists: restyle it to the tokens, never duplicate it. Build only what is missing.

**Showcase.** One self-contained `design-system.html` at the repo root (or in `docs/` when the repo has one): every token as a swatch or specimen with its name and value, and every component in every state from the table. It works offline: tokens inlined from the token file, no build step. Its first line is a comment naming the token file and the date it was generated, and how to regenerate it. With dark values, a light and dark toggle. Each state is labelled with its name, so a reviewer can find it.

## Binary rules

1. Zero routes guessed: the route came from the user's answer.
2. Zero invented tokens: every colour, type, spacing and radius value on the page traces to the token source.
3. Zero invented brand facts: no logo, voice line, tagline or history the files and the user did not give. Placeholders are listed in the report.
4. Website route: every colour swatch shows its value and a contrast ratio with AA pass or fail. Zero values typed into the page instead of read from tokens.
5. App route: the count of tokens in the showcase equals the count in the token file, and every component shows every state in its row of the table.
6. Every text and background pair on the page reaches 4.5:1 (3:1 for text 24px and up, or 18.66px bold and up).
7. The page passes the finish check: render-check exit 0, or `untested` with the reason.
8. Zero em dashes on the page.

## Stop conditions

| Condition | Stop reason |
|---|---|
| No answer to the route question | `WAITING: route` |
| No DESIGN.md and no token file | `NO TOKENS` - suggest `/crisp-worlds` (no look yet) or `/crisp-study .` (a look exists in the code) |
| The target file exists and the user has not approved overwrite | `WAITING: overwrite` |
| All binary rules pass | `DONE` |
| 3 check rounds used with rules still failing | `CAP REACHED` - list what fails |

## Output format

```
## crisp-brand: <project> - <website | app>

**Stop reason:** DONE
**Token source:** DESIGN.md (12 colours, 6 type styles, 5 spacing, 3 radius; dark values: yes)
**Built:** app/brand/page.tsx   (or: src/styles/tokens.css, 9 components, design-system.html)
**Contrast:** 18 pairs, 18 pass AA
**Finish check:** render-check exit 0 at 1280 and 375   (or: untested - <reason>)
**Left out:** Imagery (no rules in DESIGN.md), Voice (no voice rules given)
**Placeholders:** <omit if none>
**Drift:** <token file vs DESIGN.md differences, omit if none>

Next: <command> - <why>
```

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`:

`- YYYY-MM-DD | /crisp-brand | <website or app> | <stop reason> | <file built>`

## Finish check

<!-- crisp:shared finish-check -->
**Finish check.** Before you say a built or changed page is done, measure it as the browser draws it:

```bash
npx @laith-wallace/crisp render-check "<local url>" --width 1280,375 --shots .crisp/render
```

- Exit 0: clean. Say so in the report.
- Exit 2: findings. `page-overflow-x`, `overlapping-text`, `text-cut` and `text-spills` are bugs, never style choices. Fix them and run it again, at most 3 rounds.
- Exit 3 (inconclusive), exit 1 (no URL, no Playwright, or the page did not load), or no local URL to give it: report `render-check: untested` with the reason. Never report the page as checked.

Then open `.crisp/render/render-1280.png` and `.crisp/render/render-375.png` and look at them once against the taste rules. A clean exit code proves the layout holds, not that the page has taste.
<!-- /crisp:shared finish-check -->

For the app route's `design-system.html`, serve its folder first (`python3 -m http.server 4321`) and pass `http://localhost:4321/design-system.html` as the URL.

## Taste rules

<!-- crisp:shared taste -->
**Taste rules.** Each rule is a count, so a check can say pass or fail. Rules 1 to 7 apply when this skill makes or judges a rendered UI (a screen, a page, a component). The copy tells apply to all copy, prose included. Where this skill states a stricter limit for the same pattern, the stricter limit wins.

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
- **This file is always writable.** Appending to `.crisp/lessons.md` is allowed even in a skill that is otherwise read-only or limited to the target's files. It is the only such exception.
- **When the user corrects or rejects your output:** append 1 line to `.crisp/lessons.md` (create it if needed) in this shape:
  `- YYYY-MM-DD | <skill or all> | <what was wrong> | <the rule that would have prevented it>`
  Write the rule as a count or a yes/no check, so a later run can test it. One correction, one line. Never log praise, and never log a line the user did not cause.
- **Promote:** when the same rule appears 3 times, tell the user it is ready to move into the pack's shared taste rules (`skills/_shared/taste.md` in the CRISP repo).
<!-- /crisp:shared lessons -->

## Next step

End the report with one line, `Next: <command> - <why>`, picked from these by what this run found. Where the report template above has a **Next:** line, this is that line, never a second one:

- Website route, pages still in the old look: `/crisp-redesign` to apply the brand, or `/crisp-funnel` for a landing page
- App route, first screen to build: `/feature-design`
- App route, existing screens: `/crisp-improve-ui` to find where they drift from the tokens
- NO TOKENS: `/crisp-worlds`, or `/crisp-study .` when the look already lives in the code
- Built and checked: `/crisp-review` on the page
