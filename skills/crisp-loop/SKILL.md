---
name: crisp-loop
description: Bounded review-fix-review loop - runs /crisp-review, fixes every P0 and P1 it names, re-reviews, and repeats until the target grade (default B with zero P0) or the iteration cap (default 5), then reports the trend. Target-image mode instead builds toward a picture of the finished look - a generated or supplied target from the same camera, scored out of 10 by a fresh judge each round until the target score, the cap or the time box. Use for 'keep fixing until it's good', 'get this screen to an A', 'it works but doesn't look right', 'make it look like this image', or to land a batch of design fixes with a measured result instead of a hope.
metadata:
  version: "1.2.0"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
  author: Laith Wallace - FlowConverts
  adapted-from: greptileai/skills greploop (loop shape, MIT) - reviewer swapped for /crisp-review and the crisp detector; benjitaylor/skills stageshow (MIT - blind check before TARGET MET, fix order, rendered checks); the dream-loop idea (ashimala/dream-loop, idea only, no code read) for target-image mode
---

# /crisp-loop - Review, Fix, Repeat, Stop

One review finds the problems. One fix pass introduces new ones or leaves half of them standing. This skill runs the cycle until the surface meets a grade you named, and refuses to run forever.

Load `.crisp.md` if it exists. Its register decides how `/crisp-review` grades; its History section is where the loop's one summary line lands.

## Inputs

| Input | Default | Notes |
|---|---|---|
| Target | required | A file, directory, route, or URL naming one surface |
| `--target-grade` | `B` | `A` or `B`. Both require zero P0; `A` also requires zero P1 |
| `--max-iterations` | `5` | Hard cap on review-fix cycles |
| `--scope` | inferred | Files allowed to change. Inferred as the files that render the target; state the list before iteration 1 |
| `--commit` | off | When on, one commit per iteration. Off leaves changes in the working tree |
| `--target-image` | off | Switch to target-image mode. Bare flag: generate the target. With a path: use that image as the target |
| `--target-score` | `8` | Target-image mode only. Exit score out of 10 |
| `--time-box` | none | Target-image mode only. Wall-clock limit, for example `2h`. Strongly advised: this mode spends tokens fast |

If the target is vague ("the app"), ask for one surface. Never loop over a whole product.

## Two modes

| Mode | Judge asks | Use when |
|---|---|---|
| Grade (default) | "How many P0 and P1 issues are left?" | The surface has clear faults: broken states, hierarchy, copy, accessibility |
| Target image | "How close is this capture to the target picture, out of 10?" | It works but does not look right: light, mood, material, fullness. Common in 3D, brand and editorial surfaces |

Target-image mode replaces steps A and B of the iteration with the steps in Target-Image Mode below. Preconditions, scope, fix rules, and Never still apply.

## Preconditions

Check all four before iteration 1. State the result in one line each.

1. `git status --porcelain` on the scope files is empty, or the user has said dirty is fine. Record `git rev-parse --short HEAD` as the start commit.
2. The scope list is written out - every file path the loop may edit. Zero edits outside it, ever. The loop's own outputs are logs and tool output, not edits: `.crisp/lessons.md`, `.crisp/render/`, `.crisp/loop/<slug>/` in target-image mode, and on a top-level run the one `## History` line in `.crisp.md` and the `.crisp/critique/` snapshot.
3. `.crisp.md` is loaded, or its absence is declared and the register is inferred from the target.
4. The target renders: a dev server answers, or the files parse. A loop over a broken build fixes nothing.

## The iteration

Repeat at most `--max-iterations` times.

### A. Review

1. Run the detector on the scope files - exact, fast, first:
   ```bash
   npx @laith-wallace/crisp detect --json <scope files>
   ```
2. When the target renders at a URL, measure it - the detector reads code, this reads what the browser drew:
   ```bash
   npx @laith-wallace/crisp render-check "<url>" --width 1280,375 --json
   ```
   Each P1 finding (`overlapping-text`, `text-cut`, `text-spills`, `page-overflow-x`) counts as a P1 issue for the exit check. Exit 3 is `inconclusive`: record it, never count it as clean.
3. Run `/crisp-review` on the target with the detector and render-check output folded in.
4. Record for this iteration: grade, P0 count, P1 count, the top 3 issue titles, detector finding count, render-check finding count.

### B. Exit check

Stop the loop when any one is true, and say which:

| Condition | Stop reason |
|---|---|
| Grade ≥ target and P0 = 0 (and P1 = 0 when target is A), and the blind check below found no new P0 or P1 | `TARGET MET` |
| Iteration = `--max-iterations` | `CAP REACHED` |
| The top 3 issues are identical to the previous iteration's top 3 | `STALLED` - the fixes are not landing; run one blind review, then report and hand back |
| A fix would require editing outside scope | `SCOPE BLOCKED` - name the file and the issue, hand back |

**Blind check before `TARGET MET`.** The reviewer that graded every iteration has watched every fix and now shares the fixer's blind spots. Before stopping on `TARGET MET`, run one blind review:

<!-- crisp:shared blind-review -->
## Blind Review

The person who built a change is the worst judge of it, because they know what it was meant to look like. A blind reviewer judges the picture.

1. **Give the reviewer five things only:** the captures, the live URL when one exists, the one-line brief, the closest reference capture (`.crisp.md` `## Benchmarks` `ref:` line, or the Before), and the `/crisp-review` checklist. Never the builder's plan, reasons, fix list, or report.
2. **Use a fresh sub-agent** via the Agent tool when one exists. Without one, say `Blind review: degraded (same context)` in the report. A silent degraded run is not a blind review.
3. **The bar for a finding is a capture.** Every finding names the capture file that shows it. A predicted failure is not a finding, and a predicted pass is not a pass: when a needed capture does not exist (a state, a width, a hover, a mid-transition frame), the reviewer captures it or lists it under `Not checked`.
4. **The reviewer's first question:** put the target beside the reference and say the one biggest difference.
5. **Re-judge what the builder called intentional.** A finding the builder waved off is open until the reviewer looks at the capture and agrees.
6. **The reviewer does not fix.** It returns a ranked list, or `nothing` plus the list of captures it looked at.
<!-- /crisp:shared blind-review -->

If it returns a P0 or P1, that list becomes the next iteration's review and the loop goes on (it still counts against the cap). If it returns `nothing` or only P2/P3, stop on `TARGET MET`.

`STALLED` is not a failure of the skill. It is the loop telling you the problem is not where you are allowed to edit, or the review is inconsistent. Either way a person decides next.

### C. Fix

Fix only the P0 and P1 issues named in this iteration's review. P2 and P3 wait for the target to be met; then, if iterations remain, take P2s.

<!-- crisp:shared fix-order -->
## Fix Order

Severity (P0-P3) says what matters. This order says what to fix first inside one severity, because a later fix is wasted when an earlier layer moves:

1. **Layout and framing** - overflow, cut or overlapping text, a crop that hides the point, empty bands
2. **Hierarchy and density** - what the eye lands on first, competing weights, filler where the subject belongs
3. **States and motion** - missing states, jumps, exits that skip
4. **Polish** - spacing, alignment, icon and type details

Rank a finding by how much of the screen it spoils, never by how easy it is to fix. Fix the largest visible fault, re-capture, then look again from the top: one fix often moves the next fault.
<!-- /crisp:shared fix-order -->

Per fix, binary:
- Cite the file:line the review cited. No location, no fix - ask the review to be specific instead.
- Use the specialist's rules when the issue is in their domain: `/crisp-a11y` for accessibility, `/crisp-copy` for strings, `/crisp-design-eng` for motion and component craft (its `references/component-craft.md` has the code fixes). Do not reinvent them.
- Zero new dependencies. Zero suppression comments (`crisp-disable`) to make the detector pass - a suppression needs a reason and the user's approval, outside the loop.
- Zero edits outside the scope list (the loop's own outputs in Preconditions item 2 are logs and tool output, not edits).
- The build still passes after the fix (`npm run build` or the project's equivalent, and `tsc --noEmit` where present). A fix that breaks the build is reverted before the next review.

With `--commit`, one commit per iteration:

```
crisp-loop iteration N: [grade before] → [grade after], fixed [issue titles]
```

Without it, leave the working tree changed and say so.

### D. Back to A

## Target-Image Mode

A surface can pass every check and still look flat. "Make it better" with no target is guessing. This mode gives the loop a picture to aim at and a judge who scores against it.

### T1. Make the target (once)

1. Capture the surface at one fixed view: one URL, one width, one scroll position or camera stop, time frozen when the page supports it. Save as `.crisp/loop/<slug>/start.png`. This exact view is used for every round.
2. If `--target-image <path>` was given, copy it to `.crisp/loop/<slug>/target.png` and skip to step 4.
3. Generate the target with the image tool the session has (an image-generation MCP or CLI), using `start.png` as the reference image. Prompt: the finished version of this exact view - same layout or room, same camera, same framing - plus the feel words from `.brief.md` or `DESIGN.md`. Never ask for a new composition. With no image tool, ask the user for a target image once. With no answer, fall back to grade mode and report `NO TARGET`.
4. Show the target to an attended user and wait for "yes" or a change. The target sets the direction, so the user owns it. Headless: record `Target: auto-accepted`.

### T2. Each round

1. Make the change. Follow Fix Order, and fix the judge's top gap first.
2. Capture the same view as `start.png`, saved as `round-NN.png`. Wait for the page's ready signal (for example `window.__sceneReady`) before capturing.
3. Judge it. A fresh sub-agent gets only `target.png`, `round-NN.png`, and the one-line brief. Never the round number, earlier scores, earlier captures, or what changed. It returns:
   ```
   Score: [0-10, one decimal]
   Gaps: [ranked list, biggest first, each a visible difference, for example "window light is green haze; target shows warm daylight"]
   ```
   Without a sub-agent, write `Judge: degraded (same context)` in the report.
4. Append `{round, score, gaps, capture}` to `.crisp/loop/<slug>/scores.json`.
5. If the capture shows a render-check P1 (overlap, cut text, page overflow), fix that first, whatever the score.

### T3. Exit check

| Condition | Stop reason |
|---|---|
| Score at or above `--target-score` | `TARGET MET` |
| Round = `--max-iterations` | `CAP REACHED` |
| `--time-box` used up | `TIME BOX` |
| Score rose by less than 0.25 over the last 3 rounds | `STALLED` - change approach (another medium, baked light, a cut-out from the target), or hand back |
| A fix needs a file outside scope | `SCOPE BLOCKED` |

### T4. Rules for this mode

- Same view every round. A capture from another width, scroll position, or camera is not comparable, and that round does not count.
- Re-capture any other views that share code with this one (shared light, shared CSS, shared setup) before reporting. A gain here can break a view you did not touch.
- The target is a direction, not a spec. Never copy pixels from it, except a cut-out the user approved (for example a plant lifted from the target into the page).
- Light, material, and fullness first, geometry and layout second. Most score gains come from light.
- Report the score trend, not only the end score.

Report table for this mode:

```
| Round | Score | Top gap | Change made |
|---|---|---|---|
| 1 | 4.6 | flat light, no shadows | added textures and a light probe |
| 4 | 6.2 | windows read as green haze | outside image plus low-opacity glass |
| 11 | 8.1 | - target met | baked light difference into floor texture |
```

## Never

- Never lower the target mid-loop to finish. If the target is unreachable within the cap, `CAP REACHED` is the honest answer.
- Never edit `.crisp.md` to change the register so the grade improves.
- Never widen scope to reach a fix. Report `SCOPE BLOCKED`.
- Never count a review that did not cite file:line for its P0s and P1s. Re-run it.

<!-- crisp:shared never-intentional -->
## Never Intentional

These `crisp render-check` findings are bugs, never style choices: `page-overflow-x`, `overlapping-text`, `text-cut`, `text-spills`. Each one is drawn on a real screen at a real width.

- **Fix the cause, then re-capture.** A finding that is still there after a fix is still open.
- **Clearing a finding by hiding it is a new bug.** `display: none`, `overflow: hidden` added to mask a spill, removing the text, shrinking the type under 12px, or a narrower `--select` all count as hiding.
- **The only other exit is the user.** A finding the user rules on in words goes to `.crisp.md` `## Decisions`. Never write that line on your own initiative.
- **Clean is not good.** `clean` means the layout measured clean. It says nothing about hierarchy, copy, or whether the design works.
<!-- /crisp:shared never-intentional -->

## Report

Print after the loop exits, whatever the reason:

```
## crisp-loop: [target]

**Stop reason:** TARGET MET   (or CAP REACHED / STALLED / SCOPE BLOCKED - with one line of why)
**Grade:** C → B   **P0:** 2 → 0   **P1:** 4 → 1
**Iterations:** 3 of 5
**Start commit:** abc1234   **Scope:** src/routes/deals/+page.svelte, src/lib/DealTable.svelte

| Iter | Grade | P0 | P1 | Detector | Render | Fixed |
|---|---|---|---|---|---|---|
| 1 | C | 2 | 4 | 3 | 2 | [R] optimistic filter, [C] empty state CTA |
| 2 | C | 0 | 3 | 0 | 0 | [P] promote 3 hero metrics, [C] h2 hierarchy |
| 3 | B | 0 | 1 | 0 | 0 | - target met; blind check: nothing new |

**Remaining**
- [C] P1 - breadcrumb missing on deal detail (src/routes/deals/[id]/+page.svelte:12) - out of scope

Next: <command> - <why>
```

The `Remaining` list is every P0 and P1 still open, each with file:line. Empty is a valid list.

<!-- crisp:shared handover -->
## Handover Lines

End every report with these four lines. Each is a list or `none`; never omit a line.

```
Captured: [widths, themes, states and interactions you actually saw]
Not checked: [what you did not see, and why - "none" only when the Captured line covers every row of the evidence matrix]
Assumptions: [what you took as true without checking]
Unresolved: [findings still open, each with file:line or capture file]
```

An empty, failed, or `inconclusive` capture goes under `Not checked`, never under `Captured`. Ten green checks on a capture you did not look at are still not checked.
<!-- /crisp:shared handover -->

## Longitudinal tracking

<!-- crisp:shared history -->
**Top-level runs only.** Write `## History` lines and `crisp critique write` snapshots only when the user invoked this skill directly. When another skill calls it (`/crisp-loop`, `/crisp-proof`, `/crisp-variants`, or a CRISP Live session), skip both writes and hand the result back to the caller, because the caller writes one line for the whole run and nested writes would multiply entries (a five-iteration loop would otherwise log six lines). `## Decisions` lines are not affected: they record what the user said, whoever ran the skill.
<!-- /crisp:shared history -->

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`, never memory:

```
- [YYYY-MM-DD] | /crisp-loop | [start grade] → [end grade] in [N] iterations | [stop reason] | [surface]
```

Each iteration's `/crisp-review` is a nested call and writes no History line of its own; the per-iteration trend lives in the report table instead.

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

- TARGET MET: `/crisp-stress`, then `/crisp-proof`
- CAP REACHED with P0 left: `/crisp-audit` for the full picture
- CAP REACHED with no P0 left: `/crisp-proof`
- STALLED or SCOPE BLOCKED: the user decides; name the file or issue, and offer `/crisp-audit`
- TIME BOX: `/crisp-loop` again with a longer `--time-box`, or `/crisp-proof` for what landed
