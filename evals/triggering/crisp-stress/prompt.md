---
description: Triggering - a natural request that should make Claude choose the crisp-stress skill without naming it.
tags: [triggering, new-skill]
expected_outcome: Claude invokes the crisp-stress skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

Throw worst-case data at our user table and tell me what breaks: 80-character names, zero rows, 10,000 rows, missing avatars, right-to-left text, and huge numbers in the usage column.
