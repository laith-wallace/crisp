---
description: Triggering - a natural request that should make Claude choose the crisp-doctor skill without naming it.
tags: [triggering]
expected_outcome: Claude invokes the crisp-doctor skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

We just upgraded our design-review tooling to the newest version. Is our .crisp.md or .crisp/config.json stale, out of date, or missing anything it now expects?
