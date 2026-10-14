# Shared blocks

Single source of truth for rules that more than one skill states. Each skill marks where a block goes:

```
<!-- crisp:shared severity -->
(filled in by npm run sync)
<!-- /crisp:shared severity -->
```

Edit the block here, never inside a skill. `npm run sync` rewrites every marked region from these files before copying skills to the platform folders. `npm run check` fails when any skill's copy has drifted from its block.

| Block | Used by |
|---|---|
| `severity.md` | /crisp-audit, /crisp-review, /crisp-stress |
| `grade-scale.md` | /crisp-audit, /crisp-review |
| `slop-tells.md` | /crisp-audit, /crisp-review, /crisp-redesign, /crisp-funnel, /crisp-improve-ui, /crisp-tune, /crisp-variants |
| `evidence-gate.md` | /crisp-audit, /crisp-review, /crisp-a11y, /crisp-ai |
| `decisions.md` | /crisp-audit, /crisp-review, /crisp-a11y, /crisp-ai, /crisp-improve-ui |

## Platform overlays

A block can carry a per-platform overlay named `[block].[platform].md`, where platform is `claude` (.claude), `codex` (.agents), `cursor` (.cursor) or `gemini` (.gemini). Sync appends the overlay inside the block's region in that platform's copy only, so `skills/` keeps the common list and each harness gets its own extra rows. `npm run check` compares platform copies against the overlaid text, so a stale overlay is drift.

| Overlay | Status |
|---|---|
| `slop-tells.claude.md`, `slop-tells.codex.md`, `slop-tells.cursor.md`, `slop-tells.gemini.md` | Seed lists, unverified. Confirm rows with `node scripts/slop-harvest.mjs evals/results/<timestamp>` before treating them as Fail conditions |

This folder has no `SKILL.md`, so sync never ships it as a skill.
