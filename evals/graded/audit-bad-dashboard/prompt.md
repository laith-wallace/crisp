---
description: Graded - regression fixture bad-dashboard.md against crisp-audit. Expected findings mirror tests/expected/.
tags: [graded, crisp-audit]
expected_outcome: See the matching file in tests/expected/.
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
---

Give the analytics dashboard described in `bad-dashboard.md` a full, scored design audit - every dimension, severities, and a prioritised action plan. It's in the read-only fixture directory attached to this session (use Glob or Read to find it).
