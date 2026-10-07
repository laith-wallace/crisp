---
description: Graded - regression fixture duplicated-actions.ts against crisp-structure. Expected findings mirror tests/expected/.
tags: [graded, crisp-structure]
expected_outcome: See the matching file in tests/expected/.
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
---

Audit the code structure of `duplicated-actions.ts` - it holds three actions, a billing service, and two components. I want to know about duplicated mechanics and leaky services with line numbers, and what to extract first. Audit only, don't change anything. It's in the read-only fixture directory attached to this session (use Glob or Read to find it).
