---
description: Graded - regression fixture bad-dashboard.md against crisp-review. Expected findings mirror tests/expected/.
tags: [graded, crisp-review]
expected_outcome: See the matching file in tests/expected/.
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
---

Quick sanity check: grade the analytics dashboard described in `bad-dashboard.md` and give me the top issues. It's in the read-only fixture directory attached to this session (use Glob or Read to find it).
