---
description: Graded - regression fixture janky-component.css against crisp-design-eng. Expected findings mirror tests/expected/.
tags: [graded, crisp-design-eng]
expected_outcome: See the matching file in tests/expected/.
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
---

The dropdown, modal, and cards in our settings page feel janky and the button feels dead. Review the stylesheet `janky-component.css` for motion and polish problems and run the mechanical pre-flight checks. It's in the read-only fixture directory attached to this session (use Glob or Read to find it). Report the problems with fixes; don't edit the file.
