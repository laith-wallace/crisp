---
name: crisp-3d
description: Run an immersive 3D website from idea to proof as one chain - brief, two references blended into one concept, a single scene where scroll moves the camera between chapter stops, the right medium chosen per object, a target-image loop per camera stop scored by a blind judge out of 10, then render, performance, accessibility and before/after checks. Calls the existing CRISP skills in order and holds the hand-offs, stop rules and 3D build rules between them. Use when "build a 3D website", "immersive landing page", "Three.js / WebGL site", "scroll-driven 3D scene", "make it feel like an experience, not a template", or "awwwards-level site". Not for one 3D effect inside an existing page (use /crisp-design-eng), a flat landing page that has to convert (use /crisp-funnel), or 3D product renders and video (use an image or video tool).
license: MIT
metadata:
  version: "1.0.0"
  author: Laith Wallace - FlowConverts
  adapted-from: Meng's Tracewood 3D website build video (workflow idea only) and the dream-loop idea (ashimala/dream-loop, idea only, no code read)
---

# /crisp-3d - One Scene, Built Toward a Target

A one-line prompt gives a generic 3D page. Two things fix that: references the agent can see, and a target picture it can be judged against. This skill chains the CRISP skills that already do each part, and adds the 3D rules none of them hold.

You are the manager. The agent builds. You choose the references, set the feel, and decide when it is good enough. This skill never makes those three calls for an attended user.

Load `.crisp.md` if it exists. If `/3d-website-builder` is installed, read it for shader, particle and GSAP recipes. This skill decides what to build and when it is done; that one is the recipe book.

## When to use / not use

| Use this | Use the neighbour instead |
|---|---|
| A whole site or landing page that is one 3D scene | One 3D hover or one canvas effect in an existing page -> `/crisp-design-eng` |
| "It must feel like an experience" | A page whose only job is conversion -> `/crisp-funnel` |
| A 3D build that "works but does not look right" | A flat UI that needs fixes -> `/crisp-loop` |

## Inputs

| Input | Default | Notes |
|---|---|---|
| What it is | required | One line: who it is for and what the visitor must feel |
| References | ask | 2 sites or captures. Without them, `/crisp-research` finds them in Phase 2 |
| `--target-score` | `8` | Target-loop exit score out of 10, per camera stop |
| `--max-rounds` | `12` | Hard cap on target-loop rounds per camera stop |
| `--time-box` | `4h` | Wall-clock budget for all target loops together. Tokens are spent fast here |
| `--stack` | inferred | `html` (one self-contained file) or the project's framework |

## The chain

Run the phases in order. Each phase writes a file the next phase reads. Skip a phase only when its file already exists and the user says it still holds.

| Phase | Skill | Writes | The next phase needs |
|---|---|---|---|
| 1 Brief | `/crisp-brief` | `.brief.md` | The feel in 3 words, the chapters, the one signature moment |
| 2 References | `/crisp-research` (3D / Immersive type) | `.research.md` | 2 references with screenshots, and one idea taken from each |
| 3 Concept | `/crisp-worlds` (`--refs`) | `DESIGN.md` | Palette, type, and the concept line ("a room that starts as a drawing") |
| 4 Scene plan | this skill | `.crisp/3d/plan.md` | Chapters as camera stops, the medium for every object |
| 5 Build | this skill + `/3d-website-builder` | the site | A page that loads at every camera stop |
| 6 Target loop | `/crisp-loop --target-image` per stop | `.crisp/loop/<stop>/` | A score at or above `--target-score`, or an honest stop reason |
| 7 Checks | `crisp render-check`, `/crisp-a11y`, perf budget | report rows | Zero P0 |
| 8 Proof | `/crisp-proof` | `.artifacts/proof/` | Same-camera pairs and the score trend |

## Phase 2 - references the agent can see

Links are not references. The agent must look at the pictures.

- With the Mobbin connector: search sections for "3D website" and the feel words, ask for screenshots, and save picks to one collection. Details are in `/crisp-research`.
- Without it: ask the user for 2 URLs or captures, then capture them yourself.
- Pick exactly 2. Write one idea taken from each, as a noun phrase: "line-drawn single room you move through", "warm daylight on physical materials".
- Never copy a reference's layout, copy, logo or models. Take one idea from each, then make a new thing.

## Phase 4 - the scene plan

Write `.crisp/3d/plan.md` before any 3D code. It has three parts.

**1. Camera stops.** The page scrolls like a normal page. Scroll moves only the camera. Each chapter is one stop in the same scene.

```
| Stop | Chapter | Camera position -> look-at | What the visitor sees | Interaction |
| 1 | Studio | (0,1.6,8) -> (0,1.2,0) | the room as a line drawing | none |
| 2 | Process | (3,1.4,2) -> (0,1,-2) | lines sweep into real surfaces | none |
| 3 | Services | (-2,1.5,1) -> (-3,1.4,-1) | sheets pinned to a board | click a sheet: it swings off and opens details |
```

**2. Medium per object.** Pick the medium per object before modelling. This did more for the look than added detail in every build this skill learned from. The full table is in `references/3d-build-rules.md`.

| Object kind | Medium |
|---|---|
| Room, furniture, anything the camera moves around or light falls on | Modelled geometry |
| Line drawing or blueprint layer | Edges built from the geometry, revealed by a soft sweep |
| Text on objects (prints, posters, labels) | Painted in code onto a canvas texture, so type stays sharp |
| Plants, hair, organic detail | Cut-out image on a plane, lifted from the target image |
| Light real-time cannot match | Painted into the surface as a texture (baked) |

**3. Budgets.** Write the numbers, then hold them.

| Budget | Limit |
|---|---|
| Real-time lights | 3 at most. Every light costs time on every pixel |
| Frame time | 60 fps or more on a laptop at every stop; the page lowers render resolution itself when it falls behind |
| Mobile | Every stop has its own camera framing at 375px; detail panels slide up from the bottom |
| First view | Readable text and the first stop before the full scene finishes loading |

## Phase 5 - build

Follow `references/3d-build-rules.md`. The rules that break builds most:

1. Every camera stop is reachable by URL (`?stop=3`) and freezes time when `?still` is set, so captures are repeatable.
2. The page sets `window.__sceneReady = true` after the first full frame at a stop. Captures wait for it.
3. A light probe (a one-time capture of the light in the room) is taken with only the objects that should light that stop visible.
4. Respect `prefers-reduced-motion`: jump between stops instead of flying.
5. All copy is real HTML text over or beside the canvas, so screen readers and search engines read it.

## Phase 6 - the target loop

The page working does not mean it looks good. "Make it better" is guessing. A target picture gives the agent something to aim at and a judge something to score.

For each camera stop, run:

```
/crisp-loop <url>?stop=<n>&still --target-image --target-score 8 --max-iterations 12
```

`/crisp-loop` makes the target image, captures the same camera each round, and asks a fresh judge for a score out of 10 and a list of what is still wrong. Rules that matter for 3D:

- Generate the target from a screenshot of the same stop. Same room, same camera. A target from a different angle cannot be compared.
- Most progress comes from light, not geometry: textures, a light probe, ambient occlusion, bloom, then baked light. Fix light before adding objects.
- When a stop feels empty, run the loop again on that stop with a furnished target, then build toward it piece by piece.
- After a change to one stop, re-capture every other stop. Shared light and probes break views you did not touch.
- Stop each loop at the score, the round cap, or the time box. Never loop until the judge is happy with no limit.

## Phase 7 - checks

| Check | Command or skill | Pass |
|---|---|---|
| Rendered layout | `npx @laith-wallace/crisp render-check "<url>?stop=<n>&still" --width 1280,375 --json` per stop | 0 findings, or each one fixed |
| Frame time | measured in the page (see build rules) at every stop, 1280 and 375 | within the Phase 4 budget |
| Accessibility | `/crisp-a11y` on the HTML layer | zero P0, keyboard reaches every interactive object |
| Reduced motion | load with `prefers-reduced-motion: reduce` | no camera flights, all content reachable |
| Build | the project's build and `tsc --noEmit` where present | passes |

## Phase 8 - proof

Run `/crisp-proof` with the first build as Before and the final as After. Each camera stop is a state row, captured with `?stop=<n>&still` at the same camera on both sides. Add the per-stop score trend from Phase 6.

## Binary rules

1. No 3D code before `.crisp/3d/plan.md` names every camera stop and the medium of every object.
2. Exactly 2 references, each with a seen screenshot and one named idea taken from it.
3. Every stop is reachable by URL and freezes with `?still`.
4. Every target-loop round compares the same camera to the same target.
5. The judge is a fresh sub-agent that sees only the target, the capture and the brief. Without one, the report says `Judge: degraded (same context)`.
6. Every loop has a numeric stop: score, round cap, and time box.
7. 3 real-time lights at most.
8. Every stop has a 375px camera framing.
9. All copy is HTML text, not text drawn only into the canvas.
10. The user picks the references, the concept, and when it is good enough. Headless runs state each pick as an assumption.

## Stop conditions

| Condition | Report |
|---|---|
| Every stop at or above `--target-score`, checks pass | `DONE` |
| A stop hits its round cap or the time box | `CAPPED` with the best score and the top 3 gaps for that stop |
| No image tool and no target image from the user | `NO TARGET` - Phase 6 falls back to `/crisp-loop` grade mode, and the report says so |
| Frame budget cannot be met without cutting a planned object | `BUDGET BLOCKED` - name the object and ask |

## Report

```
## crisp-3d: [site name]

**Status:** DONE   (or CAPPED / NO TARGET / BUDGET BLOCKED)
**Concept:** [one line]   **References:** [A] - [idea]; [B] - [idea]

| Stop | Chapter | Score start -> end | Rounds | 1280 fps | 375 fps | Render | Biggest change |
|---|---|---|---|---|---|---|---|
| 1 | Studio | 4.6 -> 8.1 | 11 | 72 | 58 | clean | baked light from target |
| 2 | Lounge | 4.9 -> 6.3 | 12 | 61 | 55 | clean | capped: sofa still reads flat |

**Remaining**
- Stop 2 - sofa silhouette reads flat against the target (.crisp/loop/stop-2/round-12.png)

**Next:** /crisp-proof for the before/after table
```

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
- [YYYY-MM-DD] | /crisp-3d | [N] stops, scores [start avg] -> [end avg] | [status] | [site]
```

The nested `/crisp-loop` and `/crisp-proof` runs write no History lines of their own.
