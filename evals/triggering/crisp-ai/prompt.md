---
description: Triggering - a natural request that should make Claude choose the crisp-ai skill without naming it.
tags: [triggering]
expected_outcome: Claude invokes the crisp-ai skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

We're adding an assistant panel to our app: it streams answers, shows sources, and can take actions in the product on the user's behalf. How should we design the streaming, the error and retry states, and the confirmation before it acts?
