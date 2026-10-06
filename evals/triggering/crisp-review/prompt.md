---
description: Triggering - a natural request that should make Claude choose the crisp-review skill without naming it.
tags: [triggering]
expected_outcome: Claude invokes the crisp-review skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

Quick sanity check on this screen, just give it a grade and the top issues: a settings page with one Save button at the very bottom, three tabs of about 40 fields each, no section headings, and red error text that only shows up after you hit Save.
