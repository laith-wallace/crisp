---
description: Triggering - a natural request that should make Claude choose the feature-design skill without naming it.
tags: [triggering]
expected_outcome: Claude invokes the feature-design skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

We need to design a new feature: team admins want to bulk-invite members by uploading a CSV. Work out the user flow, which components to use, and the reasoning behind each decision.
