---
description: Negative triggering - an ordinary coding request where no CRISP skill should fire.
tags: [triggering, negative]
expected_outcome: Claude answers directly and invokes no CRISP skill.
max_turns: 5
timeout_seconds: 180
allowed_tools: [Read, Glob, Grep, Skill]
---

Why does this query return duplicate rows, and how do I fix it?

```sql
SELECT o.id, c.name FROM orders o JOIN customers c ON c.region = o.region;
```
