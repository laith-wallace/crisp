---
name: crisp-loop
description: Bounded review-fix-review loop - runs /crisp-review, triages every finding as must-fix or overthinking, fixes the must-fix P0s and P1s, and runs a second pass only when the first found a P0 or the fixes touched new files. Two passes by default, then it stops and reports the trend, with any P0 left named as a blocker. Use for 'keep fixing until it's good', 'get this screen to an A', or to land a batch of design fixes with a measured result instead of a hope.
metadata:
  version: "1.1.0"
  author: Laith Wallace - FlowConverts
  adapted-from: greptileai/skills greploop (loop shape, MIT) - reviewer swapped for /crisp-review and the crisp detector
---

# /crisp-loop - Review, Fix, Repeat, Stop

One review finds the problems. One fix pass introduces new ones or leaves half of them standing. This skill runs the cycle a fixed, small number of times and stops. A reviewer told to find problems will always report some, so looping toward a grade rewards invented findings. Two passes with a triage step land the real fixes and leave the rest for a person.

Load `.crisp.md` if it exists. Its register decides how `/crisp-review` grades; its History section is where the loop's one summary line lands.

## Inputs

| Input | Default | Notes |
|---|---|---|
| Target | required | A file, directory, route, or URL naming one surface |
| `--target-grade` | `B` | `A` or `B`. Both require zero P0; `A` also requires zero P1 |
| `--max-iterations` | `2` | Hard cap on review-fix cycles. Raise it only when the user asks, never above `5` |
| `--reviewer` | `self` | Who runs the review: `self`, or a frontier model from a different lab than the builder (`codex`, `gemini`, or another CLI on PATH). Cross-lab is the default inside an AGENTS.md Ship beat when one is available |
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
2. Run `/crisp-review` on the target with the detector output folded in.
3. Record for this iteration: grade, P0 count, P1 count, the top 3 issue titles, detector finding count.

### B. Exit check

Stop the loop when any one is true, and say which:

| Condition | Stop reason |
|---|---|
| Grade ≥ target and P0 = 0 (and P1 = 0 when target is A) | `TARGET MET` |
| Iteration 1 is done, it found zero P0, and its fixes touched no file outside the files it reviewed | `ONE PASS ENOUGH` - a second pass would only find what the first called overthinking |
| Iteration = `--max-iterations` | `CAP REACHED` - any P0 left is listed as a blocker for a person |
| The top 3 issues are identical to the previous iteration's top 3 | `STALLED` - the fixes are not landing; report and hand back |
| A fix would require editing outside scope | `SCOPE BLOCKED` - name the file and the issue, hand back |

`STALLED` is not a failure of the skill. It is the loop telling you the problem is not where you are allowed to edit, or the review is inconsistent. Either way a person decides next.

### C. Triage, then fix

Rate every finding 1 to 10 on two axes: how often it would happen to a real user, and how bad it would be when it did. Then ask one question of each: "Is this a real must-fix issue or overthinking?" Write the verdict next to it. Overthinking is dropped, not deferred, and the report lists it so a person can disagree.

Fix only the must-fix P0 and P1 issues, highest frequency times severity first. P2 and P3 are not fixed inside the loop.

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
- Never run extra passes to chase the grade. The cap is the exit; leftover P0s go to a person.
- Never edit `.crisp.md` to change the register so the grade improves.
- Never widen scope to reach a fix. Report `SCOPE BLOCKED`.
- Never count a review that did not cite file:line for its P0s and P1s. Re-run it.

## Report

Print after the loop exits, whatever the reason:

```
## crisp-loop: [target]

**Stop reason:** TARGET MET   (or ONE PASS ENOUGH / CAP REACHED / STALLED / SCOPE BLOCKED - with one line of why)
**Grade:** C → B   **P0:** 2 → 0   **P1:** 4 → 1
**Iterations:** 2 of 2   **Reviewer:** codex (cross-lab)
**Start commit:** abc1234   **Scope:** src/routes/deals/+page.svelte, src/lib/DealTable.svelte

| Iter | Grade | P0 | P1 | Detector | Fixed |
|---|---|---|---|---|---|
| 1 | C | 2 | 4 | 3 | [R] optimistic filter, [C] empty state CTA, [P] promote 3 hero metrics |
| 2 | B | 0 | 1 | 0 | - target met |

**Triaged as overthinking** (not fixed; disagree and rerun if any is real)
- [S] P1 - card shadow depth inconsistent (freq 2, severity 2)

**Remaining**
- [C] P1 - breadcrumb missing on deal detail (src/routes/deals/[id]/+page.svelte:12) - out of scope

**Next:** /crisp-proof abc1234 → HEAD for the before/after pair
```

The `Remaining` list is every must-fix P0 and P1 still open, each with file:line. A P0 in it is a blocker: when the loop runs inside a PR workflow, it goes in the PR body for a person to decide. Empty is a valid list.

## Longitudinal tracking

<!-- crisp:shared history -->
**Top-level runs only.** Write `## History` lines and `crisp critique write` snapshots only when the user invoked this skill directly. When another skill calls it (`/crisp-loop`, `/crisp-proof`, `/crisp-variants`, or a CRISP Live session), skip both writes and hand the result back to the caller, because the caller writes one line for the whole run and nested writes would multiply entries (a five-iteration loop would otherwise log six lines). `## Decisions` lines are not affected: they record what the user said, whoever ran the skill.
<!-- /crisp:shared history -->

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`, never memory:

```
- [YYYY-MM-DD] | /crisp-loop | [start grade] → [end grade] in [N] iterations | [stop reason] | [surface]
```

Each iteration's `/crisp-review` is a nested call and writes no History line of its own; the per-iteration trend lives in the report table instead.
