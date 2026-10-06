---
description: Triggering - a natural request that should make Claude choose the crisp-structure skill without naming it.
tags: [triggering]
expected_outcome: Claude invokes the crisp-structure skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

Stripe customer creation is copy-pasted across three of our server actions, and a bug fix in one of them never reached the other two. Where should that logic live, and how do we pull it out safely?
