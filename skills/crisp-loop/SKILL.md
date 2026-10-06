---
name: crisp-loop
description: Bounded review-fix-review loop - runs /crisp-review, fixes every P0 and P1 it names, re-reviews, and repeats until the target grade (default B with zero P0) or the iteration cap (default 5), then reports the trend. Use for 'keep fixing until it's good', 'get this screen to an A', or to land a batch of design fixes with a measured result instead of a hope.
user-invocable: true
version: "1.0.0"
metadata:
  author: Laith Wallace - FlowConverts
  adapted-from: greptileai/skills greploop (loop shape, MIT) - reviewer swapped for /crisp-review and the crisp detector
---

# /crisp-loop - Review, Fix, Repeat, Stop

One review finds the problems. One fix pass introduces new ones or leaves half of them standing. This skill runs the cycle until the surface meets a grade you named, and refuses to run forever.

Load `.crisp.md` if it exists. Its register decides how `/crisp-review` grades; its History section is where each iteration lands.

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
2. Run `/crisp-review` on the target with the detector output folded in.
3. Record for this iteration: grade, P0 count, P1 count, the top 3 issue titles, detector finding count.

### B. Exit check

Stop the loop when any one is true, and say which:

| Condition | Stop reason |
|---|---|
| Grade ≥ target and P0 = 0 (and P1 = 0 when target is A) | `TARGET MET` |
| Iteration = `--max-iterations` | `CAP REACHED` |
| The top 3 issues are identical to the previous iteration's top 3 | `STALLED` - the fixes are not landing; report and hand back |
| A fix would require editing outside scope | `SCOPE BLOCKED` - name the file and the issue, hand back |

`STALLED` is not a failure of the skill. It is the loop telling you the problem is not where you are allowed to edit, or the review is inconsistent. Either way a person decides next.

### C. Fix

Fix only the P0 and P1 issues named in this iteration's review, in impact order. P2 and P3 wait for the target to be met; then, if iterations remain, take P2s.

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

## Report

Print after the loop exits, whatever the reason:

```
## crisp-loop: [target]

**Stop reason:** TARGET MET   (or CAP REACHED / STALLED / SCOPE BLOCKED - with one line of why)
**Grade:** C → B   **P0:** 2 → 0   **P1:** 4 → 1
**Iterations:** 3 of 5
**Start commit:** abc1234   **Scope:** src/routes/deals/+page.svelte, src/lib/DealTable.svelte

| Iter | Grade | P0 | P1 | Detector | Fixed |
|---|---|---|---|---|---|
| 1 | C | 2 | 4 | 3 | [R] optimistic filter, [C] empty state CTA |
| 2 | C | 0 | 3 | 0 | [P] promote 3 hero metrics, [C] h2 hierarchy |
| 3 | B | 0 | 1 | 0 | - target met |

**Remaining**
- [C] P1 - breadcrumb missing on deal detail (src/routes/deals/[id]/+page.svelte:12) - out of scope

**Next:** /crisp-proof abc1234 → HEAD for the before/after pair
```

The `Remaining` list is every P0 and P1 still open, each with file:line. Empty is a valid list.

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`, never memory:

```
- [YYYY-MM-DD] | /crisp-loop | [start grade] → [end grade] in [N] iterations | [stop reason] | [surface]
```

Each iteration's `/crisp-review` also writes its own History line, so the trend inside the loop is visible without this summary.
