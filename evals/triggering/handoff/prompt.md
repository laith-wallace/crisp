---
description: Triggering - a natural request that should make Claude choose the handoff skill without naming it.
tags: [triggering]
expected_outcome: Claude invokes the handoff skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

This confirm-delete modal passed design review. Turn it into a spec engineering can build from - every component state, token references, edge cases, and the accessibility checklist. The modal: title "Delete project?", body naming the project and saying it can't be undone, a secondary Cancel button and a red Delete project button, closes on Escape.
