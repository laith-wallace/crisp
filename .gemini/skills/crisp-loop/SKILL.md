---
name: crisp-loop
description: Bounded review-fix-review loop - runs /crisp-review, fixes every P0 and P1 it names, re-reviews, and repeats until the target grade (default B with zero P0) or the iteration cap (default 5), then reports the trend. Use for 'keep fixing until it's good', 'get this screen to an A', or to land a batch of design fixes with a measured result instead of a hope.
metadata:
  version: "1.1.0"
  author: Laith Wallace - FlowConverts
  adapted-from: greptileai/skills greploop (loop shape, MIT) - reviewer swapped for /crisp-review and the crisp detector; benjitaylor/skills stageshow (MIT - blind check before TARGET MET, fix order, rendered checks)
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

If the target is vague ("the app"), ask for one surface. Never loop over a whole product.

## Preconditions

Check all four before iteration 1. State the result in one line each.

1. `git status --porcelain` on the scope files is empty, or the user has said dirty is fine. Record `git rev-parse --short HEAD` as the start commit.
2. The scope list is written out - every file path the loop may edit. Zero edits outside it, ever.
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
- Zero edits outside the scope list.
- The build still passes after the fix (`npm run build` or the project's equivalent, and `tsc --noEmit` where present). A fix that breaks the build is reverted before the next review.

With `--commit`, one commit per iteration:

```
crisp-loop iteration N: [grade before] → [grade after], fixed [issue titles]
```

Without it, leave the working tree changed and say so.

### D. Back to A

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

**Next:** /crisp-proof abc1234 → HEAD for the before/after pair
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
