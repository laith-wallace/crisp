---
description: Negative triggering - an ordinary coding request where no CRISP skill should fire.
tags: [triggering, negative]
expected_outcome: Claude answers directly and invokes no CRISP skill.
max_turns: 5
timeout_seconds: 180
allowed_tools: [Read, Glob, Grep, Skill]
---

Convert this to YAML:

```json
{"name": "api", "replicas": 3, "ports": [80, 443]}
```
