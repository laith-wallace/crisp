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
| `severity.md` | /crisp-audit, /crisp-review |
| `grade-scale.md` | /crisp-audit, /crisp-review |
| `slop-tells.md` | /crisp-audit, /crisp-review |
| `evidence-gate.md` | /crisp-audit, /crisp-review, /crisp-a11y, /crisp-ai |
| `decisions.md` | /crisp-audit, /crisp-review, /crisp-a11y, /crisp-ai, /crisp-improve-ui |

This folder has no `SKILL.md`, so sync never ships it as a skill.
